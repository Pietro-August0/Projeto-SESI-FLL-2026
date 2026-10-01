import { carregarJSON, validarAnalise, salvarAnalise, lerAnalise } from '../js/utils.js';
import { diagnosticar } from '../js/diagnostico.js';
import { recomendar } from '../js/recomendacao.js';
import { montarSAFs, consultarInteracao } from '../js/saf.js';
const lista = document.querySelector('#testes');
const quadro = document.querySelector('#pagina');
let falhas = 0;
let total = 0;
const errosRuntime = [];
function verificar(condicao, nome) {
  total++;
  if (!condicao) falhas++;
  const item = document.createElement('li');
  item.textContent = `${condicao ? 'PASSOU' : 'FALHOU'} — ${nome}`;
  lista.append(item);
}
const aguardar = ms => new Promise(resolve => setTimeout(resolve, ms));
async function esperar(condicao) {
  for (let i = 0; i < 100; i++) { if (condicao()) return; await aguardar(50); }
  throw new Error('Tempo excedido ao carregar estado da interface.');
}
async function navegar(caminho, pronto) {
  await new Promise((resolve, reject) => {
    quadro.onload = resolve;
    quadro.onerror = reject;
    quadro.src = caminho;
  });
  quadro.contentWindow.addEventListener('error', e => errosRuntime.push(e.message));
  quadro.contentWindow.addEventListener('unhandledrejection', e => errosRuntime.push(String(e.reason)));
  await esperar(() => pronto(quadro.contentDocument));
  return quadro.contentDocument;
}
let anterior;
async function executar() {
  anterior = localStorage.getItem('analiseAtual');
  try {
    const [cenarios, config, especies, modelos, interacoes] = await Promise.all(['cenarios.json', 'faixas-solo.json', 'especies.json', 'modelos-saf.json', 'interacoes.json'].map(carregarJSON));
    verificar(especies.length >= 15 && especies.length <= 25, 'Catálogo entre 15 e 25 espécies');
    verificar(new Set(especies.map(e => e.id)).size === especies.length, 'IDs de espécies únicos');
    verificar(especies.every(e => e.fonte.url.startsWith('https://') && e.phMin === null && e.demandaN === null), 'Referências e dados desconhecidos preservados');
    verificar(cenarios.length === 3 && cenarios.every(c => c.demonstrativo), 'Três cenários explicitamente demonstrativos');
    try { await carregarJSON('arquivo-ausente.json'); verificar(false, 'Erro de JSON ausente'); }
    catch (erro) { verificar(erro.message.includes('servidor HTTP local'), 'JSON ausente mostra orientação amigável'); }
    for (const c of cenarios) {
      verificar(validarAnalise(c.dados).length === 0, `${c.nome}: entradas válidas`);
      const diag = diagnosticar(c.dados, config);
      const safs = montarSAFs(diag, c.dados, especies, modelos, interacoes, config.pesos);
      verificar(safs.length >= 2, `${c.nome}: pelo menos duas propostas completas`);
      verificar(safs.every(s => new Set(s.especies.map(e => e.id)).size === s.especies.length && Object.keys(s.fases).length === 3 && s.especies.every(e => e.justificativas.length && e.papel && e.estrato && e.faseEntrada)), `${c.nome}: sem duplicação, com fases e justificativas`);
      verificar(safs.every(s => s.especies.some(e => e.papel === 'COBERTURA' && e.estrato === 'COBERTURA')), `${c.nome}: cobertura prioriza o estrato de cobertura`);
      verificar(new Set(safs.map(s => s.especies.map(e => e.id).sort().join('|'))).size === safs.length, `${c.nome}: propostas distintas`);
    }
    verificar(diagnosticar(cenarios[0].dados, config).parametros.nitrogenio.status === 'BAIXO', 'Solo A: N baixo');
    verificar(diagnosticar(cenarios[1].dados, config).necessidades.includes('BIOMASSA'), 'Solo B: recuperação e biomassa');
    verificar(Object.values(diagnosticar(cenarios[2].dados, config).parametros).every(p => p.status === 'ADEQUADO'), 'Solo C: parâmetros equilibrados');
    for (const objetivo of ['PRODUCAO', 'RECUPERACAO', 'BIODIVERSIDADE', 'MISTO']) {
      const dados = { ...cenarios[0].dados, objetivo };
      verificar(montarSAFs(diagnosticar(dados, config), dados, especies, modelos, interacoes, config.pesos).length >= 2, `Objetivo ${objetivo}: duas propostas`);
    }
    verificar(validarAnalise({ ...cenarios[0].dados, ph: 15 }).length > 0 && validarAnalise({ ...cenarios[0].dados, nitrogenio: NaN }).length > 0 && validarAnalise({ ...cenarios[0].dados, municipio: '' }).length > 0, 'Rejeita pH inválido, NaN e município vazio');
    verificar(validarAnalise({ ...cenarios[0].dados, ph: 0, umidade: 0, condutividade: 0 }).length === 0, 'Zero é um valor válido, não dado ausente');
    verificar(diagnosticar({ ...cenarios[0].dados, condutividade: 3 }, config).parametros.condutividade.status === 'ATENCAO', 'Condutividade opcional alta gera ATENÇÃO');
    const dado = cenarios[0].dados;
    const diag = diagnosticar(dado, config);
    const artificial = { ...especies[0], id: 'teste', phMin: 8, phMax: 10 };
    verificar(recomendar([artificial], dado, diag, config.pesos).length === 0, 'Limite conhecido incompatível elimina espécie');
    verificar(recomendar([especies[0]], dado, diag, config.pesos)[0].criteriosIgnorados.length === 3, 'null ignora faixas, sem acrescentar pontos climáticos');
    verificar(recomendar([{ ...especies[0], estados: ['AC'] }], dado, diag, config.pesos).length === 0, 'Restrição regional conhecida é respeitada');
    verificar(consultarInteracao('a', 'b', []).status === 'DESCONHECIDA', 'Ausência de interação não significa compatível');
    const bloqueios = [];
    especies.forEach((a, i) => especies.slice(i + 1).forEach(b => bloqueios.push({ especieA: a.id, especieB: b.id, status: 'EVITAR' })));
    verificar(montarSAFs(diag, dado, especies, modelos, bloqueios, config.pesos).length === 0, 'Interações EVITAR impedem composição incompatível');
    verificar(montarSAFs(diag, dado, [], modelos, [], config.pesos).length === 0, 'Catálogo vazio não fabrica uma proposta');
    localStorage.setItem('analiseAtual', '{quebrado');
    verificar(lerAnalise() === null, 'Armazenamento corrompido tratado');
    let pagina = await navegar('../resultado.html', d => d.querySelector('.estado-vazio'));
    verificar(pagina.querySelector('.estado-vazio a').getAttribute('href') === 'analise.html', 'Resultado sem análise orienta retorno');
    pagina = await navegar('../index.html', d => d.querySelectorAll('[data-cenario]').length === 3);
    verificar(pagina.title.includes('Raiz') && pagina.querySelector('h1'), 'Início renderiza e carrega três cenários');
    for (const c of cenarios) {
      pagina = await navegar(`../analise.html?cenario=${c.id}`, d => d.querySelector('#ph')?.value !== '');
      verificar(Number(pagina.querySelector('#nitrogenio').value) === c.dados.nitrogenio && pagina.querySelector('[name="objetivo"]:checked').value === c.dados.objetivo, `${c.nome}: cenário preenche o formulário`);
      pagina.querySelector('[data-cenario="solo-c"]').click();
      verificar(Number(pagina.querySelector('#nitrogenio').value) === cenarios[2].dados.nitrogenio, `${c.nome}: botão altera dados do formulário`);
      pagina.querySelector(`[data-cenario="${c.id}"]`).click();
      pagina.querySelector('#form-analise').requestSubmit();
      await esperar(() => quadro.contentWindow.location.pathname.endsWith('/resultado.html') && quadro.contentDocument.querySelectorAll('[role="tab"]').length >= 2);
      pagina = quadro.contentDocument;
      verificar(pagina.querySelectorAll('.estrato').length === 5 && pagina.querySelectorAll('.fase').length === 3 && pagina.querySelectorAll('.parametro').length === 6, `${c.nome}: formulário → resultado completo`);
      const botoes = pagina.querySelectorAll('[role="tab"]');
      botoes[1].click();
      verificar(botoes[1].getAttribute('aria-selected') === 'true' && pagina.querySelector('#proposta').getAttribute('aria-labelledby') === 'aba-1', `${c.nome}: troca de proposta funciona`);
      botoes[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      verificar(botoes[0].getAttribute('aria-selected') === 'true' && pagina.activeElement === botoes[0], `${c.nome}: abas respondem ao teclado`);
      pagina.querySelector('.especie-chip').click();
      verificar(pagina.querySelector('.justificativas details[open]'), `${c.nome}: chip abre justificativa`);
    }
    pagina = await navegar('../especies.html', d => d.querySelectorAll('.especie-card').length === especies.length);
    pagina.querySelector('#busca').value = 'cajanus';
    pagina.querySelector('#busca').dispatchEvent(new Event('input'));
    verificar(pagina.querySelectorAll('.especie-card').length === 1 && pagina.querySelector('.especie-card').textContent.includes('guandu'), 'Busca por nome científico');
    pagina.querySelector('#busca').value = 'zzzzzzz';
    pagina.querySelector('#busca').dispatchEvent(new Event('input'));
    verificar(pagina.querySelector('.estado-vazio'), 'Busca sem resultados mostra orientação');
    pagina.querySelector('#limpar').click();
    pagina.querySelector('#filtro-estrato').value = 'COBERTURA';
    pagina.querySelector('#filtro-estrato').dispatchEvent(new Event('input'));
    verificar(pagina.querySelectorAll('.especie-card').length === especies.filter(e => e.estrato === 'COBERTURA').length, 'Filtro de estrato');
    pagina.querySelector('#limpar').click();
    pagina.querySelector('#filtro-funcao').value = 'ARBOREA';
    pagina.querySelector('#filtro-funcao').dispatchEvent(new Event('input'));
    verificar(pagina.querySelectorAll('.especie-card').length === especies.filter(e => e.papeis.includes('ARBOREA')).length, 'Filtro de função');
    pagina = await navegar('../sobre.html', d => d.querySelector('.fontes'));
    verificar(pagina.querySelectorAll('.fontes a').length >= 5, 'Metodologia e fontes disponíveis');
    for (const [url, pronto] of [ ['index.html', d => d.querySelectorAll('[data-cenario]').length === 3], ['analise.html?cenario=solo-a', d => d.querySelector('#ph')?.value !== ''], ['resultado.html', d => d.querySelector('.estrato')], ['especies.html', d => d.querySelector('.especie-card')], ['sobre.html', d => d.querySelector('.fontes')] ]) {
      pagina = await navegar(`../${url}`, pronto);
      verificar(pagina.documentElement.scrollWidth <= quadro.clientWidth + 2, `${url}: sem overflow horizontal`);
    }
    salvarAnalise(cenarios[0].dados);
    pagina = await navegar('../resultado.html', d => d.querySelectorAll('.estrato').length === 5);
    verificar(pagina.documentElement.scrollWidth <= quadro.clientWidth + 2, 'Resultado sem overflow horizontal na largura de teste');
    verificar(errosRuntime.length === 0, `Sem erros de runtime (${errosRuntime.join('; ')})`);
  } catch (erro) { verificar(false, erro.stack || erro.message); }
  finally {
    if (anterior === null) localStorage.removeItem('analiseAtual'); else localStorage.setItem('analiseAtual', anterior);
    document.querySelector('#estado').textContent = `${total - falhas}/${total} verificações passaram; ${falhas} falhas.`;
    document.body.dataset.falhas = falhas;
    document.title = falhas ? 'FALHOU — Raiz' : 'PASSOU — Raiz';
  }
}
executar();
