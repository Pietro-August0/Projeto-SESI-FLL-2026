"""Autenticação gerenciada no Supabase; nenhuma conta é gravada na Vercel."""

import base64
import hashlib
import json
import os
import re
import secrets
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen

from servidor import Requisicao, TAMANHO_PAGINA

COOKIE_GOOGLE = "ybyra_google"
PAGINAS_RETORNO = {
    "/analise.html", "/resultado.html", "/conta.html", "/explorar.html",
    "/especies.html", "/historia.html", "/sobre.html",
}


def destino_google(valor):
    caminho = valor.partition("?")[0]
    if caminho in PAGINAS_RETORNO and len(valor) <= 512 and not re.search(r"[^!-~]|[\\#]", valor):
        return valor
    return "/analise.html"


class FalhaAuth(Exception):
    def __init__(self, status, codigo=""):
        self.status = status
        self.codigo = codigo


def configuracao():
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    chave = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    origem = os.getenv("YBYRA_ORIGEM", "").rstrip("/")
    if (
        urlsplit(url).scheme != "https"
        or not urlsplit(url).netloc
        or not chave
        or not origem
        or urlsplit(origem).path
        or urlsplit(origem).query
        or urlsplit(origem).fragment
        or urlsplit(origem).scheme not in {"https", "http"}
    ):
        raise FalhaAuth(503, "configuracao")
    if os.getenv("VERCEL") and urlsplit(origem).scheme != "https":
        raise FalhaAuth(503, "configuracao")
    return url, chave, origem


def supabase(caminho, dados=None, token=None, *, recurso="auth/v1", preferencia=None):
    url, chave, _ = configuracao()
    headers = {"apikey": chave, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    if preferencia:
        headers["Prefer"] = preferencia
    requisicao = Request(
        f"{url}/{recurso}/{caminho}",
        data=json.dumps(dados).encode() if dados is not None else None,
        headers=headers,
        method="POST" if dados is not None else "GET",
    )
    try:
        with urlopen(requisicao, timeout=8) as resposta:
            corpo = resposta.read()
            return json.loads(corpo) if corpo else {}
    except HTTPError as erro:
        try:
            detalhe = json.loads(erro.read())
            codigo = detalhe.get("error_code") or detalhe.get("code", "")
        except (ValueError, AttributeError):
            codigo = ""
        raise FalhaAuth(erro.code, codigo) from None
    except (URLError, TimeoutError, OSError, ValueError):
        raise FalhaAuth(503, "indisponivel") from None


class RequisicaoProducao(Requisicao):
    """Usa o Supabase para autenticação e histórico privado."""

    server_version = "Ybyra"
    verificacao_email = True

    def google_ativo(self):
        return os.getenv("YBYRA_GOOGLE_ATIVO") == "1"

    def cookie_google(self, valor, duracao):
        cookie = f"{COOKIE_GOOGLE}={valor}; Path=/api/google; HttpOnly; SameSite=Lax; Max-Age={duracao}"
        if os.getenv("YBYRA_ORIGEM", "").startswith("https://"):
            cookie += "; Secure"
        return cookie

    def iniciar_google(self):
        if not self.google_ativo():
            self.json(404, {"erro": "Login com Google indisponível."})
            return
        consulta = parse_qs(urlsplit(self.path).query)
        destino = destino_google(consulta.get("proximo", [""])[0])
        retorno = base64.urlsafe_b64encode(destino.encode("utf-8")).decode("ascii").rstrip("=")
        verificador = secrets.token_urlsafe(48)
        digest = hashlib.sha256(verificador.encode("ascii")).digest()
        desafio = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
        url, _, origem = configuracao()
        parametros = urlencode({
            "provider": "google", "redirect_to": origem + "/api/google/retorno",
            "code_challenge": desafio, "code_challenge_method": "s256",
        })
        self.json(200, {"url": f"{url}/auth/v1/authorize?{parametros}"},
                  self.cookie_google(f"{verificador}.{retorno}", 600))

    def concluir_google(self):
        _, _, origem = configuracao()
        if not self.google_ativo():
            self.json(404, {"erro": "Login com Google indisponível."})
            return
        cookie = self.ler_cookie(COOKIE_GOOGLE)
        limpeza = self.cookie_google("", 0)
        dados_cookie = re.fullmatch(r"([A-Za-z0-9_-]{64})\.([A-Za-z0-9_-]{1,3072})", cookie)
        destino = "/analise.html"
        if dados_cookie:
            try:
                valor = dados_cookie[2]
                destino = destino_google(base64.urlsafe_b64decode(valor + "=" * (-len(valor) % 4)).decode())
            except ValueError:
                dados_cookie = None
        parametros = parse_qs(urlsplit(self.path).query)
        codigo = parametros.get("code", [""])[0]
        if dados_cookie and re.fullmatch(r"[A-Za-z0-9_-]{1,128}", codigo):
            try:
                resultado = supabase("token?grant_type=pkce", {
                    "auth_code": codigo, "code_verifier": dados_cookie[1],
                })
                usuario = resultado.get("user", {})
                if not (usuario.get("email_confirmed_at") and usuario.get("id") and
                        usuario.get("email") and resultado.get("access_token")):
                    raise FalhaAuth(403)
                sessao = self.cookie_sessao(
                    resultado["access_token"], min(int(resultado.get("expires_in", 3600)), 3600)
                )
                self.cabecalhos(303, "text/plain", cookie=(limpeza, sessao), destino=origem + destino)
                return
            except FalhaAuth:
                pass
        retorno = urlencode({"google": "falhou", "proximo": destino})
        self.cabecalhos(303, "text/plain", cookie=limpeza, destino=origem + "/conta.html?" + retorno)

    def carregar_safs(self, usuario, identificador, inicio):
        consulta = {"usuario_id": "eq." + usuario["id"], "select": "id,criado_em,dados"}
        if identificador:
            consulta["id"] = "eq." + identificador
        else:
            consulta.update(order="criado_em.desc,id.asc", limit=TAMANHO_PAGINA + 1, offset=inicio)
        return supabase("safs?" + urlencode(consulta), token=self.token(), recurso="rest/v1")

    def gravar_saf(self, usuario, identificador, dados):
        supabase(
            "safs?on_conflict=usuario_id,id",
            {"id": identificador, "usuario_id": usuario["id"], "dados": dados},
            self.token(), recurso="rest/v1", preferencia="resolution=ignore-duplicates,return=minimal",
        )

    def cookie_sessao(self, token, duracao=3600):
        # O HTTP local é permitido somente para testar a integração fora da Vercel.
        cookie = super().cookie_sessao(token, duracao)
        if (
            os.getenv("VERCEL") or os.getenv("YBYRA_ORIGEM", "").startswith("https://")
        ) and "; Secure" not in cookie:
            cookie += "; Secure"
        return cookie

    def token(self):
        # JWTs são maiores que os tokens aleatórios usados no modo SQLite.
        token = super().token()
        return token if len(token) <= 4096 else ""

    def usuario(self):
        if hasattr(self, "_usuario"):
            return self._usuario
        self._usuario = None
        token = self.token()
        if token:
            try:
                usuario = supabase("user", token=token)
            except FalhaAuth as erro:
                if erro.status in {400, 401, 403}:
                    return None
                raise
            if usuario.get("email_confirmed_at") and usuario.get("id") and usuario.get("email"):
                self._usuario = {"id": usuario["id"], "email": usuario["email"]}
        return self._usuario

    def falha(self, erro):
        rota = urlsplit(self.path).path
        if erro.status == 429:
            self.json(
                429,
                {"erro": "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."},
            )
        elif rota == "/api/safs" and erro.status == 401:
            self.json(401, {"erro": "Entre novamente para acessar o histórico."})
        elif rota == "/api/safs" and (erro.status >= 500 or erro.codigo in {"PGRST205", "configuracao"}):
            self.json(503, {"erro": "O histórico está indisponível. Tente novamente em alguns minutos."})
        elif erro.status >= 500 or erro.codigo == "configuracao":
            # Não retorna mensagens do provedor, URLs internas ou credenciais.
            self.json(
                503,
                {
                    "erro": "O serviço de contas está indisponível. Tente novamente em alguns minutos."
                },
            )
        elif erro.codigo == "email_not_confirmed":
            self.json(
                403,
                {
                    "erro": "Confirme seu e-mail antes de entrar. Abra a aba Confirmar e-mail para inserir ou reenviar o código.",
                    "verificacao_pendente": True,
                },
            )
        elif erro.codigo in {"weak_password", "password_too_short"}:
            self.json(
                400,
                {
                    "erro": "Escolha uma senha mais longa e difícil de adivinhar, com pelo menos 12 caracteres."
                },
            )
        elif urlsplit(self.path).path == "/api/confirmar":
            self.json(
                400,
                {
                    "erro": "O código ou link de confirmação é inválido, expirou ou já foi utilizado. Solicite um novo e-mail."
                },
            )
        elif urlsplit(self.path).path == "/api/entrar":
            self.json(401, {"erro": "E-mail ou senha incorretos."})
        else:
            self.json(
                400,
                {
                    "erro": "Não foi possível concluir. Confira os dados ou tente novamente mais tarde."
                },
            )

    def do_GET(self):
        try:
            rota = urlsplit(self.path).path
            if rota == "/api/google/retorno" and self.command == "GET":
                self.concluir_google()
                return
            if rota in {"/api/sessao", "/api/safs"}:
                configuracao()
            super().do_GET()
        except FalhaAuth as erro:
            self.falha(erro)

    def do_POST(self):
        rota = urlsplit(self.path).path
        if rota not in {
            "/api/cadastrar",
            "/api/entrar",
            "/api/sair",
            "/api/reenviar",
            "/api/confirmar",
            "/api/safs",
            "/api/google/iniciar",
        }:
            self.json(404, {"erro": "Endereço não encontrado."})
            return
        try:
            configuracao()
            if not self.mesma_origem():
                self.json(403, {"erro": "Recarregue a página e tente novamente."})
                return
            if rota == "/api/safs":
                self.salvar_saf()
                return
            if rota in {"/api/google/iniciar", "/api/sair"}:
                try:
                    self.ler_json(opcional=True)
                except (ValueError, RecursionError):
                    self.json(400, {"erro": "Não foi possível ler a requisição."})
                    return
            if rota == "/api/google/iniciar":
                self.iniciar_google()
                return
            if rota == "/api/sair":
                token = self.token()
                if token:
                    try:
                        supabase("logout?scope=local", {}, token)
                    except FalhaAuth as erro:
                        if erro.status not in {401, 403}:
                            raise
                self.json(200, {"ok": True}, self.cookie_sessao("", 0))
                return
            try:
                dados = self.ler_json()
                if rota == "/api/confirmar":
                    if "token_hash" in dados:
                        token_hash = dados["token_hash"]
                        if not isinstance(token_hash, str) or not re.fullmatch(
                            r"[a-fA-F0-9]{64}", token_hash
                        ):
                            raise ValueError()
                        confirmacao = {"token_hash": token_hash, "type": "email"}
                    else:
                        email = dados.get("email", "")
                        codigo = dados.get("codigo", "")
                        if not isinstance(email, str) or not isinstance(codigo, str):
                            raise ValueError()
                        email = email.strip().casefold()
                        if (
                            len(email) > 254
                            or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email)
                            or not re.fullmatch(r"(?:[0-9]{6}|[0-9]{8})", codigo)
                        ):
                            raise ValueError()
                        confirmacao = {"email": email, "token": codigo, "type": "email"}
                else:
                    email = dados.get("email", "")
                    if not isinstance(email, str):
                        raise ValueError()
                    email = email.strip().casefold()
                    if len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
                        raise ValueError()
                    if rota != "/api/reenviar":
                        senha = dados.get("senha", "")
                        if (
                            not isinstance(senha, str)
                            or not 1 <= len(senha) <= 128
                            or (rota == "/api/cadastrar" and len(senha) < 12)
                        ):
                            raise ValueError()
            except (ValueError, TypeError, RecursionError):
                self.json(
                    400,
                    {
                        "erro": "Confira os dados informados. No cadastro, use uma senha com pelo menos 12 caracteres."
                    },
                )
                return
            if rota == "/api/confirmar":
                resultado = supabase("verify", confirmacao)
                # Confirmar não conecta automaticamente, inclusive em outro aparelho.
                if not resultado.get("user", {}).get("email_confirmed_at"):
                    raise FalhaAuth(400)
                self.json(
                    200, {"mensagem": "E-mail confirmado! Agora entre com seu e-mail e senha."}
                )
            elif rota in {"/api/cadastrar", "/api/reenviar"}:
                if rota == "/api/cadastrar":
                    resultado = supabase("signup", {"email": email, "password": senha})
                    # Falha fechada se a confirmação estiver desativada no painel.
                    if resultado.get("access_token"):
                        raise FalhaAuth(503, "configuracao")
                else:
                    supabase("resend", {"type": "signup", "email": email})
                self.json(
                    202,
                    {
                        "verificacao_pendente": True,
                        "mensagem": "Se o endereço puder receber uma confirmação, você receberá um e-mail. Confira também a pasta de spam.",
                    },
                )
            else:
                resultado = supabase(
                    "token?grant_type=password", {"email": email, "password": senha}
                )
                usuario = resultado.get("user", {})
                if not usuario.get("email_confirmed_at"):
                    raise FalhaAuth(403, "email_not_confirmed")
                if (
                    not resultado.get("access_token")
                    or not usuario.get("id")
                    or not usuario.get("email")
                ):
                    raise FalhaAuth(503)
                duracao = min(int(resultado.get("expires_in", 3600)), 3600)
                self.json(
                    200,
                    {"usuario": {"id": usuario["id"], "email": usuario["email"]}},
                    self.cookie_sessao(resultado["access_token"], duracao),
                )
        except FalhaAuth as erro:
            self.falha(erro)
