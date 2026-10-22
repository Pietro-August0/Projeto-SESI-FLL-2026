/* A ideia do perfil de solo e dos controles de reprodução veio do modelo de um aluno.
 * Aqui o desenho usa as plantas e as fases da proposta. É uma ilustração, não um
 * modelo agronômico: o tamanho das plantas e raízes não representa medidas reais. */
import { escapar, rotulos } from './utils.js';

const fases = [
    { chave: 'implantacao', nome: 'Implantação', texto: 'A cobertura começa e as mudas perenes são plantadas junto das culturas iniciais.' },
    { chave: 'desenvolvimento', nome: 'Desenvolvimento', texto: 'As copas e raízes se ampliam na ilustração. Culturas curtas cedem espaço e o manejo da biomassa continua.' },
    { chave: 'estabelecido', nome: 'Estabelecido', texto: 'As perenes estruturam o sistema. Cobertura, renovação e manejo continuam necessários.' }
];

// As formas representam o porte e alguns grupos de plantas, sem identificação botânica.
function desenharPlanta(especie) {
    if (especie.estrato === 'COBERTURA') return `<g fill="var(--folha)"><ellipse cx="-16" cy="-13" rx="25" ry="12" transform="rotate(-18)"/><ellipse cx="18" cy="-10" rx="24" ry="12" transform="rotate(15)"/><path d="M0 0v-26" stroke="var(--acao)" stroke-width="3"/></g>`;
    if (especie.id === 'banana') return `<path d="M-6 0-4-96h8L8 0Z" fill="#86AE68"/><g fill="var(--folha)">${[-65, -32, 0, 32, 65].map((angulo, i) => `<path d="M0-90C-22-111-16-160 0-176C19-152 21-110 0-90Z" transform="rotate(${angulo} 0 -90)" fill="${i % 2 ? '#63B384' : 'var(--folha)'}"/>`).join('')}</g>`;
    if (['acai', 'pupunha'].includes(especie.id)) return `<path d="M-4 0 0-155 5 0" fill="#8C704D"/><g fill="var(--folha)">${[-70, -38, 0, 38, 70].map(a => `<path d="M0-151Q-15-201 0-211Q18-186 0-151" transform="rotate(${a} 0 -151)"/>`).join('')}</g>`;
    if (especie.id === 'milho') return `<path d="M0 0V-125" stroke="#689657" stroke-width="5"/><g fill="var(--folha)"><path d="M0-26Q-42-68-39-79Q-5-65 0-26M0-48Q41-87 37-98Q5-87 0-48M0-75Q-29-109-27-117Q-4-109 0-75"/></g><path d="M0-125v-20m0 7-10-8m10 8 10-8" stroke="#AA9364" stroke-width="3"/>`;
    if (['abacaxi', 'mandioca'].includes(especie.id)) return `<path d="M0 0V-35" stroke="#8C704D" stroke-width="4"/><g fill="var(--folha)">${[-65, -35, 0, 35, 65].map(a => `<path d="M0-22Q-16-62 0-91Q12-56 0-22" transform="rotate(${a} 0 -22)"/>`).join('')}</g>`;
    const alto = ['ALTO', 'EMERGENTE'].includes(especie.estrato);
    const h = alto ? 164 : especie.estrato === 'BAIXO' ? 60 : 100;
    const r = alto ? 35 : 23;
    return `<path d="M-5 0-3-${h}h6L6 0Z" fill="#8C704D"/><path d="M0-${h - 30}l-22-24m22 17 25-25" stroke="#8C704D" stroke-width="4"/>
        <g fill="var(--folha)"><ellipse cx="-22" cy="-${h - 18}" rx="${r}" ry="${r * .8}"/><ellipse cx="24" cy="-${h - 20}" rx="${r}" ry="${r * .85}"/><ellipse cy="-${h + 10}" rx="${r}" ry="${r}" fill="#59A879"/><ellipse cx="-12" cy="-${h + 18}" rx="${r * .55}" ry="${r * .6}" fill="#83C699"/></g>`;
}

/** Monta uma cena independente. A função devolvida encerra a reprodução ao trocar a proposta. */
export function iniciarCrescimento(alvo, saf, { compacto = false } = {}) {
    const especies = [...saf.especies].sort((a, b) => ['EMERGENTE', 'ALTO', 'MEDIO', 'BAIXO', 'COBERTURA'].indexOf(a.estrato) - ['EMERGENTE', 'ALTO', 'MEDIO', 'BAIXO', 'COBERTURA'].indexOf(b.estrato));
    let posicao = 50;
    let timer = null;
    let encerrado = false;
    const identificador = alvo.id;
    const cenaId = `cena-${identificador}`;
    alvo.classList.add('crescimento');
    alvo.innerHTML = `
        <div class="crescimento-titulo"><h2>${compacto ? 'Veja a agrofloresta crescer' : 'Sua agrofloresta ao longo do tempo'}</h2>${compacto ? '' : '<p>Escolha uma fase ou use Reproduzir. A legenda acompanha as plantas de cada fase.</p>'}</div>
        <figure class="crescimento-figura">
            <svg viewBox="0 0 720 420" role="img" aria-labelledby="${cenaId}-titulo ${cenaId}-descricao" class="crescimento-cena">
                <title id="${cenaId}-titulo">Perfil ilustrado de um sistema agroflorestal</title>
                <desc id="${cenaId}-descricao"></desc>
                <defs><pattern id="${cenaId}-terra" width="32" height="26" patternUnits="userSpaceOnUse"><circle cx="7" cy="6" r="1.6" fill="#7A644A" opacity=".3"/><circle cx="24" cy="18" r="2" fill="#B29772" opacity=".5"/></pattern></defs>
                <path fill="#EDF8F2" d="M0 0h720v265H0z"/>
                <circle cx="640" cy="56" r="24" fill="var(--roxo)" opacity=".42"/>
                <path d="M0 233Q90 170 180 225T365 211T550 219T720 207V265H0Z" fill="#DEF1E5"/>
                <path d="M0 244Q110 203 230 242T460 231T720 236V265H0Z" fill="#CCE9D7"/>
                <path d="M74 74q15-12 30 0m416 27q12-10 24 0" stroke="#9AAFA2" stroke-width="2" fill="none"/>
                <path fill="#D9BD95" d="M0 265h720v155H0z"/>
                <path fill="#C6A980" d="M0 320q180-22 360 0t360 0v100H0z"/>
                <path fill="url(#${cenaId}-terra)" d="M0 265h720v155H0z"/>
                <path class="solo-cobertura" fill="#776043" d="M0 264h720v10H0z"/>
                <g class="grupo-raizes">${especies.map((e, i) => {
                    const x = 65 + i * (590 / Math.max(1, especies.length - 1));
                    return `<g transform="translate(${x} 267)"><g data-raiz="${escapar(e.id)}" class="raiz-desenho"><path d="M0 0Q-4 44 0 116M-1 22Q-21 38-30 57M0 46Q23 61 35 86M0 73Q-13 88-17 105M-16 42l-19 2M17 67l23 3"/></g></g>`;
                }).join('')}</g>
                <g class="grupo-plantas">${especies.map((e, i) => {
                    const x = 65 + i * (590 / Math.max(1, especies.length - 1));
                    return `<g transform="translate(${x} 265)"><g data-planta="${escapar(e.id)}" class="planta-desenho"><title>${escapar(e.nome)} · ${rotulos[e.estrato]}</title>${desenharPlanta(e)}</g></g>`;
                }).join('')}</g>
                <text x="18" y="394" class="solo-rotulo">Solo e raízes · representação sem escala</text>
            </svg>
            <figcaption class="visualmente-oculto">Ilustração de plantas e raízes baseada no modelo visual de um aluno do projeto.</figcaption>
        </figure>
        <div class="crescimento-controles">
            <div class="crescimento-etapas" role="group" aria-label="Escolher fase da agrofloresta">${fases.map((f, i) => `<button type="button" data-fase="${i}" aria-pressed="false">${f.nome}</button>`).join('')}</div>
            <button type="button" class="crescimento-reproduzir" aria-pressed="false">▶ Reproduzir</button>
        </div>
        <div class="crescimento-linha"><label for="tempo-${identificador}">Percorrer as fases</label><input id="tempo-${identificador}" type="range" min="0" max="100" value="50" step="1" aria-valuetext="Desenvolvimento"></div>
        <div class="crescimento-leitura" aria-live="polite" aria-atomic="true"></div>
        ${compacto ? '' : '<label class="crescimento-raizes"><input type="checkbox" checked> Mostrar raízes</label>'}
        <ul class="crescimento-legenda" aria-label="Espécies representadas"></ul>
        <p class="crescimento-nota">Representação ilustrativa, sem escala ou previsão de crescimento. As fases dependem das espécies e do manejo.</p>`;

    const slider = alvo.querySelector('input[type=range]');
    const reproduzir = alvo.querySelector('.crescimento-reproduzir');
    const leitura = alvo.querySelector('.crescimento-leitura');
    const legenda = alvo.querySelector('.crescimento-legenda');

    function parar() {
        clearInterval(timer);
        timer = null;
        reproduzir.textContent = '▶ Reproduzir';
        reproduzir.setAttribute('aria-pressed', 'false');
    }

    function atualizar(valor) {
        posicao = Math.max(0, Math.min(100, valor));
        const indice = posicao < 25 ? 0 : posicao < 75 ? 1 : 2;
        const fase = fases[indice];
        const ativas = saf.fases[fase.chave];
        slider.value = String(posicao);
        slider.setAttribute('aria-valuetext', fase.nome);
        alvo.dataset.faseAtual = fase.chave;
        alvo.querySelectorAll('[data-fase]').forEach((botao, i) => botao.setAttribute('aria-pressed', String(i === indice)));
        especies.forEach(e => {
            const ativa = ativas.includes(e.id);
            const crescimento = e.ciclo === 'CURTO' ? Math.min(1, .4 + posicao / 40) : Math.min(1, .26 + posicao / 85);
            const planta = alvo.querySelector(`[data-planta="${e.id}"]`);
            const raiz = alvo.querySelector(`[data-raiz="${e.id}"]`);
            planta.style.transform = `scale(${crescimento.toFixed(3)})`;
            raiz.style.transform = `scale(${Math.min(1, .25 + posicao / 100).toFixed(3)})`;
            planta.style.opacity = raiz.style.opacity = ativa ? '1' : '0';
            planta.setAttribute('aria-hidden', String(!ativa));
        });
        const nomes = especies.filter(e => ativas.includes(e.id)).map(e => e.nome);
        const texto = `<strong>${fase.nome}</strong><span>${ativas.length} espécies representadas nesta fase</span>${compacto ? '' : `<p>${fase.texto}</p>`}`;
        if (leitura.innerHTML !== texto) leitura.innerHTML = texto;
        const lista = especies.map(e => `<li class="${ativas.includes(e.id) ? 'presente' : 'ciclo-encerrado'}"><span class="legenda-ponto" aria-hidden="true"></span>${escapar(e.nome)}${ativas.includes(e.id) ? '' : ' <small>· ciclo encerrado no modelo</small>'}</li>`).join('');
        if (legenda.innerHTML !== lista) legenda.innerHTML = lista;
        alvo.querySelector('desc').textContent = `${fase.nome}. Plantas presentes: ${nomes.join(', ')}. Plantas e raízes ilustrativas; não representam alturas ou profundidades reais.`;
    }

    alvo.querySelectorAll('[data-fase]').forEach(botao => botao.addEventListener('click', () => {
        parar(); atualizar(Number(botao.dataset.fase) * 50);
    }));
    slider.addEventListener('input', () => { parar(); atualizar(Number(slider.value)); });
    reproduzir.addEventListener('click', () => {
        if (timer) { parar(); return; }
        if (posicao >= 100) atualizar(0);
        reproduzir.textContent = 'Ⅱ Pausar';
        reproduzir.setAttribute('aria-pressed', 'true');
        timer = setInterval(() => {
            if (encerrado || !alvo.isConnected) { parar(); return; }
            atualizar(posicao + 1);
            if (posicao >= 100) parar();
        }, 120);
    });
    alvo.querySelector('input[type=checkbox]')?.addEventListener('change', evento => {
        alvo.querySelector('.grupo-raizes').hidden = !evento.target.checked;
        alvo.classList.toggle('sem-raizes', !evento.target.checked);
    });
    const aoOcultar = () => { if (document.hidden) parar(); };
    document.addEventListener('visibilitychange', aoOcultar);
    atualizar(posicao);
    return () => { encerrado = true; parar(); document.removeEventListener('visibilitychange', aoOcultar); };
}
