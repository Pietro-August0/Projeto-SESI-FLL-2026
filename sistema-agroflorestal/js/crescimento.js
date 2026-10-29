/* A sequência é ilustrativa: plantas têm formas próprias e ritmos de desenho
 * distintos. Não representa anos, produtividade ou profundidade real de raízes. */
import { escapar, rotulos } from './utils.js';
import { perfisVisuais, estadoDaPlanta, faseDoProgresso } from './evolucao-plantas.js';
import { desenharEspecie, desenharRaizes } from './desenhos-plantas.js';

const fases = [
  {
    chave: 'implantacao',
    nome: 'Implantação',
    texto:
      'Mudas perenes e culturas iniciais dividem a área. As plantas começam com portes e formas diferentes.',
  },
  {
    chave: 'desenvolvimento',
    nome: 'Desenvolvimento',
    texto:
      'As plantas ampliam folhas, ramos e raízes. Culturas iniciais encerram seu ciclo no arranjo; a cobertura precisa ser renovada.',
  },
  {
    chave: 'estabelecido',
    nome: 'Estabelecido',
    texto:
      'Perenes estruturam a composição. Flores e frutos são símbolos de desenvolvimento, sem previsão de colheita. Cobertura e manejo continuam.',
  },
];
let numeroCena = 0;

export function iniciarCrescimento(alvo, saf, { compacto = false } = {}) {
  const especies = [...saf.especies].sort(
    (a, b) =>
      ['EMERGENTE', 'ALTO', 'MEDIO', 'BAIXO', 'COBERTURA'].indexOf(a.estrato) -
      ['EMERGENTE', 'ALTO', 'MEDIO', 'BAIXO', 'COBERTURA'].indexOf(b.estrato),
  );
  const id = `agrofloresta-${++numeroCena}`;
  let posicao = 0;
  let tocando = false;
  let quadro = null;
  let ultimoInstante = null;
  let ultimaPintura = null;
  let encerrado = false;
  let selecionada = null;
  let ultimoAviso = '';
  const movimentoReduzido = matchMedia('(prefers-reduced-motion: reduce)');
  const abortador = new AbortController();
  const ouvir = (elemento, nome, fn) =>
    elemento.addEventListener(nome, fn, { signal: abortador.signal });
  const espacos = especies.map((e, i) => 155 + i * (690 / Math.max(1, especies.length - 1)));
  if (especies.length === 1) espacos[0] = 500;

  alvo.classList.add('crescimento');
  alvo.classList.toggle('crescimento-compacto', compacto);
  alvo.innerHTML = `
        <div class="crescimento-titulo"><div><p class="crescimento-sobretitulo">Uma paisagem em transformação</p><h2>${compacto ? 'Veja a agrofloresta crescer' : 'Explore a vida de cada planta'}</h2></div><span class="crescimento-selo">Sem escala de tempo</span></div>
        <figure class="crescimento-figura">
            <div class="crescimento-panorama" tabindex="0" role="region" aria-label="Paisagem da agrofloresta; role horizontalmente em telas pequenas">
                <svg id="${id}-paisagem" viewBox="0 0 1000 500" role="img" aria-labelledby="${id}-titulo ${id}-descricao" class="crescimento-cena">
                    <title id="${id}-titulo">Espécies da proposta ao longo das fases</title><desc id="${id}-descricao"></desc>
                    <defs>
                        <linearGradient id="${id}-ceu" x2="0" y2="1"><stop stop-color="#EAF4ED"/><stop offset="1" stop-color="#F7FAEF"/></linearGradient>
                        <pattern id="${id}-terra" width="34" height="30" patternUnits="userSpaceOnUse"><circle cx="7" cy="6" r="1.5" fill="#94714C" opacity=".2"/><path d="m22 19 4 1" stroke="#AE8A60" opacity=".4"/></pattern>
                    </defs>
                    <path fill="url(#${id}-ceu)" d="M0 0h1000v316H0z"/>
                    <circle cx="894" cy="62" r="28" fill="#D9DDAB" opacity=".7"/>
                    <path d="M0 279Q150 209 310 270T650 266T1000 249V316H0Z" fill="#DCEADC"/>
                    <path d="M0 300Q175 252 365 293T720 285T1000 291V316H0Z" fill="#CCDFCD"/>
                    <path d="M0 316h1000v184H0z" fill="#D9C09A"/>
                    <path d="M0 375Q270 355 500 377T1000 373V500H0Z" fill="#C8AA80"/>
                    <path d="M0 316h1000v184H0z" fill="url(#${id}-terra)"/>
                    <path d="M0 314h1000v8H0z" fill="#83734D"/>
                    <g class="grupo-raizes">${especies.map((e, i) => `<g transform="translate(${espacos[i]} 317)"><g class="raiz-desenho" data-raiz="${e.id}"></g></g>`).join('')}</g>
                    <g class="grupo-residuos">${especies.map((e, i) => `<g transform="translate(${espacos[i]} 316)" data-residuos="${e.id}" opacity="0"><path d="M-34 1q9-9 20 0m8-2q11-8 19 0m4 2q12-8 22-1" stroke="#94734D" stroke-width="4" fill="none" stroke-linecap="round"/></g>`).join('')}</g>
                    <g class="grupo-plantas">${especies
                      .map(
                        (e, i) => `<g transform="translate(${espacos[i]} 316)" data-item="${e.id}">
                        <ellipse class="planta-destaque" cx="0" cy="-105" rx="69" ry="150" fill="${perfisVisuais[e.id].cor}" opacity="0"/>
                        <g data-planta="${e.id}" class="planta-desenho"></g>
                        <rect x="-62" y="-270" width="124" height="270" fill="transparent" data-selecionar="${e.id}" class="planta-area"/>
                        <g class="planta-numero" transform="translate(0 11)"><circle r="12" fill="#F8FAF4" stroke="${perfisVisuais[e.id].cor}"/><text text-anchor="middle" y="4" fill="${perfisVisuais[e.id].cor}">${i + 1}</text></g>
                    </g>`,
                      )
                      .join('')}</g>
                    <text x="20" y="480" class="solo-rotulo">Solo e raízes · desenho sem escala</text>
                </svg>
            </div>
            <figcaption>${compacto ? 'Paisagem ilustrativa · sem escala real de tempo.' : 'Os números ligam as plantas à legenda. <span class="crescimento-dica-pan">Deslize a paisagem para ver toda a composição.</span>'}</figcaption>
        </figure>
        <div class="crescimento-controles">
            <div class="crescimento-etapas" role="group" aria-label="Escolher fase da agrofloresta">${fases.map((f, i) => `<button type="button" data-fase="${i}" aria-pressed="false"><span>0${i + 1}</span>${f.nome}</button>`).join('')}</div>
            <div class="crescimento-transporte"><button type="button" class="crescimento-reiniciar" aria-label="Recomeçar a sequência">↺</button><button type="button" class="crescimento-reproduzir" aria-pressed="false">▶ Reproduzir</button></div>
        </div>
        ${compacto ? '<details class="crescimento-extras"><summary>Explorar plantas e controles</summary>' : ''}
        <div class="crescimento-linha"><label for="tempo-${id}">Percorrer as fases</label><input id="tempo-${id}" type="range" min="0" max="100" value="0" step="1"></div>
        <div class="crescimento-opcoes"><label class="crescimento-raizes"><input type="checkbox" checked> Ver raízes</label><label class="crescimento-velocidade" for="velocidade-${id}">Velocidade<select id="velocidade-${id}"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
        <div class="crescimento-leitura" aria-live="polite" aria-atomic="true"></div>
        <p class="crescimento-instrucao">Selecione uma planta para reconhecer sua forma e acompanhar o que muda.</p>
        <ul class="crescimento-legenda" aria-label="Selecionar espécie">${especies.map((e, i) => `<li><button type="button" data-especie="${e.id}" aria-pressed="false" style="--cor-especie:${perfisVisuais[e.id].cor}"><span class="legenda-numero">${i + 1}</span><span><strong>${escapar(e.nome)}</strong><small data-estado="${e.id}"></small></span></button></li>`).join('')}</ul>
        <div id="${id}-inspecao" class="crescimento-inspecao" role="region" aria-label="Detalhes da planta selecionada" hidden></div>
        <p class="crescimento-nota">Desenhos estilizados, sem proporção de altura, profundidade ou duração real. Crescimento, flores e frutos são ilustrativos. Coberturas de ciclo curto representam novas plantas a cada renovação.</p>${compacto ? '</details>' : ''}`;

  const slider = alvo.querySelector('input[type=range]');
  const botaoReproduzir = alvo.querySelector('.crescimento-reproduzir');
  const leitura = alvo.querySelector('.crescimento-leitura');
  const velocidade = alvo.querySelector('.crescimento-velocidade select');
  const painel = alvo.querySelector('.crescimento-inspecao');
  const elementos = especies.map((e) => ({
    especie: e,
    planta: alvo.querySelector(`[data-planta="${e.id}"]`),
    raiz: alvo.querySelector(`[data-raiz="${e.id}"]`),
    item: alvo.querySelector(`[data-item="${e.id}"]`),
    residuos: alvo.querySelector(`[data-residuos="${e.id}"]`),
    botao: alvo.querySelector(`[data-especie="${e.id}"]`),
    estado: alvo.querySelector(`[data-estado="${e.id}"]`),
  }));

  function parar() {
    tocando = false;
    if (quadro != null) cancelAnimationFrame(quadro);
    quadro = null;
    ultimoInstante = ultimaPintura = null;
    botaoReproduzir.textContent = movimentoReduzido.matches
      ? 'Avançar fase →'
      : posicao >= 100
        ? '▶ Rever sequência'
        : '▶ Reproduzir';
    botaoReproduzir.setAttribute('aria-pressed', 'false');
  }

  function inspecionar(estados) {
    painel.hidden = !selecionada;
    if (!selecionada) return;
    const especie = especies.find((e) => e.id === selecionada);
    const estado = estados.find((e) => e.id === selecionada).estado;
    const texto = `<div><span class="crescimento-inspecao-etiqueta">${rotulos[especie.estrato]} · ${escapar(estado.estado)}</span><h3>${escapar(especie.nome)}</h3><p class="cientifico">${escapar(especie.nomeCientifico)}</p><p>${escapar(perfisVisuais[especie.id].detalhe)}</p><a href="especies.html#${especie.id}">Ver ficha e referências →</a></div><button type="button" class="crescimento-fechar" aria-label="Fechar detalhes da planta">×</button>`;
    if (painel.innerHTML !== texto) painel.innerHTML = texto;
  }

  function atualizar(valor, anunciar = true) {
    if (encerrado) return;
    posicao = Math.max(0, Math.min(100, Number(valor) || 0));
    const indice = faseDoProgresso(posicao);
    const fase = fases[indice];
    const estados = elementos.map((ref) => ({
      id: ref.especie.id,
      estado: estadoDaPlanta(ref.especie, posicao, saf.fases),
    }));
    slider.value = String(Math.round(posicao));
    slider.setAttribute(
      'aria-valuetext',
      `${fase.nome}; posição ilustrativa ${Math.round(posicao)} de 100`,
    );
    if (!tocando)
      botaoReproduzir.textContent = movimentoReduzido.matches
        ? 'Avançar fase →'
        : posicao >= 100
          ? '▶ Rever sequência'
          : '▶ Reproduzir';
    alvo.dataset.faseAtual = fase.chave;
    alvo.dataset.progresso = String(posicao);
    alvo
      .querySelectorAll('[data-fase]')
      .forEach((b, i) => b.setAttribute('aria-pressed', String(i === indice)));
    elementos.forEach((ref, i) => {
      const estado = estados[i].estado;
      ref.planta.innerHTML = desenharEspecie(ref.especie, estado);
      ref.planta.style.opacity = estado.opacidade.toFixed(3);
      ref.raiz.innerHTML = desenharRaizes(ref.especie, estado);
      ref.raiz.style.opacity = (estado.presente ? estado.opacidade * 0.8 : 0.18).toFixed(3);
      ref.residuos.style.opacity = estado.residuos.toFixed(3);
      ref.item.classList.toggle('planta-selecionada', selecionada === ref.especie.id);
      ref.item.classList.toggle(
        'planta-secundaria',
        selecionada != null && selecionada !== ref.especie.id,
      );
      ref.botao.setAttribute('aria-pressed', String(selecionada === ref.especie.id));
      ref.botao.classList.toggle('ciclo-encerrado', !estado.presente);
      if (ref.estado.textContent !== estado.estado) ref.estado.textContent = estado.estado;
    });
    const presentes = estados.filter((e) => e.estado.presente);
    const aviso = `${fase.nome}: ${presentes.length} plantas visíveis no arranjo.`;
    if (anunciar || aviso !== ultimoAviso) {
      leitura.innerHTML = `<strong>${fase.nome}</strong><span>${presentes.length} de ${especies.length} espécies visíveis</span>${compacto ? '' : `<p>${fase.texto}</p>`}`;
      ultimoAviso = aviso;
    }
    inspecionar(estados);
    alvo.querySelector('desc').textContent =
      `${aviso} ${especies.map((e, i) => `${i + 1}: ${e.nome}, ${estados[i].estado.estado}`).join('. ')}. Desenho sem escala ou previsão de crescimento.`;
  }

  function selecionar(idEspecie) {
    parar();
    selecionada = selecionada === idEspecie ? null : idEspecie;
    atualizar(posicao);
    if (selecionada) {
      if (compacto) alvo.querySelector('.crescimento-extras').open = true;
      const panorama = alvo.querySelector('.crescimento-panorama');
      const largura = alvo.querySelector('svg').getBoundingClientRect().width;
      const x = (espacos[especies.findIndex((e) => e.id === selecionada)] * largura) / 1000;
      panorama.scrollTo({
        left: Math.max(0, x - panorama.clientWidth / 2),
        behavior: movimentoReduzido.matches ? 'auto' : 'smooth',
      });
    }
  }
  ouvir(alvo.querySelector('.crescimento-legenda'), 'click', (evento) => {
    const botao = evento.target.closest('[data-especie]');
    if (botao) selecionar(botao.dataset.especie);
  });
  ouvir(alvo.querySelector('svg'), 'click', (evento) => {
    const area = evento.target.closest('[data-selecionar]');
    if (area) selecionar(area.dataset.selecionar);
  });
  ouvir(painel, 'click', (evento) => {
    if (evento.target.closest('.crescimento-fechar')) {
      const anterior = selecionada;
      selecionada = null;
      atualizar(posicao);
      elementos.find((e) => e.especie.id === anterior)?.botao.focus();
    }
  });
  alvo.querySelectorAll('[data-fase]').forEach((botao) =>
    ouvir(botao, 'click', () => {
      parar();
      atualizar(Number(botao.dataset.fase) * 50);
    }),
  );
  ouvir(slider, 'input', () => {
    parar();
    atualizar(slider.value);
  });
  ouvir(alvo.querySelector('.crescimento-reiniciar'), 'click', () => {
    parar();
    atualizar(0);
  });
  ouvir(alvo.querySelector('input[type=checkbox]'), 'change', (evento) =>
    alvo.classList.toggle('sem-raizes', !evento.target.checked),
  );

  function animar(instante) {
    if (encerrado || !alvo.isConnected) {
      parar();
      return;
    }
    if (!tocando) return;
    if (ultimoInstante == null) ultimoInstante = instante;
    const delta = Math.min(100, instante - ultimoInstante);
    ultimoInstante = instante;
    posicao = Math.min(100, posicao + (delta / 200) * Number(velocidade.value));
    if (ultimaPintura == null || instante - ultimaPintura >= 40 || posicao >= 100) {
      atualizar(posicao, false);
      ultimaPintura = instante;
    }
    if (posicao >= 100) {
      parar();
      return;
    }
    quadro = requestAnimationFrame(animar);
  }
  ouvir(botaoReproduzir, 'click', () => {
    if (tocando) {
      parar();
      return;
    }
    if (movimentoReduzido.matches) {
      atualizar(posicao >= 100 ? 0 : Math.min(100, (faseDoProgresso(posicao) + 1) * 50));
      return;
    }
    if (posicao >= 100) atualizar(0);
    tocando = true;
    botaoReproduzir.textContent = 'Ⅱ Pausar';
    botaoReproduzir.setAttribute('aria-pressed', 'true');
    quadro = requestAnimationFrame(animar);
  });
  const atualizarPreferencia = () => {
    parar();
    botaoReproduzir.textContent = movimentoReduzido.matches ? 'Avançar fase →' : '▶ Reproduzir';
  };
  movimentoReduzido.addEventListener('change', atualizarPreferencia);
  ouvir(document, 'visibilitychange', () => {
    if (document.hidden) parar();
  });
  atualizar(0);
  atualizarPreferencia();
  return () => {
    encerrado = true;
    parar();
    abortador.abort();
    movimentoReduzido.removeEventListener('change', atualizarPreferencia);
  };
}
