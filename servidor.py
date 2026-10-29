"""Servidor local do ybyrá: arquivos do site, contas e sessões.

Execute: python servidor.py. A base de contas fica fora da pasta pública.
Este servidor é para desenvolvimento local; uma publicação exige HTTPS e
um servidor de aplicação apropriado, preservando a proteção destas rotas.
"""
import argparse
from contextlib import contextmanager
import hashlib
import hmac
import json
import mimetypes
import os
from pathlib import Path
import re
import secrets
import sqlite3
import threading
import time
from http.cookies import SimpleCookie, CookieError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, unquote, urlsplit

RAIZ = Path(__file__).resolve().parent
PUBLICO = RAIZ / 'sistema-agroflorestal'
ITERACOES = 600_000
DURACAO = 8 * 60 * 60
COOKIE = 'ybyra_sessao'


@contextmanager
def conectar(arquivo):
    conexao = sqlite3.connect(arquivo, timeout=10)
    conexao.row_factory = sqlite3.Row
    conexao.execute('PRAGMA foreign_keys = ON')
    try:
        with conexao:
            yield conexao
    finally:
        conexao.close()


def iniciar_banco(arquivo):
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    with conectar(arquivo) as banco:
        banco.executescript('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE,
                sal TEXT NOT NULL, senha_hash TEXT NOT NULL, criado INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessoes (
                token_hash TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL,
                expira INTEGER NOT NULL,
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            );
        ''')


def hash_senha(senha, sal):
    return hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), bytes.fromhex(sal), ITERACOES).hex()


class Servidor(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, endereco, banco):
        self.banco = banco
        self.tentativas = {}
        self.trava = threading.Lock()
        iniciar_banco(banco)
        super().__init__(endereco, Requisicao)


class Requisicao(BaseHTTPRequestHandler):
    # Não usamos o servidor de arquivos padrão: só arquivos permitidos são servidos.
    server_version = 'YbyraLocal'

    def log_message(self, formato, *args):
        # Não registra credenciais, e-mails, cookies ou parâmetros de URLs.
        pass

    def cabecalhos(self, status, tipo, tamanho=0, cookie=None, destino=None):
        self.send_response(status)
        self.send_header('Content-Type', tipo)
        self.send_header('Content-Length', str(tamanho))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://upload.wikimedia.org; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'")
        if cookie:
            self.send_header('Set-Cookie', cookie)
        if destino:
            self.send_header('Location', destino)
        self.end_headers()

    def json(self, status, dados, cookie=None):
        corpo = json.dumps(dados, ensure_ascii=False).encode('utf-8')
        self.cabecalhos(status, 'application/json; charset=utf-8', len(corpo), cookie)
        if self.command != 'HEAD':
            self.wfile.write(corpo)

    def token(self):
        try:
            cookies = SimpleCookie(self.headers.get('Cookie', ''))
            return cookies[COOKIE].value if COOKIE in cookies else ''
        except CookieError:
            return ''

    def usuario(self):
        token = self.token()
        if not token or len(token) > 100:
            return None
        resumo = hashlib.sha256(token.encode()).hexdigest()
        with conectar(self.server.banco) as banco:
            usuario = banco.execute('''SELECT usuarios.id, usuarios.email FROM sessoes
                JOIN usuarios ON usuarios.id = sessoes.usuario_id
                WHERE token_hash = ? AND expira > ?''', (resumo, int(time.time()))).fetchone()
        return dict(usuario) if usuario else None

    def cookie_sessao(self, token, duracao=DURACAO):
        cookie = f'{COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={duracao}'
        if os.getenv('YBYRA_COOKIE_SECURE') == '1':
            cookie += '; Secure'
        return cookie

    def criar_sessao(self, usuario_id):
        token = secrets.token_urlsafe(32)
        agora = int(time.time())
        with conectar(self.server.banco) as banco:
            banco.execute('DELETE FROM sessoes WHERE expira <= ?', (agora,))
            # Troca o identificador ao entrar, em vez de reutilizar uma sessão anterior.
            banco.execute('DELETE FROM sessoes WHERE token_hash = ?', (hashlib.sha256(self.token().encode()).hexdigest(),))
            banco.execute('INSERT INTO sessoes VALUES (?, ?, ?)', (hashlib.sha256(token.encode()).hexdigest(), usuario_id, agora + DURACAO))
        return self.cookie_sessao(token)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        rota = unquote(urlsplit(self.path).path)
        if rota == '/api/sessao':
            self.json(200, {'usuario': self.usuario(), 'verificacao_email': getattr(self, 'verificacao_email', False)})
            return
        if rota.startswith('/api/'):
            self.json(404, {'erro': 'Endereço não encontrado.'})
            return
        if rota == '/':
            rota = '/index.html'
        arquivo = (PUBLICO / rota.lstrip('/')).resolve()
        permitidas = {'.html', '.css', '.js', '.json', '.svg', '.jpg', '.jpeg', '.png', '.webp', '.ico', '.webmanifest'}
        if not arquivo.is_relative_to(PUBLICO.resolve()) or arquivo.suffix.lower() not in permitidas or not arquivo.is_file():
            self.json(404, {'erro': 'Arquivo não encontrado.'})
            return
        # HTML, dados e fotos da equipe ficam protegidos também no servidor.
        relativo = arquivo.relative_to(PUBLICO.resolve()).as_posix()
        protegido = (arquivo.suffix == '.html' and relativo != 'conta.html') or relativo.startswith(('dados/', 'assets/equipe/'))
        if protegido and not self.usuario():
            if arquivo.suffix == '.html':
                caminho = rota.lstrip('/') + ('?' + urlsplit(self.path).query if urlsplit(self.path).query else '')
                self.cabecalhos(303, 'text/plain', destino='/conta.html?proximo=' + quote(caminho, safe=''))
            else:
                self.json(401, {'erro': 'Entre na sua conta para continuar.'})
            return
        corpo = arquivo.read_bytes()
        tipo = {'.js': 'text/javascript', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json'}.get(arquivo.suffix, mimetypes.guess_type(str(arquivo))[0] or 'application/octet-stream')
        self.cabecalhos(200, tipo, len(corpo))
        if self.command != 'HEAD':
            self.wfile.write(corpo)

    def mesma_origem(self):
        origem = self.headers.get('Origin', '')
        configurada = os.getenv('YBYRA_ORIGEM', '').rstrip('/')
        permitidas = {configurada} if configurada else {f'http://127.0.0.1:{self.server.server_port}', f'http://localhost:{self.server.server_port}'}
        return origem in permitidas and self.headers.get('X-Ybyra-Request') == '1'

    def limitar(self, rota):
        agora = time.monotonic()
        chave = (self.client_address[0], rota)
        with self.server.trava:
            self.server.tentativas = {k: v for k, v in self.server.tentativas.items() if v[-1] > agora - 900}
            anteriores = [t for t in self.server.tentativas.get(chave, []) if t > agora - 900]
            if len(anteriores) >= 15:
                return False
            self.server.tentativas[chave] = anteriores + [agora]
            return True

    def do_POST(self):
        rota = urlsplit(self.path).path
        if rota not in {'/api/entrar', '/api/cadastrar', '/api/sair'}:
            self.json(404, {'erro': 'Endereço não encontrado.'})
            return
        if not self.mesma_origem():
            self.json(403, {'erro': 'Recarregue a página e tente novamente.'})
            return
        if rota == '/api/sair':
            with conectar(self.server.banco) as banco:
                banco.execute('DELETE FROM sessoes WHERE token_hash = ?', (hashlib.sha256(self.token().encode()).hexdigest(),))
            self.json(200, {'ok': True}, self.cookie_sessao('', 0))
            return
        if not self.limitar(rota):
            self.json(429, {'erro': 'Muitas tentativas. Aguarde 15 minutos e tente novamente.'})
            return
        try:
            tamanho = int(self.headers.get('Content-Length', '0'))
            if tamanho <= 0 or tamanho > 4096 or self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                raise ValueError()
            dados = json.loads(self.rfile.read(tamanho))
            if not isinstance(dados, dict):
                raise ValueError()
            email = dados.get('email', '')
            senha = dados.get('senha', '')
            if not isinstance(email, str) or not isinstance(senha, str):
                raise ValueError()
            email = email.strip().casefold()
            if len(email) > 254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or not 1 <= len(senha) <= 128:
                raise ValueError()
        except (ValueError, UnicodeDecodeError, TypeError):
            self.json(400, {'erro': 'Confira o e-mail e a senha informados.'})
            return
        if rota == '/api/cadastrar':
            if len(senha) < 12:
                self.json(400, {'erro': 'Use uma senha com pelo menos 12 caracteres.'})
                return
            sal = secrets.token_hex(16)
            resumo = hash_senha(senha, sal)
            try:
                with conectar(self.server.banco) as banco:
                    cursor = banco.execute('INSERT INTO usuarios(email, sal, senha_hash, criado) VALUES (?, ?, ?, ?)', (email, sal, resumo, int(time.time())))
                    usuario_id = cursor.lastrowid
            except sqlite3.IntegrityError:
                self.json(409, {'erro': 'Não foi possível criar esta conta. Se já possui cadastro, use Entrar.'})
                return
        else:
            with conectar(self.server.banco) as banco:
                registro = banco.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
            # Faz o mesmo trabalho de hash mesmo quando a conta não existe.
            resumo = hash_senha(senha, registro['sal'] if registro else '00' * 16)
            if not registro or not hmac.compare_digest(resumo, registro['senha_hash']):
                self.json(401, {'erro': 'E-mail ou senha incorretos.'})
                return
            usuario_id = registro['id']
        self.json(200, {'usuario': {'id': usuario_id, 'email': email}}, self.criar_sessao(usuario_id))


def main():
    argumentos = argparse.ArgumentParser(description='ybyrá: servidor local com login obrigatório')
    argumentos.add_argument('--port', type=int, default=8765)
    argumentos.add_argument('--banco', type=Path, default=RAIZ / '.dados-locais' / 'ybyra.sqlite3')
    argumentos.add_argument('--producao', action='store_true', help='Testa localmente a integração Supabase, sem SQLite')
    opcoes = argumentos.parse_args()
    if opcoes.producao:
        from auth_producao import RequisicaoProducao, configuracao
        configuracao()
        servidor = ThreadingHTTPServer(('127.0.0.1', opcoes.port), RequisicaoProducao)
    else:
        servidor = Servidor(('127.0.0.1', opcoes.port), opcoes.banco.resolve())
    print(f'ybyrá disponível em http://127.0.0.1:{servidor.server_port}', flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()


if __name__ == '__main__':
    main()
