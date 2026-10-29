"""Autenticação gerenciada no Supabase; nenhuma conta é gravada na Vercel."""

import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from servidor import Requisicao


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


def supabase(caminho, dados=None, token=None):
    url, chave, _ = configuracao()
    headers = {"apikey": chave, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    requisicao = Request(
        url + "/auth/v1/" + caminho,
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
            codigo = json.loads(erro.read()).get("error_code", "")
        except (ValueError, AttributeError):
            codigo = ""
        raise FalhaAuth(erro.code, codigo) from None
    except (URLError, TimeoutError, OSError, ValueError):
        raise FalhaAuth(503, "indisponivel") from None


class RequisicaoProducao(Requisicao):
    """Reutiliza a proteção dos arquivos; delega senhas e tokens ao Supabase."""

    server_version = "Ybyra"
    verificacao_email = True

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
        if erro.status == 429:
            self.json(
                429,
                {"erro": "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."},
            )
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
            # Configuração ausente nunca ativa automaticamente o cadastro local.
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
        }:
            self.json(404, {"erro": "Endereço não encontrado."})
            return
        try:
            configuracao()
            if not self.mesma_origem():
                self.json(403, {"erro": "Recarregue a página e tente novamente."})
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
                tamanho = int(self.headers.get("Content-Length", "0"))
                if (
                    not 0 < tamanho <= 4096
                    or self.headers.get("Content-Type", "").split(";")[0] != "application/json"
                ):
                    raise ValueError()
                dados = json.loads(self.rfile.read(tamanho))
                if not isinstance(dados, dict):
                    raise ValueError()
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
            except (ValueError, TypeError, UnicodeDecodeError):
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
