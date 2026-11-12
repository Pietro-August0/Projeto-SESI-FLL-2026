/* A sessão é validada pelo servidor. O cookie HttpOnly não é acessível ao JavaScript. */
export async function consultarAcesso() {
  const resposta = await fetch("/api/sessao", {
    credentials: "same-origin",
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!resposta.ok)
    throw new Error(
      "Não foi possível verificar sua conta. Tente novamente em alguns minutos.",
    );
  return resposta.json();
}

export async function consultarSessao() {
  return (await consultarAcesso()).usuario;
}

export function pedirLogin(destino) {
  return `/conta.html?proximo=${encodeURIComponent(destino)}`;
}

export async function consultarHistorico(parametros = {}) {
  const consulta = new URLSearchParams(parametros);
  const resposta = await fetch(`/api/safs?${consulta}`, { signal: AbortSignal.timeout(20000) });
  return lerResposta(resposta);
}

export function destinoAposLogin() {
  const proximo =
    new URLSearchParams(location.search).get("proximo") || "analise.html";
  try {
    const url = new URL(proximo, location.href);
    const paginas = [
      "explorar.html",
      "analise.html",
      "resultado.html",
      "especies.html",
      "historia.html",
      "sobre.html",
    ];
    return url.origin === location.origin &&
      paginas.includes(url.pathname.slice(1))
      ? url.pathname + url.search
      : "/analise.html";
  } catch {
    return "/analise.html";
  }
}

export async function enviarConta(acao, dados = {}) {
  const resposta = await fetch(`/api/${acao}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Ybyra-Request": "1" },
    body: JSON.stringify(dados),
    signal: AbortSignal.timeout(20000),
  });
  return lerResposta(resposta);
}

async function lerResposta(resposta) {
  const resultado = await resposta.json();
  if (!resposta.ok) {
    const erro = new Error(
      resultado.erro || "Não foi possível concluir. Tente novamente.",
    );
    erro.status = resposta.status;
    erro.verificacaoPendente = Boolean(resultado.verificacao_pendente);
    throw erro;
  }
  return resultado;
}

export async function encerrarSessao() {
  await enviarConta("sair");
  try {
    sessionStorage.removeItem("analiseAtual");
    sessionStorage.removeItem("safPendente");
    localStorage.removeItem("analiseAtual");
  } catch {
    /* A saída funciona mesmo com armazenamento local bloqueado. */
  }
  location.replace("/conta.html");
}
