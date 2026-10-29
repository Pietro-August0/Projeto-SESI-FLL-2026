import { perfisVisuais, estadoDaPlanta } from './evolucao-plantas.js';
import { desenharEspecie } from './desenhos-plantas.js';
/* especies.js controla a busca e os filtros de especies.html.
 * Os dados são carregados uma vez; cada pesquisa filtra a lista que já está na memória.
 */
import { carregarJSON, rotulos, escapar, mostrarErro } from './utils.js';
import { consultarInteracao } from './saf.js';
import { apresentarInteracao, apresentarFaixas, linkFonte } from './conteudo-catalogo.js';

// let é usado porque a lista vazia será substituída pelo conteúdo do arquivo JSON.
let catalogo = [];
let interacoes = [];
let fontes = {};
// Referências aos três controles: pesquisa livre, camada da vegetação e papel no sistema.
const busca = document.querySelector('#busca');
const estrato = document.querySelector('#filtro-estrato');
const funcao = document.querySelector('#filtro-funcao');
const escopo = document.querySelector('#filtro-escopo');
// Facilita encontrar "Feijão" ao escrever "feijao": NFD separa as marcas de acento,
// replace remove essas marcas e toLowerCase evita diferenças entre maiúsculas e minúsculas.
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Relê os controles e apresenta somente as espécies que atendem a todas as escolhas.
function atualizar() {
  const termo = normalizar(busca.value.trim());
  const filtradas = catalogo.filter((especie) => {
    // A pesquisa aceita trechos do nome comum, do científico ou da função principal.
    const texto = normalizar(
      `${especie.id} ${especie.nome} ${especie.nomeCientifico} ${especie.funcaoPrincipal} ${especie.descricao || ''} ${(especie.registrosTaiobas || []).map((r) => r.nomeOriginal).join(' ')} ${especie.papeis.map((p) => rotulos[p] || p).join(' ')}`,
    );
    const correspondeBusca = texto.includes(termo);
    // Um filtro vazio aceita qualquer valor. && exige que os três testes passem.
    const correspondeEstrato = !estrato.value || especie.estrato === estrato.value;
    const correspondeFuncao = !funcao.value || especie.papeis.includes(funcao.value);
    return (
      correspondeBusca &&
      correspondeEstrato &&
      correspondeFuncao &&
      (!escopo.value || especie.situacaoUso === escopo.value)
    );
  });
  // Mostra tanto o número encontrado quanto o total original do catálogo.
  document.querySelector('#contagem').textContent =
    `${filtradas.length} de ${catalogo.length} espécies`;
  // map cria o HTML de cada cartão; join reúne os cartões numa única string.
  // details/summary permitem abrir os dados sem programar um botão de expansão.
  // ?? mantém explícita a falta de informação, em vez de apresentar um zero inventado.
  document.querySelector('#catalogo').innerHTML =
    filtradas
      .map(
        (e) => `
        <article class="especie-card" id="${e.id}">
            <figure class="especie-foto">
                <div class="foto-reserva" ${e.imagem ? 'hidden' : ''}>
                    <img src="assets/icones/manaca.svg" alt="" width="40" height="46">
                    <span>${e.imagem ? 'Foto indisponível no momento' : 'Sem foto disponível'}</span>
                </div>
                ${
                  e.imagem
                    ? `<img class="foto-planta" src="${escapar(e.imagem.url)}" alt="${escapar(e.imagem.alt)}" loading="lazy" width="640" height="400" referrerpolicy="no-referrer">
                <figcaption><a href="${escapar(e.imagem.fonteUrl)}" target="_blank" rel="noopener noreferrer">${escapar(e.imagem.autor)}</a> · <a href="${escapar(e.imagem.licencaUrl)}" target="_blank" rel="noopener noreferrer">${escapar(e.imagem.licenca)}</a> · recorte de exibição${e.imagem.nota ? `<span class="foto-nota">${escapar(e.imagem.nota)}</span>` : ''}</figcaption>`
                    : ''
                }
                ${!e.imagem ? `<figcaption>${escapar(e.imagemAusenteNota || 'Não há foto disponível para este registro no catálogo.')}</figcaption>` : ''}
            </figure>
            <div class="especie-cabecalho">
                <span class="estrato-tag">${rotulos[e.estrato] || 'A confirmar'}</span>
                <span class="muted">${rotulos[e.sucessao] || 'Fase a confirmar'}</span>
            </div>
            <h2>${escapar(e.nome)}</h2>
            <p class="cientifico">${escapar(e.nomeCientifico)}</p>
            ${e.registrosTaiobas?.length ? '<p class="nota-curadoria"><strong>Grupo Taiobas do Matão USP</strong> · Banco de 2021 providenciado pelo parceiro.' + (e.registrosTaiobas.some((r) => r.identificacao === 'PENDENTE') ? ' Identificação pendente.' : '') + '</p>' : ''}
            <p>${escapar(e.funcaoPrincipal)}</p>
            ${e.descricao ? `<p>${escapar(e.descricao)}</p>` : ''}
            <div class="funcoes">${e.papeis.map((p) => `<span>${rotulos[p] || p}</span>`).join('')}</div>
            <details>
                <summary>Conhecer a planta e suas fontes</summary>
                <dl>
                    <dt>Ciclo no modelo</dt>
                    <dd>${{ CURTO: 'Curto', MEDIO: 'Médio', LONGO: 'Longo', PERENE: 'Perene' }[e.ciclo] || 'Não informado'}</dd>
                    <dt>Produção de biomassa</dt>
                    <dd>${e.produzBiomassa == null ? 'Não confirmada' : e.produzBiomassa ? 'Registrada' : 'Não registrada'}</dd>
                    <dt>Proteção do solo</dt>
                    <dd>${e.protegeSolo == null ? 'Não confirmada' : e.protegeSolo ? 'Registrada' : 'Não registrada'}</dd>
                    <dt>Fixação de N</dt>
                    <dd>${e.fixaNitrogenio == null ? 'Não confirmada' : e.fixaNitrogenio ? 'Capacidade registrada; depende da simbiose e do manejo' : 'Não fixadora segundo a referência'}</dd>
                </dl>
                <p class="nota-curadoria">${escapar(e.motivoUso || '')}</p>
                ${perfisVisuais[e.id] ? '<div class="preview-planta" data-planta="' + e.id + '"><h3>Modelo de desenvolvimento</h3><svg viewBox="-130 -270 260 290" width="260" height="290" role="img" aria-label="Ilustração esquemática de ' + escapar(e.nome) + '"></svg><label>Etapa ilustrativa <input type="range" min="0" max="100" value="70" aria-label="Etapa ilustrativa de ' + escapar(e.nome) + '"></label><p class="muted">Representação esquemática. Não representa dias, escala real ou garantia de produção.</p></div>' : ''}
                <h3>Condições de cultivo</h3>
                <dl>
                    <dt>Luz</dt><dd>${escapar(e.cultivo.luminosidade)}</dd>
                    <dt>Solo e drenagem</dt><dd>${escapar(e.cultivo.solo)}</dd>
                    <dt>Água</dt><dd>${escapar(e.cultivo.agua)}</dd>
                </dl>
                ${e.cultivo.taxonomia ? `<p class="nota-curadoria">${escapar(e.cultivo.taxonomia)}</p>` : ''}
                <h3>Referências numéricas</h3>
                <p class="muted">Faixas preferenciais e registros de ocorrência têm significados diferentes. Consulte o contexto de cada valor.</p>
                <ul class="faixas-consulta">${apresentarFaixas(e.cultivo.faixas, fontes)}</ul>
                <h3>Manejo e nutrição</h3>
                <p>${escapar(e.cultivo.manejo)}</p>
                <p>${escapar(e.cultivo.nutricao)}</p>
                <p class="nota-curadoria">N, P e K do formulário usam unidades demonstrativas. Não há conversão para doses de adubo. Umidade do ar e chuva não são umidade do solo; referências de clima não entram como limites de exclusão nas propostas.</p>
                ${e.funcoesDocumentadas?.length ? `<h3>Funções verificadas nesta revisão</h3><ul class="fontes-ficha">${e.funcoesDocumentadas.map((f) => `<li>${escapar(f.contexto)} ${linkFonte(fontes[f.fonte])}</li>`).join('')}</ul>` : ''}
                <h3>Fontes desta ficha</h3>
                <ul class="fontes-ficha">${e.cultivo.fontes.map((id) => `<li>${linkFonte(fontes[id])}<span>${escapar(fontes[id].trecho)}</span></li>`).join('')}</ul>
                <p class="muted">Papéis e estratos variam com o manejo. Revisão da ficha: ${escapar(e.revisadoEm)}.</p>
                <h3>Relações com outras plantas</h3>
                ${
                  interacoes
                    .filter((r) => r.especieA === e.id || r.especieB === e.id)
                    .map((r) => {
                      const outra = catalogo.find(
                        (p) => p.id === (r.especieA === e.id ? r.especieB : r.especieA),
                      );
                      return apresentarInteracao(r, `${e.nome} + ${outra.nome}`);
                    })
                    .join('') ||
                  '<p>Nenhum par documentado nesta curadoria. Isso não significa incompatibilidade nem benefício comprovado.</p>'
                }
            </details>
        </article>
    `,
      )
      .join('') ||
    '<p class="estado-vazio">Nenhuma espécie encontrada. Tente outro nome ou limpe os filtros.</p>';
  // Uma conexão indisponível não deve deixar uma imagem quebrada no cartão.
  document.querySelectorAll('.preview-planta').forEach((painel) => {
    const e = catalogo.find((e) => e.id === painel.dataset.planta);
    const fases = { desenvolvimento: [e.id], estabelecido: [e.id] };
    const desenhar = () => {
      painel.querySelector('svg').innerHTML = desenharEspecie(
        e,
        estadoDaPlanta(e, painel.querySelector('input').value, fases),
      );
    };
    painel.querySelector('input').addEventListener('input', desenhar);
    desenhar();
  });
  document.querySelectorAll('.foto-planta').forEach((foto) => {
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
    const [especies, cultivo, referencias, relacoes] = await Promise.all([
      carregarJSON('especies.json'),
      carregarJSON('cultivo.json'),
      carregarJSON('referencias.json'),
      carregarJSON('interacoes.json'),
    ]);
    fontes = referencias;
    interacoes = relacoes;
    catalogo = especies.map((e) => ({ ...e, cultivo: cultivo.find((c) => c.id === e.id) }));
    iniciarConsulta();
    atualizar();
    abrirDestino();
  } catch (erro) {
    mostrarErro(document.querySelector('#erro'), erro);
  }
}
// input responde tanto à digitação quanto à mudança das opções dos seletores.
[busca, estrato, funcao, escopo].forEach((campo) => campo.addEventListener('input', atualizar));

// Limpar devolve os controles ao estado inicial, redesenha a lista e permite pesquisar de novo.
document.querySelector('#limpar').addEventListener('click', () => {
  busca.value = '';
  estrato.value = '';
  funcao.value = '';
  escopo.value = '';
  atualizar();
  busca.focus();
});
iniciar();

// Links vindos de uma proposta abrem a ficha ou a consulta correspondente.
function abrirDestino() {
  const destino = document.getElementById(location.hash.slice(1));
  if (!destino) return;
  const detalhes = destino.matches('details') ? destino : destino.querySelector('details');
  if (detalhes) detalhes.open = true;
  requestAnimationFrame(() => destino.scrollIntoView({ block: 'start' }));
}
window.addEventListener('hashchange', abrirDestino);

// Consulta independente dos filtros: ausência de par continua explícita.
function iniciarConsulta() {
  const seletores = [document.querySelector('#relacao-a'), document.querySelector('#relacao-b')];
  const opcoes = catalogo
    .map((e) => `<option value="${e.id}">${escapar(e.nome)}</option>`)
    .join('');
  seletores.forEach((s) => {
    s.innerHTML = opcoes;
    s.addEventListener('change', consultar);
  });
  seletores[0].value = 'banana';
  seletores[1].value = 'cacau';
  document.querySelector('#total-relacoes').textContent = `${interacoes.length} pares com fontes`;
  function consultar() {
    const [a, b] = seletores.map((s) => s.value);
    const painel = document.querySelector('#consulta-relacao');
    if (a === b) {
      painel.textContent = 'Escolha duas plantas diferentes para consultar uma relação.';
      return;
    }
    const nomes = [a, b].map((id) => catalogo.find((e) => e.id === id).nome).join(' + ');
    painel.innerHTML = apresentarInteracao(consultarInteracao(a, b, interacoes), nomes);
  }
  consultar();
}
