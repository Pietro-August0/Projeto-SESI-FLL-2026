export const objetivos = { PRODUCAO: 'Produção', RECUPERACAO: 'Recuperação', BIODIVERSIDADE: 'Biodiversidade', MISTO: 'Produção + recuperação' };
export const estratos = ['EMERGENTE', 'ALTO', 'MEDIO', 'BAIXO', 'COBERTURA'];
export const rotulos = { EMERGENTE: 'Emergente', ALTO: 'Alto', MEDIO: 'Médio', BAIXO: 'Baixo', COBERTURA: 'Cobertura', FIXACAO_NITROGENIO: 'Fixação de nitrogênio', BIOMASSA: 'Biomassa e ciclagem', COBERTURA_SOLO: 'Cobertura do solo', DIVERSIDADE: 'Diversidade', PRODUCAO_ALIMENTAR: 'Produção alimentar', AVALIACAO_PH: 'Avaliação do pH', AVALIACAO_NUTRIENTES: 'Avaliação de nutrientes', AVALIACAO_AGUA: 'Avaliação da água', AVALIACAO_TEMPERATURA: 'Avaliação da temperatura', AVALIACAO_SALINIDADE: 'Avaliação da salinidade', ADUBACAO_VERDE: 'Adubação verde', CULTURA_CURTA: 'Cultura de ciclo curto', FRUTIFERA: 'Frutífera', ARBOREA: 'Arbórea', SUPORTE: 'Suporte e biomassa', PRODUTIVA: 'Produção alimentar', PERENE: 'Perene', INICIAL: 'Inicial', INTERMEDIARIA: 'Intermediária', TARDIA: 'Tardia', IMPLANTACAO: 'Implantação', DESENVOLVIMENTO: 'Desenvolvimento', ESTABELECIDO: 'Estabelecido' };
export const limitesEntrada = { ph: [0, 14], umidade: [0, 100], temperatura: [-20, 70], nitrogenio: [0, 10000], fosforo: [0, 10000], potassio: [0, 10000], condutividade: [0, 100] };
export async function carregarJSON(arquivo) {
  try {
    const resposta = await fetch(new URL(`../dados/${arquivo}`, import.meta.url));
    if (!resposta.ok) throw new Error('Arquivo indisponível.');
    return await resposta.json();
  } catch {
    throw new Error(`Não foi possível carregar ${arquivo}. Abra o projeto por um servidor HTTP local e confira se o arquivo JSON está disponível e válido.`);
  }
}
export function escapar(valor) { return String(valor ?? '').replace(/[&<>"']/g, letra => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[letra])); }
export function numero(valor) { return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(valor); }
export function validarAnalise(dados) {
  if (!dados || typeof dados !== 'object') return ['Preencha os dados da análise.'];
  const erros = [];
  for (const [campo, [min, max]] of Object.entries(limitesEntrada)) {
    if (campo === 'condutividade' && dados[campo] == null) continue;
    if (typeof dados[campo] !== 'number' || !Number.isFinite(dados[campo]) || dados[campo] < min || dados[campo] > max) erros.push(`Confira ${campo}: informe um número entre ${min} e ${max}.`);
  }
  if (typeof dados.municipio !== 'string' || !dados.municipio.trim() || dados.municipio.length > 100) erros.push('Informe o município (até 100 caracteres).');
  if (!estados.includes(dados.estado)) erros.push('Selecione um estado válido.');
  if (!Object.hasOwn(objetivos, dados.objetivo)) erros.push('Selecione um objetivo válido.');
  return erros;
}
export const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
export function salvarAnalise(dados) {
  const erros = validarAnalise(dados);
  if (erros.length) throw new Error(erros.join(' '));
  try { localStorage.setItem('analiseAtual', JSON.stringify(dados)); }
  catch { throw new Error('O navegador bloqueou o armazenamento. Permita dados locais para continuar.'); }
}
export function lerAnalise() {
  try { const dados = JSON.parse(localStorage.getItem('analiseAtual')); return validarAnalise(dados).length ? null : dados; }
  catch { return null; }
}
export function mostrarErro(elemento, erro) { elemento.textContent = erro.message || 'Não foi possível concluir esta ação.'; elemento.hidden = false; }
export function iniciarPagina() {
  const pagina = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => { if (a.getAttribute('href') === pagina) a.setAttribute('aria-current', 'page'); });
}
iniciarPagina();
