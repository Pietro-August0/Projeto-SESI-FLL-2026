/* A sessão é validada pelo servidor. O cookie HttpOnly não é acessível ao JavaScript. */
export async function consultarAcesso() {
  const resposta = await fetch('/api/sessao', { credentials: 'same-origin', cache: 'no-store' });
  if (!resposta.ok)
    throw new Error('Não foi possível verificar sua conta. Tente novamente em alguns minutos.');
  return resposta.json();
}

export async function consultarSessao() {
  return (await consultarAcesso()).usuario;
}

export function destinoAposLogin() {
  const proximo = new URLSearchParams(location.search).get('proximo') || 'index.html';
  try {
    const url = new URL(proximo, location.href);
    const paginas = [
      'index.html',
      'analise.html',
      'resultado.html',
      'especies.html',
      'historia.html',
      'sobre.html',
    ];
    return url.origin === location.origin && paginas.includes(url.pathname.slice(1))
      ? url.pathname + url.search
      : '/index.html';
  } catch {
    return '/index.html';
  }
}

export async function enviarConta(acao, dados = {}) {
  const resposta = await fetch(`/api/${acao}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Ybyra-Request': '1' },
    body: JSON.stringify(dados),
    signal: AbortSignal.timeout(15000),
  });
  const resultado = await resposta.json();
  if (!resposta.ok) {
    const erro = new Error(resultado.erro || 'Não foi possível concluir. Tente novamente.');
    erro.status = resposta.status;
    erro.verificacaoPendente = Boolean(resultado.verificacao_pendente);
    throw erro;
  }
  return resultado;
}

export async function encerrarSessao() {
  await enviarConta('sair');
  try {
    localStorage.removeItem('analiseAtual');
  } catch {
    /* A saída funciona mesmo com armazenamento local bloqueado. */
  }
  location.replace('/conta.html');
}

export async function exigirSessao() {
  const pagina = location.pathname.split('/').pop() || 'index.html';
  const usuario = await consultarSessao();
  if (pagina !== 'conta.html' && !usuario) {
    document.documentElement.classList.add('conferindo-sessao');
    location.replace(`/conta.html?proximo=${encodeURIComponent(pagina + location.search)}`);
    return null;
  }
  return usuario;
}

// Ao voltar pelo histórico, confere novamente uma página guardada pelo navegador.
window.addEventListener('pageshow', async (evento) => {
  if (!evento.persisted) return;
  document.documentElement.classList.add('conferindo-sessao');
  try {
    const usuario = await exigirSessao();
    if (usuario || location.pathname.endsWith('/conta.html'))
      document.documentElement.classList.remove('conferindo-sessao');
  } catch {
    location.replace('/conta.html');
  }
});
