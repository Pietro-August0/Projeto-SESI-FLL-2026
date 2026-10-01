import { carregarJSON, lerAnalise, objetivos, rotulos, estratos, escapar, numero, mostrarErro } from './utils.js';
import { diagnosticar } from './diagnostico.js';
import { montarSAFs } from './saf.js';
const alvo = document.querySelector('#resultado');
const analise = lerAnalise();
function exibirProposta(saf) {
  const faseTextos = { implantacao: 'Cobertura, culturas curtas e plantio das mudas perenes.', desenvolvimento: 'Consolidação de frutíferas e suporte; manejo da biomassa.', estabelecido: 'Perenes, manutenção da cobertura e manejo contínuo.' };
  const nomesFases = { implantacao: 'Implantação', desenvolvimento: 'Desenvolvimento', estabelecido: 'Estabelecido' };
  document.querySelector('#proposta').innerHTML = `<div class="proposta-cabecalho"><h3>${escapar(saf.titulo)}</h3><p>${escapar(saf.resumo)}</p></div>
    <h4>Uma composição em diferentes alturas</h4><p class="muted">Estratos ilustrativos, sem escala de altura ou previsão de crescimento.</p>
    <div class="estratos">${estratos.map(estrato => `<div class="estrato estrato-${estrato.toLowerCase()}"><span class="estrato-nome">${rotulos[estrato]}</span><div class="estrato-especies">${saf.especies.filter(e => e.estrato === estrato).map(e => `<a class="especie-chip" href="#especie-${e.id}">${escapar(e.nome)}</a>`).join('') || '<span class="muted">Sem espécie neste estrato</span>'}</div></div>`).join('')}</div>
    <h4 class="titulo-fases">O sistema ao longo das fases</h4><div class="fases">${Object.entries(saf.fases).map(([fase, ids], i) => `<section class="fase"><span class="fase-numero">0${i + 1}</span><h5>${nomesFases[fase]}</h5><p>${faseTextos[fase]}</p><ul>${ids.map(id => `<li>${escapar(saf.especies.find(e => e.id === id).nome)}</li>`).join('') || '<li>Sem espécie para esta fase.</li>'}</ul></section>`).join('')}</div>
    <h4 class="titulo-fases">Por que cada espécie foi escolhida?</h4><div class="justificativas">${saf.especies.map(e => `<details id="especie-${e.id}"><summary><span><strong>${escapar(e.nome)}</strong><small>${escapar(e.nomeCientifico)} · ${rotulos[e.papel] || e.papel}</small></span><span class="pontos">${e.pontuacao} pontos de ordenação</span></summary><div class="detalhe"><p>Função consolidada na fase: ${rotulos[e.faseEntrada]}. Mudas perenes podem ser plantadas na implantação.</p><ul>${e.justificativas.map(j => `<li>${escapar(j)}</li>`).join('')}</ul><p class="muted">Pontos são pesos de regras demonstrativas, sem porcentagem de precisão científica.</p><a href="${escapar(e.fonte.url)}" target="_blank" rel="noopener noreferrer">${escapar(e.fonte.titulo)} ↗</a></div></details>`).join('')}</div>
    <details class="relacoes"><summary>Interações entre as espécies</summary><div class="detalhe"><p>Sem registro significa DESCONHECIDA. A seleção não comprova compatibilidade entre pares. Relações EVITAR cadastradas são excluídas.</p><ul>${saf.interacoes.map(r => `<li><strong>${escapar(r.especieA)} + ${escapar(r.especieB)}</strong>: ${r.status} — ${escapar(r.motivo)}${r.fonte ? ` <a href="${escapar(r.fonte.url)}" target="_blank" rel="noopener noreferrer">Fonte ↗</a>` : ''}</li>`).join('')}</ul></div></details>`;
  document.querySelectorAll('.especie-chip').forEach(a => a.addEventListener('click', () => { document.getElementById(a.hash.slice(1)).open = true; }));
}
async function iniciar() {
  if (!analise) { alvo.innerHTML = '<section class="estado-vazio"><h2>Vamos começar pelo solo?</h2><p>Nenhuma análise válida está salva neste navegador. Preencha os dados ou escolha um cenário.</p><a class="botao" href="analise.html">Iniciar análise →</a></section>'; return; }
  try {
    const [config, catalogo, modelos, interacoes] = await Promise.all(['faixas-solo.json', 'especies.json', 'modelos-saf.json', 'interacoes.json'].map(carregarJSON));
    const diagnostico = diagnosticar(analise, config);
    const safs = montarSAFs(diagnostico, analise, catalogo, modelos, interacoes, config.pesos);
    alvo.innerHTML = `<section class="resumo-dados"><div><strong>${escapar(analise.municipio)}, ${escapar(analise.estado)}</strong><span>${objetivos[analise.objetivo]} · Dados inseridos para demonstração</span></div><a class="botao secundario" href="analise.html?editar">Editar dados</a></section>
      <section aria-labelledby="titulo-diagnostico"><div class="section-heading"><h2 id="titulo-diagnostico">O que os dados mostram</h2><span>01 / Diagnóstico</span></div><div class="diagnostico">${Object.values(diagnostico.parametros).map(p => `<article class="parametro"><span>${p.rotulo}</span><strong>${numero(p.valor)}<small> ${p.unidade}</small></strong><span class="status status-${p.status.toLowerCase()}">${p.status === 'ADEQUADO' ? '✓' : '!'} ${p.status === 'ATENCAO' ? 'ATENÇÃO' : p.status}</span><p>${escapar(p.explicacao)}</p><small>Faixa demonstrativa: ${p.faixa} ${p.unidade}</small></article>`).join('')}</div></section>
      <section class="necessidades"><h3>Prioridades desta composição</h3><div>${diagnostico.necessidades.map(n => `<span class="necessidade">${rotulos[n] || n}</span>`).join('')}</div><p class="muted">Cobertura e diversidade são princípios dos modelos, não condições medidas pelo sensor.</p></section>
      <section aria-labelledby="titulo-safs"><div class="section-heading"><h2 id="titulo-safs">Caminhos para a sua agrofloresta</h2><span>02 / Composições</span></div><p class="muted">Compare alternativas e explore a função de cada espécie. Aptidão regional e faixas ausentes precisam de validação.</p>${safs.length ? `<div class="abas" role="tablist" aria-label="Propostas de SAF">${safs.map((s, i) => `<button id="aba-${i}" role="tab" aria-selected="${i === 0}" aria-controls="proposta" tabindex="${i === 0 ? 0 : -1}" data-proposta="${i}">${String(i + 1).padStart(2, '0')} · ${escapar(s.titulo)}</button>`).join('')}</div><div id="proposta" role="tabpanel" aria-labelledby="aba-0"></div>` : '<p class="aviso">Não há espécies elegíveis suficientes para preencher um modelo. Revise os dados e o catálogo.</p>'}${safs.length === 1 ? '<p class="aviso">Apenas uma composição completa está disponível para estes critérios.</p>' : ''}</section>
      <aside class="aviso">Demonstração educativa. Regras de solo, papéis, estratos e fases são simplificados. Não substitui avaliação agronômica, não prescreve fertilizantes nem prevê produtividade. <a href="sobre.html">Entenda a metodologia →</a></aside>`;
    if (!safs.length) return;
    const abas = [...document.querySelectorAll('[data-proposta]')];
    function selecionar(i, focar = false) { abas.forEach((aba, j) => { aba.setAttribute('aria-selected', String(i === j)); aba.tabIndex = i === j ? 0 : -1; }); document.querySelector('#proposta').setAttribute('aria-labelledby', `aba-${i}`); exibirProposta(safs[i]); if (focar) abas[i].focus(); }
    abas.forEach((aba, i) => {
      aba.addEventListener('click', () => selecionar(i));
      aba.addEventListener('keydown', e => { const teclas = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (!teclas.includes(e.key)) return; e.preventDefault(); const indice = e.key === 'Home' ? 0 : e.key === 'End' ? abas.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + abas.length) % abas.length; selecionar(indice, true); });
    });
    selecionar(0);
  } catch (erro) { alvo.innerHTML = ''; mostrarErro(document.querySelector('#erro'), erro); }
}
iniciar();
