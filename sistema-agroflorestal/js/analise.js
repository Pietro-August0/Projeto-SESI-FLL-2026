import { carregarJSON, estados, lerAnalise, salvarAnalise, mostrarErro } from './utils.js';
import { renderizarCenarios } from './inicio.js';
const formulario = document.querySelector('#form-analise');
const erro = document.querySelector('#erro');
document.querySelector('#estado').innerHTML += estados.map(uf => `<option value="${uf}">${uf}</option>`).join('');
function preencher(dados, mensagem) {
  for (const [campo, valor] of Object.entries(dados)) {
    if (!formulario.elements.namedItem(campo)) continue;
    const controle = formulario.elements.namedItem(campo);
    controle.value = valor ?? '';
  }
  document.querySelector('#aviso-cenario').textContent = mensagem;
  erro.hidden = true;
}
async function iniciar() {
  try {
    const cenarios = await carregarJSON('cenarios.json');
    renderizarCenarios(cenarios, document.querySelector('#cenarios-analise'), c => preencher(c.dados, `${c.nome} carregado. Dados demonstrativos; você pode editar todos os valores.`));
    const selecionado = cenarios.find(c => c.id === new URLSearchParams(location.search).get('cenario'));
    if (selecionado) preencher(selecionado.dados, `${selecionado.nome} carregado. Dados demonstrativos.`);
    else if (new URLSearchParams(location.search).has('editar') && lerAnalise()) preencher(lerAnalise(), 'Análise anterior carregada para edição.');
  } catch (falha) { mostrarErro(erro, falha); }
}
formulario.addEventListener('submit', evento => {
  evento.preventDefault();
  erro.hidden = true;
  const dados = Object.fromEntries(new FormData(formulario));
  for (const campo of ['ph', 'umidade', 'temperatura', 'nitrogenio', 'fosforo', 'potassio', 'condutividade']) dados[campo] = dados[campo] === '' ? null : Number(dados[campo]);
  dados.municipio = dados.municipio.trim();
  try { salvarAnalise(dados); location.href = 'resultado.html'; }
  catch (falha) { mostrarErro(erro, falha); erro.focus(); }
});
iniciar();
