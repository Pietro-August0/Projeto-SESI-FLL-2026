import { carregarJSON, escapar, mostrarErro } from './utils.js';
export function renderizarCenarios(cenarios, alvo, aoSelecionar) {
  alvo.innerHTML = cenarios.map(c => `<button class="cenario" type="button" data-cenario="${escapar(c.id)}"><span class="cenario-letra">${escapar(c.nome)}</span><strong>${escapar(c.titulo)}</strong><span>${escapar(c.descricao)}</span><span class="cenario-link">Carregar cenário <span aria-hidden="true">→</span></span></button>`).join('');
  alvo.querySelectorAll('button').forEach(botao => botao.addEventListener('click', () => aoSelecionar(cenarios.find(c => c.id === botao.dataset.cenario))));
}
const alvo = document.querySelector('#cenarios-inicio');
if (alvo) {
  carregarJSON('cenarios.json').then(cenarios => renderizarCenarios(cenarios, alvo, c => { location.href = `analise.html?cenario=${encodeURIComponent(c.id)}`; })).catch(erro => mostrarErro(document.querySelector('#erro'), erro));
}
