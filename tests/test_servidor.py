"""Testes de integração das contas, sessões e arquivos protegidos, sem dados reais."""
import http.client
import json
from pathlib import Path
import tempfile
import threading
import unittest

from servidor import Servidor, conectar


class AutenticacaoTest(unittest.TestCase):
    def setUp(self):
        self.temporario = tempfile.TemporaryDirectory()
        self.servidor = Servidor(('127.0.0.1', 0), Path(self.temporario.name) / 'teste.sqlite3')
        self.thread = threading.Thread(target=self.servidor.serve_forever, daemon=True)
        self.thread.start()
        self.cookie = ''
        self.origem = f'http://127.0.0.1:{self.servidor.server_port}'

    def tearDown(self):
        self.servidor.shutdown()
        self.servidor.server_close()
        self.thread.join()
        self.temporario.cleanup()

    def requisitar(self, rota, dados=None, origem=None):
        conexao = http.client.HTTPConnection('127.0.0.1', self.servidor.server_port, timeout=10)
        headers = {'Cookie': self.cookie}
        corpo = None
        if dados is not None:
            corpo = json.dumps(dados)
            headers.update({'Content-Type': 'application/json', 'X-Ybyra-Request': '1', 'Origin': origem or self.origem})
        conexao.request('POST' if dados is not None else 'GET', rota, corpo, headers)
        resposta = conexao.getresponse()
        status, cabecalhos, corpo = resposta.status, dict(resposta.getheaders()), resposta.read()
        conexao.close()
        return status, cabecalhos, corpo

    def cadastrar(self):
        status, headers, _ = self.requisitar('/api/cadastrar', {'email': 'aluno@example.com', 'senha': 'UmaSenhaDeTeste123'})
        self.assertEqual(status, 200)
        self.cookie = headers['Set-Cookie'].split(';')[0]
        return headers

    def test_paginas_dados_e_fotos_exigem_login(self):
        for pagina in ('/', '/index.html', '/analise.html', '/resultado.html', '/historia.html', '/sobre.html', '/especies.html'):
            status, headers, corpo = self.requisitar(pagina)
            self.assertEqual(status, 303)
            self.assertTrue(headers['Location'].startswith('/conta.html?proximo='))
            self.assertEqual(corpo, b'')
        for arquivo in ('/dados/especies.json', '/assets/equipe/equipe-visita.jpg', '/css/%2e%2e/dados/especies.json', '/css/%2e%2e/assets/equipe/equipe-trilha.jpg'):
            self.assertEqual(self.requisitar(arquivo)[0], 401)
        self.assertEqual(self.requisitar('/conta.html')[0], 200)

    def test_icones_e_manifesto_publicos(self):
        for arquivo, tipo in (('favicon.ico', 'image/x-icon'), ('favicon.svg', 'image/svg+xml'), ('site.webmanifest', 'application/manifest+json')):
            status, headers, corpo = self.requisitar('/assets/marca/' + arquivo)
            self.assertEqual(status, 200)
            self.assertEqual(headers['Content-Type'], tipo)
            self.assertTrue(corpo)
        manifesto = json.loads(self.requisitar('/assets/marca/site.webmanifest')[2])
        for icone in manifesto['icons']:
            self.assertEqual(self.requisitar('/assets/marca/' + icone['src'])[0], 200)

    def test_cadastro_hash_e_cookie_http_only(self):
        headers = self.cadastrar()
        self.assertIn('HttpOnly', headers['Set-Cookie'])
        self.assertIn('SameSite=Lax', headers['Set-Cookie'])
        with conectar(self.servidor.banco) as banco:
            conta = banco.execute('SELECT * FROM usuarios').fetchone()
            self.assertNotEqual(conta['senha_hash'], 'UmaSenhaDeTeste123')
            self.assertEqual(len(conta['sal']), 32)
            self.assertEqual(len(conta['senha_hash']), 64)
        self.assertEqual(self.requisitar('/index.html')[0], 200)
        self.assertEqual(self.requisitar('/dados/especies.json')[0], 200)
        self.assertEqual(self.requisitar('/assets/equipe/equipe-trilha.jpg')[0], 200)
        self.assertEqual(json.loads(self.requisitar('/api/sessao')[2])['usuario']['email'], 'aluno@example.com')

    def test_sair_invalida_cookie_e_login_retorna(self):
        self.cadastrar()
        cookie_antigo = self.cookie
        self.assertEqual(self.requisitar('/api/sair', {})[0], 200)
        self.assertEqual(self.requisitar('/index.html')[0], 303)
        self.assertIsNone(json.loads(self.requisitar('/api/sessao')[2])['usuario'])
        self.assertEqual(self.requisitar('/api/entrar', {'email': 'ALUNO@EXAMPLE.COM', 'senha': 'incorreta'})[0], 401)
        status, headers, _ = self.requisitar('/api/entrar', {'email': 'ALUNO@EXAMPLE.COM', 'senha': 'UmaSenhaDeTeste123'})
        self.assertEqual(status, 200)
        self.assertNotEqual(headers['Set-Cookie'].split(';')[0], cookie_antigo)

    def test_sessao_expirada_ou_inventada_e_rejeitada(self):
        self.cadastrar()
        with conectar(self.servidor.banco) as banco:
            banco.execute('UPDATE sessoes SET expira = 0')
        self.assertEqual(self.requisitar('/analise.html')[0], 303)
        self.cookie = 'ybyra_sessao=inventada'
        self.assertEqual(self.requisitar('/dados/especies.json')[0], 401)

    def test_origem_externa_e_rejeitada(self):
        self.cadastrar()
        self.assertEqual(self.requisitar('/api/sair', {}, origem='https://externo.example')[0], 403)
        self.assertEqual(self.requisitar('/index.html')[0], 200)

    def test_email_repetido_e_senha_curta(self):
        self.assertEqual(self.requisitar('/api/cadastrar', {'email': 'aluno@example.com', 'senha': '123'})[0], 400)
        self.cadastrar()
        self.assertEqual(self.requisitar('/api/cadastrar', {'email': 'ALUNO@EXAMPLE.COM', 'senha': 'OutraSenha123'})[0], 409)

    def test_senhas_de_8_a_11_caracteres_nao_criam_conta_nova(self):
        for senha in ('Antiga12', '12345678901'):
            self.assertEqual(self.requisitar('/api/cadastrar', {'email': 'aluno@example.com', 'senha': senha})[0], 400)
        with conectar(self.servidor.banco) as banco:
            self.assertEqual(banco.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0], 0)

    def test_limite_de_tentativas(self):
        for _ in range(15):
            self.assertEqual(self.requisitar('/api/entrar', {'email': 'invalido', 'senha': ''})[0], 400)
        self.assertEqual(self.requisitar('/api/entrar', {'email': 'invalido', 'senha': ''})[0], 429)

    def test_arquivos_fora_da_pasta_publica_nao_sao_servidos(self):
        for caminho in ('/servidor.py', '/%2e%2e/servidor.py', '/.dados-locais/ybyra.sqlite3', '/js/configuracao.js'):
            self.assertEqual(self.requisitar(caminho)[0], 404)


if __name__ == '__main__':
    unittest.main()
