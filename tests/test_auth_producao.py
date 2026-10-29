"""Contrato HTTP da Vercel, com respostas do provedor simuladas e sem dados reais."""

import http.client
from http.server import ThreadingHTTPServer
import json
import os
import threading
import unittest
from unittest.mock import patch

from auth_producao import FalhaAuth, RequisicaoProducao, supabase


class ProducaoTest(unittest.TestCase):
    def setUp(self):
        self.ambiente = patch.dict(
            os.environ,
            {
                "SUPABASE_URL": "https://teste.supabase.co",
                "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_teste",
                "YBYRA_ORIGEM": "https://ybyra.example",
                "VERCEL": "1",
            },
        )
        self.ambiente.start()
        self.provedor = patch("auth_producao.supabase")
        self.auth = self.provedor.start()
        self.servidor = ThreadingHTTPServer(("127.0.0.1", 0), RequisicaoProducao)
        self.thread = threading.Thread(target=self.servidor.serve_forever, daemon=True)
        self.thread.start()
        self.cookie = ""
        self.usuario = {
            "id": "usuario-teste",
            "email": "aluno@example.com",
            "email_confirmed_at": "2026-10-29T00:00:00Z",
        }

    def tearDown(self):
        self.servidor.shutdown()
        self.servidor.server_close()
        self.thread.join()
        self.provedor.stop()
        self.ambiente.stop()

    def requisitar(self, rota, dados=None, origem="https://ybyra.example"):
        conexao = http.client.HTTPConnection("127.0.0.1", self.servidor.server_port, timeout=10)
        headers = {"Cookie": self.cookie}
        corpo = None
        if dados is not None:
            corpo = json.dumps(dados)
            headers.update(
                {"Content-Type": "application/json", "X-Ybyra-Request": "1", "Origin": origem}
            )
        conexao.request("POST" if dados is not None else "GET", rota, corpo, headers)
        resposta = conexao.getresponse()
        resultado = resposta.status, dict(resposta.getheaders()), resposta.read()
        conexao.close()
        return resultado

    def test_cadastro_nao_conecta_e_reenvia_sem_expor_existencia(self):
        self.auth.return_value = {"id": "usuario-teste"}
        status, headers, corpo = self.requisitar(
            "/api/cadastrar", {"email": " ALUNO@EXAMPLE.COM ", "senha": "SenhaDeTeste123"}
        )
        self.assertEqual(status, 202)
        self.assertNotIn("Set-Cookie", headers)
        self.assertTrue(json.loads(corpo)["verificacao_pendente"])
        self.auth.assert_called_with(
            "signup", {"email": "aluno@example.com", "password": "SenhaDeTeste123"}
        )
        self.assertEqual(self.requisitar("/index.html")[0], 303)
        self.assertEqual(self.requisitar("/api/reenviar", {"email": "aluno@example.com"})[0], 202)
        self.auth.assert_called_with("resend", {"type": "signup", "email": "aluno@example.com"})

    def test_confirmacao_e_login_com_cookie_seguro(self):
        self.auth.return_value = {"user": self.usuario}
        status, headers, _ = self.requisitar("/api/confirmar", {"token_hash": "a" * 64})
        self.assertEqual(status, 200)
        self.assertNotIn("Set-Cookie", headers)
        self.auth.assert_called_with("verify", {"token_hash": "a" * 64, "type": "email"})
        self.auth.return_value = {
            "user": self.usuario,
            "access_token": "jwt-teste",
            "expires_in": 3600,
        }
        status, headers, corpo = self.requisitar(
            "/api/entrar", {"email": "aluno@example.com", "senha": "SenhaDeTeste123"}
        )
        self.assertEqual(status, 200)
        self.assertNotIn("jwt-teste", corpo.decode())
        for atributo in ("HttpOnly", "SameSite=Lax", "Secure", "Max-Age=3600"):
            self.assertIn(atributo, headers["Set-Cookie"])
        self.cookie = headers["Set-Cookie"].split(";")[0]
        self.auth.return_value = self.usuario
        self.assertEqual(self.requisitar("/index.html")[0], 200)
        self.assertEqual(self.requisitar("/dados/especies.json")[0], 200)
        self.auth.assert_called_with("user", token="jwt-teste")
        self.assertTrue(json.loads(self.requisitar("/api/sessao")[2])["verificacao_email"])

    def test_usuario_nao_confirmado_e_token_expirado_nao_acessam(self):
        self.cookie = "ybyra_sessao=jwt-teste"
        self.auth.return_value = {**self.usuario, "email_confirmed_at": None}
        self.assertEqual(self.requisitar("/dados/especies.json")[0], 401)
        self.auth.side_effect = FalhaAuth(401)
        self.assertEqual(self.requisitar("/index.html")[0], 303)

    def test_confirmacao_por_codigo_enviado_ao_email(self):
        self.auth.return_value = {"user": self.usuario}
        status, headers, _ = self.requisitar(
            "/api/confirmar", {"email": " ALUNO@EXAMPLE.COM ", "codigo": "123456"}
        )
        self.assertEqual(status, 200)
        self.assertNotIn("Set-Cookie", headers)
        self.auth.assert_called_with(
            "verify", {"email": "aluno@example.com", "token": "123456", "type": "email"}
        )
        self.assertEqual(
            self.requisitar("/api/confirmar", {"email": "aluno@example.com", "codigo": "12345678"})[
                0
            ],
            200,
        )
        self.auth.assert_called_with(
            "verify", {"email": "aluno@example.com", "token": "12345678", "type": "email"}
        )
        self.auth.reset_mock()
        for codigo in ("", "12345", "1234567", 123456, "abcdef"):
            self.assertEqual(
                self.requisitar("/api/confirmar", {"email": "aluno@example.com", "codigo": codigo})[
                    0
                ],
                400,
            )
        self.auth.assert_not_called()

    def test_login_nao_confirmado_ou_senha_errada(self):
        for codigo, esperado in [("email_not_confirmed", 403), ("invalid_credentials", 401)]:
            self.auth.side_effect = FalhaAuth(400, codigo)
            status, headers, _ = self.requisitar(
                "/api/entrar", {"email": "aluno@example.com", "senha": "SenhaDeTeste123"}
            )
            self.assertEqual(status, esperado)
            self.assertNotIn("Set-Cookie", headers)

    def test_link_expirado_ou_reutilizado_e_rejeitado(self):
        self.auth.side_effect = FalhaAuth(403, "otp_expired")
        status, _, corpo = self.requisitar("/api/confirmar", {"token_hash": "a" * 64})
        self.assertEqual(status, 400)
        self.assertIn("expirou", json.loads(corpo)["erro"])
        self.auth.reset_mock()
        self.assertEqual(self.requisitar("/api/confirmar", {"token_hash": "invalido"})[0], 400)
        self.auth.assert_not_called()

    def test_origem_externa_e_rejeitada_antes_do_provedor(self):
        self.assertEqual(
            self.requisitar(
                "/api/cadastrar",
                {"email": "aluno@example.com", "senha": "SenhaDeTeste123"},
                origem="https://externo.example",
            )[0],
            403,
        )
        self.auth.assert_not_called()

    def test_senha_nova_tem_minimo_12_sem_bloquear_login_antigo(self):
        for senha in ("12345678", "12345678901"):
            self.assertEqual(
                self.requisitar("/api/cadastrar", {"email": "aluno@example.com", "senha": senha})[
                    0
                ],
                400,
            )
        self.auth.assert_not_called()
        self.auth.return_value = {"id": "novo"}
        self.assertEqual(
            self.requisitar(
                "/api/cadastrar", {"email": "aluno@example.com", "senha": "Frase nova 12"}
            )[0],
            202,
        )
        self.auth.return_value = {
            "user": self.usuario,
            "access_token": "jwt-antigo",
            "expires_in": 3600,
        }
        self.assertEqual(
            self.requisitar("/api/entrar", {"email": "aluno@example.com", "senha": "Antiga12"})[0],
            200,
        )
        self.auth.assert_called_with(
            "token?grant_type=password", {"email": "aluno@example.com", "password": "Antiga12"}
        )

    def test_codigo_preserva_zeros_e_nao_conecta_automaticamente(self):
        self.auth.return_value = {"user": self.usuario}
        status, headers, _ = self.requisitar(
            "/api/confirmar", {"email": "aluno@example.com", "codigo": "00123456"}
        )
        self.assertEqual(status, 200)
        self.auth.assert_called_with(
            "verify", {"email": "aluno@example.com", "token": "00123456", "type": "email"}
        )
        self.assertNotIn("Set-Cookie", headers)

    def test_tipos_de_dados_invalidos_nao_chegam_ao_provedor(self):
        for dados in (
            [],
            None,
            {"email": 123, "senha": "UmaSenhaDeTeste123"},
            {"email": "aluno@example.com", "senha": 123},
            {"email": "aluno@example.com", "senha": "x" * 129},
        ):
            if dados is None:
                continue
            self.assertEqual(self.requisitar("/api/cadastrar", dados)[0], 400)
        self.auth.assert_not_called()

    def test_json_quebrado_e_payload_grande_sao_rejeitados(self):
        for corpo in ("{invalido", "x" * 4097):
            c = http.client.HTTPConnection("127.0.0.1", self.servidor.server_port, timeout=10)
            c.request(
                "POST",
                "/api/entrar",
                corpo,
                {
                    "Origin": "https://ybyra.example",
                    "Content-Type": "application/json",
                    "X-Ybyra-Request": "1",
                },
            )
            r = c.getresponse()
            self.assertEqual(r.status, 400)
            r.read()
            c.close()
        self.auth.assert_not_called()

    def test_requisicao_sem_origem_ou_marcador_e_rejeitada(self):
        for headers in ({"Origin": "https://ybyra.example"}, {"X-Ybyra-Request": "1"}):
            c = http.client.HTTPConnection("127.0.0.1", self.servidor.server_port, timeout=10)
            c.request(
                "POST", "/api/reenviar", "{}", {**headers, "Content-Type": "application/json"}
            )
            r = c.getresponse()
            self.assertEqual(r.status, 403)
            r.read()
            c.close()
        self.auth.assert_not_called()

    def test_senha_fraca_e_email_pendente_recebem_orientacao(self):
        self.auth.side_effect = FalhaAuth(422, "weak_password")
        status, headers, corpo = self.requisitar(
            "/api/cadastrar", {"email": "aluno@example.com", "senha": "UmaSenhaDeTeste123"}
        )
        self.assertEqual(status, 400)
        self.assertNotIn("Set-Cookie", headers)
        self.assertIn("12 caracteres", json.loads(corpo)["erro"])
        self.auth.side_effect = FalhaAuth(400, "email_not_confirmed")
        status, headers, corpo = self.requisitar(
            "/api/entrar", {"email": "aluno@example.com", "senha": "UmaSenhaDeTeste123"}
        )
        self.assertEqual(status, 403)
        self.assertTrue(json.loads(corpo)["verificacao_pendente"])
        self.assertNotIn("Set-Cookie", headers)

    def test_sem_configuracao_nao_usa_sqlite(self):
        with patch.dict(os.environ, {"SUPABASE_URL": ""}):
            self.assertEqual(self.requisitar("/api/sessao")[0], 503)
        self.auth.assert_not_called()

    def test_confirmacao_desativada_no_painel_falha_fechada(self):
        self.auth.return_value = {"user": self.usuario, "access_token": "nao-deve-vazar"}
        status, headers, corpo = self.requisitar(
            "/api/cadastrar", {"email": "aluno@example.com", "senha": "SenhaDeTeste123"}
        )
        self.assertEqual(status, 503)
        self.assertNotIn("Set-Cookie", headers)
        self.assertNotIn("nao-deve-vazar", corpo.decode())

    def test_logout_revoga_no_provedor_e_remove_cookie(self):
        self.cookie = "ybyra_sessao=jwt-teste"
        self.auth.return_value = {}
        status, headers, _ = self.requisitar("/api/sair", {})
        self.assertEqual(status, 200)
        self.assertIn("Max-Age=0", headers["Set-Cookie"])
        self.auth.assert_called_with("logout?scope=local", {}, "jwt-teste")

    def test_limite_e_indisponibilidade_nao_vazam_detalhes(self):
        for status in (429, 503):
            self.auth.side_effect = FalhaAuth(status, "detalhe-privado")
            recebido, _, corpo = self.requisitar("/api/reenviar", {"email": "aluno@example.com"})
            self.assertEqual(recebido, status)
            self.assertNotIn("detalhe-privado", corpo.decode())

    def test_arquivos_publicos_e_bloqueio_de_fontes(self):
        self.assertEqual(self.requisitar("/conta.html")[0], 200)
        for caminho in (
            "/auth_producao.py",
            "/.env",
            "/supabase/migrations/202610290001_contas.sql",
            "/sistema-agroflorestal/index.html",
            "/assets/../dados/especies.json",
        ):
            self.assertIn(self.requisitar(caminho)[0], {401, 404})


class TransporteTest(unittest.TestCase):
    @patch.dict(
        os.environ,
        {
            "SUPABASE_URL": "https://teste.supabase.co",
            "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_teste",
            "YBYRA_ORIGEM": "https://ybyra.example",
        },
    )
    @patch("auth_producao.urlopen")
    def test_rest_nao_utiliza_chave_administrativa(self, abrir):
        abrir.return_value.__enter__.return_value.read.return_value = b'{"id":"teste"}'
        self.assertEqual(supabase("user", token="jwt-teste"), {"id": "teste"})
        requisicao = abrir.call_args.args[0]
        self.assertEqual(requisicao.full_url, "https://teste.supabase.co/auth/v1/user")
        self.assertEqual(requisicao.get_header("Authorization"), "Bearer jwt-teste")
        self.assertEqual(requisicao.get_header("Apikey"), "sb_publishable_teste")


if __name__ == "__main__":
    unittest.main()
