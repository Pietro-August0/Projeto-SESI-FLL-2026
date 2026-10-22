/* especies.js controla a busca e os filtros de especies.html.
 * Os dados são carregados uma vez; cada pesquisa filtra a lista que já está na memória.
 */
import { carregarJSON, rotulos, escapar, mostrarErro } from './utils.js';

// let é usado porque a lista vazia será substituída pelo conteúdo do arquivo JSON.
let catalogo = [];
// Referências aos três controles: pesquisa livre, camada da vegetação e papel no sistema.
const busca = document.querySelector('#busca');
const estrato = document.querySelector('#filtro-estrato');
const funcao = document.querySelector('#filtro-funcao');
// Facilita encontrar "Feijão" ao escrever "feijao": NFD separa as marcas de acento,
// replace remove essas marcas e toLowerCase evita diferenças entre maiúsculas e minúsculas.
function normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Relê os controles e apresenta somente as espécies que atendem a todas as escolhas.
function atualizar() {
    const termo = normalizar(busca.value.trim());
    const filtradas = catalogo.filter(especie => {
        // A pesquisa aceita trechos do nome comum, do científico ou da função principal.
        const texto = normalizar(`${especie.nome} ${especie.nomeCientifico} ${especie.funcaoPrincipal} ${especie.descricao || ''} ${especie.papeis.map(p => rotulos[p] || p).join(' ')}`);
        const correspondeBusca = texto.includes(termo);
        // Um filtro vazio aceita qualquer valor. && exige que os três testes passem.
        const correspondeEstrato = !estrato.value || especie.estrato === estrato.value;
        const correspondeFuncao = !funcao.value || especie.papeis.includes(funcao.value);
        return correspondeBusca && correspondeEstrato && correspondeFuncao;
    });
    // Mostra tanto o número encontrado quanto o total original do catálogo.
    document.querySelector('#contagem').textContent = `${filtradas.length} de ${catalogo.length} espécies`;
    // map cria o HTML de cada cartão; join reúne os cartões numa única string.
    // details/summary permitem abrir os dados sem programar um botão de expansão.
    // ?? mantém explícita a falta de informação, em vez de apresentar um zero inventado.
    document.querySelector('#catalogo').innerHTML = filtradas.map(e => `
        <article class="especie-card" id="${e.id}">
            <figure class="especie-foto">
                <div class="foto-reserva" ${e.imagem ? 'hidden' : ''}>
                    <img src="assets/icones/manaca.svg" alt="" width="40" height="46">
                    <span>${e.imagem ? 'Foto indisponível no momento' : 'Fotografia em preparação'}</span>
                </div>
                ${e.imagem ? `<img class="foto-planta" src="${escapar(e.imagem.url)}" alt="${escapar(e.imagem.alt)}" loading="lazy" width="640" height="400" referrerpolicy="no-referrer">
                <figcaption><a href="${escapar(e.imagem.fonteUrl)}" target="_blank" rel="noopener noreferrer">${escapar(e.imagem.autor)}</a> · <a href="${escapar(e.imagem.licencaUrl)}" target="_blank" rel="noopener noreferrer">${escapar(e.imagem.licenca)}</a> · recorte de exibição</figcaption>` : ''}
            </figure>
            <div class="especie-cabecalho">
                <span class="estrato-tag">${rotulos[e.estrato]}</span>
                <span class="muted">${rotulos[e.sucessao]}</span>
            </div>
            <h2>${escapar(e.nome)}</h2>
            <p class="cientifico">${escapar(e.nomeCientifico)}</p>
            <p>${escapar(e.funcaoPrincipal)}</p>
            ${e.descricao ? `<p>${escapar(e.descricao)}</p>` : ''}
            <div class="funcoes">${e.papeis.map(p => `<span>${rotulos[p] || p}</span>`).join('')}</div>
            <details>
                <summary>Conhecer a planta e suas fontes</summary>
                <dl>
                    <dt>Ciclo no modelo</dt>
                    <dd>${({ CURTO: 'Curto', MEDIO: 'Médio', LONGO: 'Longo', PERENE: 'Perene' })[e.ciclo] || 'Não informado'}</dd>
                    <dt>Produção de biomassa</dt>
                    <dd>${e.produzBiomassa == null ? 'Não confirmada' : e.produzBiomassa ? 'Registrada' : 'Não registrada'}</dd>
                    <dt>Proteção do solo</dt>
                    <dd>${e.protegeSolo == null ? 'Não confirmada' : e.protegeSolo ? 'Registrada' : 'Não registrada'}</dd>
                    <dt>pH</dt>
                    <dd>${e.phMin == null && e.phMax == null ? 'Não confirmado' : `${e.phMin ?? '?'} a ${e.phMax ?? '?'}`}</dd>
                    <dt>Temperatura / umidade</dt>
                    <dd>Não confirmadas</dd>
                    <dt>Demanda N / P / K</dt>
                    <dd>${e.demandaN ?? 'Não confirmada'} / ${e.demandaP ?? 'não confirmada'} / ${e.demandaK ?? 'não confirmada'}</dd>
                    <dt>Aptidão regional</dt>
                    <dd>${e.estados ? e.estados.join(', ') : 'Não validada'}</dd>
                    <dt>Fixação de N</dt>
                    <dd>${e.fixaNitrogenio == null ? 'Não confirmada' : e.fixaNitrogenio ? 'Registrada' : 'Não registrada'}</dd>
                </dl>
                <p>${escapar(e.observacaoManejo)}</p>
                <p class="muted">Papéis, estratos e fases são uma organização didática, variável com o manejo. Limites numéricos ausentes não entram no cálculo.</p>
                <a href="${escapar(e.fonte.url)}" target="_blank" rel="noopener noreferrer">${escapar(e.fonte.titulo)} ↗</a>
                ${e.fonteComplementar ? `<p><a href="${escapar(e.fonteComplementar.url)}" target="_blank" rel="noopener noreferrer">${escapar(e.fonteComplementar.titulo)} ↗</a></p>` : ''}
            </details>
        </article>
    `).join('') || '<p class="estado-vazio">Nenhuma espécie encontrada. Tente outro nome ou limpe os filtros.</p>';
    // Uma conexão indisponível não deve deixar uma imagem quebrada no cartão.
    document.querySelectorAll('.foto-planta').forEach(foto => {
        const mostrarReserva = () => {
            foto.hidden = true;
            foto.closest('figure').querySelector('.foto-reserva').hidden = false;
        };
        foto.addEventListener('error', mostrarReserva);
        if (foto.complete && !foto.naturalWidth) mostrarReserva();
    });
}

// Busca o arquivo uma vez e faz a primeira apresentação; uma falha aparece na página.
async function iniciar() {
    try {
        catalogo = await carregarJSON('especies.json');
        atualizar();
    } catch (erro) {
        mostrarErro(document.querySelector('#erro'), erro);
    }
}
// input responde tanto à digitação quanto à mudança das opções dos seletores.
[busca, estrato, funcao].forEach(campo => campo.addEventListener('input', atualizar));

// Limpar devolve os controles ao estado inicial, redesenha a lista e permite pesquisar de novo.
document.querySelector('#limpar').addEventListener('click', () => {
    busca.value = '';
    estrato.value = '';
    funcao.value = '';
    atualizar();
    busca.focus();
});
iniciar();
