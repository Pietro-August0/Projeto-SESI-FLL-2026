import { carregarJSON, rotulos, escapar, mostrarErro } from './utils.js';
let catalogo = [];
const busca = document.querySelector('#busca');
const estrato = document.querySelector('#filtro-estrato');
const funcao = document.querySelector('#filtro-funcao');
const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function atualizar() {
  const termo = normalizar(busca.value.trim());
  const filtradas = catalogo.filter(e => normalizar(`${e.nome} ${e.nomeCientifico} ${e.funcaoPrincipal}`).includes(termo) && (!estrato.value || e.estrato === estrato.value) && (!funcao.value || e.papeis.includes(funcao.value)));
  document.querySelector('#contagem').textContent = `${filtradas.length} de ${catalogo.length} espécies`;
  document.querySelector('#catalogo').innerHTML = filtradas.map(e => `<article class="especie-card" id="${e.id}"><div class="especie-cabecalho"><span class="estrato-tag">${rotulos[e.estrato]}</span><span class="muted">${rotulos[e.sucessao]}</span></div><h2>${escapar(e.nome)}</h2><p class="cientifico">${escapar(e.nomeCientifico)}</p><p>${escapar(e.funcaoPrincipal)}</p><div class="funcoes">${e.papeis.map(p => `<span>${rotulos[p] || p}</span>`).join('')}</div><details><summary>Dados e referência</summary><dl><dt>pH</dt><dd>${e.phMin == null && e.phMax == null ? 'Não confirmado' : `${e.phMin ?? '?'} a ${e.phMax ?? '?'}`}</dd><dt>Temperatura / umidade</dt><dd>Não confirmadas</dd><dt>Demanda N / P / K</dt><dd>${e.demandaN ?? 'Não confirmada'} / ${e.demandaP ?? 'não confirmada'} / ${e.demandaK ?? 'não confirmada'}</dd><dt>Aptidão regional</dt><dd>${e.estados ? e.estados.join(', ') : 'Não validada'}</dd><dt>Fixação de N</dt><dd>${e.fixaNitrogenio == null ? 'Não confirmada' : e.fixaNitrogenio ? 'Registrada' : 'Não registrada'}</dd></dl><p class="muted">Papéis, estratos e fases são uma organização didática, variável com o manejo. Limites numéricos ausentes não entram no cálculo.</p><a href="${escapar(e.fonte.url)}" target="_blank" rel="noopener noreferrer">${escapar(e.fonte.titulo)} ↗</a></details></article>`).join('') || '<p class="estado-vazio">Nenhuma espécie encontrada. Tente outro nome ou limpe os filtros.</p>';
}
async function iniciar() {
  try { catalogo = await carregarJSON('especies.json'); atualizar(); }
  catch (erro) { mostrarErro(document.querySelector('#erro'), erro); }
}
[busca, estrato, funcao].forEach(campo => campo.addEventListener('input', atualizar));
document.querySelector('#limpar').addEventListener('click', () => { busca.value = ''; estrato.value = ''; funcao.value = ''; atualizar(); busca.focus(); });
iniciar();
