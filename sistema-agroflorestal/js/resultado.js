/* resultado.js liga o cálculo à tela de resultado.html.
 * Lê a análise salva, pede o diagnóstico e as propostas, e cria o HTML que a pessoa explora.
 * O cálculo fica em diagnostico.js e saf.js; este arquivo cuida da apresentação.
 */
import { carregarJSON, lerAnalise, objetivos, rotulos, estratos, escapar, numero, mostrarErro } from './utils.js';
import { diagnosticar } from './diagnostico.js';
import { montarSAFs } from './saf.js';
import { iniciarCrescimento } from './crescimento.js';
import { apresentarInteracao } from './conteudo-catalogo.js';
let encerrarCrescimento = () => {};
// O HTML inicial contém esse espaço vazio; os cartões serão acrescentados nele.
const alvo = document.querySelector('#resultado');
const analise = lerAnalise();

// Desenha uma única proposta no painel compartilhado pelas abas.
function exibirProposta(saf) {
    encerrarCrescimento();
    // As chaves correspondem às fases guardadas em saf.fases; os valores são as explicações.
    const faseTextos = {
        implantacao: 'Cobertura, culturas curtas e plantio das mudas perenes.',
        desenvolvimento: 'Consolidação de frutíferas e suporte; manejo da biomassa.',
        estabelecido: 'Perenes, manutenção da cobertura e manejo contínuo.'
    };
    // Os códigos internos não têm acentos; estes títulos são os nomes apresentados.
    const nomesFases = {
        implantacao: 'Implantação',
        desenvolvimento: 'Desenvolvimento',
        estabelecido: 'Estabelecido'
    };
    // Cada expressão ${...} insere um valor ou um trecho de HTML na string entre crases.
    // Nos estratos, filter separa as espécies da camada e map cria seus links.
    // Nas fases, entries fornece [fase, ids]; find liga cada id ao nome da espécie.
    // Nas justificativas, cada motivo vira um li dentro de details, que pode ser expandido.
    // Interações sem fonte deixam o link vazio; relações desconhecidas continuam explícitas.
    document.querySelector('#proposta').innerHTML = `<div class="proposta-cabecalho">
                <h3>${escapar(saf.titulo)}</h3>
                <p>${escapar(saf.resumo)}</p>
                </div>
                <section id="crescimento-resultado" aria-label="Evolução visual desta proposta"></section>
                <details class="painel-extra"><summary>Entender as camadas e as fases do sistema</summary><h4>Uma composição em diferentes alturas</h4>
                <p class="muted">Estratos ilustrativos, sem escala de altura ou previsão de crescimento.</p>
                <div class="estratos">${estratos.map(estrato => `<div class="estrato estrato-${estrato.toLowerCase()}">
                <span class="estrato-nome">${rotulos[estrato]}</span>
                <div class="estrato-especies">${saf.especies.filter(e => e.estrato === estrato).map(e => `<a class="especie-chip" href="#especie-${e.id}">${escapar(e.nome)}</a>`).join('') || '<span class="muted">Sem espécie neste estrato</span>'}</div>
                </div>`).join('')}</div>
                <h4 class="titulo-fases">O sistema ao longo das fases</h4>
                <div class="fases">${Object.entries(saf.fases).map(([fase, ids], i) => `<section class="fase">
                <span class="fase-numero">0${i + 1}</span>
                <h5>${nomesFases[fase]}</h5>
                <p>${faseTextos[fase]}</p>
                <ul>${ids.map(id => `<li>${escapar(saf.especies.find(e => e.id === id).nome)}</li>`).join('') || '<li>Sem espécie para esta fase.</li>'}</ul>
                </section>`).join('')}</div>
                </details><h4 class="titulo-fases" id="conhecer-plantas">Conheça a função de cada planta</h4><p class="orientacao-curta">Abra o nome de uma planta para entender por que ela entrou na proposta e consultar sua fonte.</p>
                <div class="justificativas">${saf.especies.map(e => `<details id="especie-${e.id}">
                <summary>
                <span>
                <strong>${escapar(e.nome)}</strong>
                <small>${escapar(e.nomeCientifico)} · ${rotulos[e.papel] || e.papel}</small>
                </span>
                <span class="pontos">${e.pontuacao} pontos de ordenação</span>
                </summary>
                <div class="detalhe">
                <p><a href="especies.html#${e.id}">Ver ficha de cultivo, imagem e interações →</a></p>
                <p>Função consolidada na fase: ${rotulos[e.faseEntrada]}. Mudas perenes podem ser plantadas na implantação.</p>
                <ul>${e.justificativas.map(j => `<li>${escapar(j)}</li>`).join('')}</ul>
                <p class="muted">Pontos são pesos de regras demonstrativas, sem porcentagem de precisão científica.</p>
                <a href="${escapar(e.fonte.url)}" target="_blank" rel="noopener noreferrer">${escapar(e.fonte.titulo)} ↗</a>
                </div>
                </details>`).join('')}</div>
                <details class="relacoes">
                <summary>Interações entre as espécies</summary>
                <div class="detalhe">
                <p>Os registros distinguem consórcios documentados, benefícios condicionais e cuidados. Não comprovam compatibilidade universal. Sem registro significa que o par ainda não foi documentado nesta curadoria.</p>
                ${saf.interacoes.filter(r => r.status !== 'DESCONHECIDA').map(r => apresentarInteracao(r, `${r.especieA} + ${r.especieB}`)).join('') || '<p>Nenhum par desta proposta possui registro nesta curadoria.</p>'}
                <p><a href="especies.html#interacoes">Consultar outras combinações no catálogo →</a></p>
                <details><summary>Pares ainda sem registro (${saf.interacoes.filter(r => r.status === 'DESCONHECIDA').length})</summary><ul>${saf.interacoes.filter(r => r.status === 'DESCONHECIDA').map(r => `<li>${escapar(r.especieA)} + ${escapar(r.especieB)}: sem registro.</li>`).join('') || '<li>Todos os pares desta proposta têm registro na curadoria.</li>'}</ul></details>
                </div>
                </details>`;
    encerrarCrescimento = iniciarCrescimento(document.querySelector('#crescimento-resultado'), saf);
    // O link aponta para #especie-id; slice(1) remove o # para localizar o details pelo id.
    // Abrimos os detalhes antes de o navegador levar a pessoa até o destino do link.
    document.querySelectorAll('.especie-chip').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById(link.hash.slice(1)).open = true;
        });
    });
}

// Carrega as regras e prepara o conteúdo; sem uma análise salva, orienta como começar.
async function iniciar() {
    if (!analise) {
        alvo.innerHTML = '<section class="estado-vazio"><h2>Vamos começar pelo solo?</h2><p>Nenhuma análise válida está salva neste navegador. Preencha os dados ou escolha um cenário.</p><a class="botao" href="analise.html">Iniciar análise →</a></section>';
        return; // Encerra aqui para não calcular propostas sem os dados do formulário.
    }
    try {
        // As leituras podem acontecer juntas. Promise.all mantém os resultados na ordem pedida.
        const [config, catalogo, modelos, interacoes] = await Promise.all([
            carregarJSON('faixas-solo.json'),
            carregarJSON('especies.json'),
            carregarJSON('modelos-saf.json'),
            carregarJSON('interacoes.json')
        ]);
        // Primeiro interpretamos o solo; depois usamos essa interpretação na escolha de espécies.
        const diagnostico = diagnosticar(analise, config);
        const safs = montarSAFs(diagnostico, analise, catalogo, modelos, interacoes, config.pesos);
        // O resumo identifica a análise; cada parâmetro vira um cartão de diagnóstico.
        // O status escolhe o texto e a classe de cor. numero formata a medida em português.
        // As abas só são criadas quando há propostas; do contrário mostramos o aviso de falta.
        // data-proposta guarda a posição da proposta que cada botão deve abrir.
        alvo.innerHTML = `<section class="resumo-dados">
                <div>
                <strong>${escapar(analise.municipio)}, ${escapar(analise.estado)}</strong>
                <span>${objetivos[analise.objetivo]} · Dados inseridos para demonstração</span>
                </div>
                <a class="botao secundario" href="analise.html?editar">Editar dados</a>
                </section>
                <details class="painel-extra" id="leitura-solo"><summary>Entender a leitura dos dados do solo</summary><section aria-labelledby="titulo-diagnostico">
                <div class="section-heading">
                <h2 id="titulo-diagnostico">O que os dados mostram</h2>
                <span>01 / Diagnóstico</span>
                </div>
                <div class="diagnostico">${Object.values(diagnostico.parametros).map(p => `<article class="parametro">
                <span>${p.rotulo}</span>
                <strong>${numero(p.valor)}<small> ${p.unidade}</small>
                </strong>
                <span class="status status-${p.status.toLowerCase()}">${p.status === 'ADEQUADO' ? '✓' : '!'} ${p.status === 'ATENCAO' ? 'ATENÇÃO' : p.status}</span>
                <p>${escapar(p.explicacao)}</p>
                <small>Faixa demonstrativa: ${p.faixa} ${p.unidade}</small>
                </article>`).join('')}</div>
                </section>
                <section class="necessidades">
                <h3>Prioridades desta composição</h3>
                <div>${diagnostico.necessidades.map(n => `<span class="necessidade">${rotulos[n] || n}</span>`).join('')}</div>
                <p class="muted">Estas funções orientam a combinação de plantas. Cobertura e diversidade fazem parte do planejamento do modelo.</p>
                </section></details>
                <section aria-labelledby="titulo-safs">
                <div class="section-heading">
                <h2 id="titulo-safs">Opções para sua agrofloresta</h2>
                <span>${safs.length} ${safs.length === 1 ? "opção disponível" : "opções disponíveis"}</span>
                </div>
                <p class="muted">Selecione uma opção para ver as plantas e suas fases.</p>${safs.length ? `<div class="abas" role="tablist" aria-label="Propostas de SAF">${safs.map((s, i) => `<button id="aba-${i}" role="tab" aria-selected="${i === 0}" aria-controls="proposta" tabindex="${i === 0 ? 0 : -1}" data-proposta="${i}">${String(i + 1).padStart(2, '0')} · ${escapar(s.titulo)}</button>`).join('')}</div>
                <div id="proposta" role="tabpanel" aria-labelledby="aba-0">
                </div>` : '<p class="aviso">Não há espécies elegíveis suficientes para preencher um modelo. Revise os dados e o catálogo.</p>'}${safs.length === 1 ? '<p class="aviso">Apenas uma composição completa está disponível para estes critérios.</p>' : ''}</section>
                <section class="proximo-passo"><div><h2>Quer explorar outro caminho?</h2><p>Edite o objetivo ou os dados para gerar outras combinações.</p></div><a class="botao secundario" href="analise.html?editar">Voltar e ajustar os dados →</a></section>
                <aside class="aviso">Protótipo demonstrativo. Regras de solo, papéis, estratos e fases são simplificados. Não substitui avaliação agronômica, não prescreve fertilizantes nem prevê produtividade. <a href="sobre.html">Entenda a metodologia →</a>
                </aside>`;
        // Sem propostas, não existe painel de abas para configurar.
        if (!safs.length) {
            return;
        }
        // ... transforma os elementos encontrados em um array para acessá-los pela posição.
        const abas = [...document.querySelectorAll('[data-proposta]')];

        // i começa em zero. focar só será true na navegação pelo teclado.
        function selecionar(i, focar = false) {
            abas.forEach((aba, j) => {
                // Só a posição j igual à escolhida i fica marcada como selecionada.
                aba.setAttribute('aria-selected', String(i === j));
                // Tab alcança a aba ativa; as setas darão acesso às demais.
                aba.tabIndex = i === j ? 0 : -1;
            });
            // Liga o nome acessível do painel ao botão que agora está selecionado.
            document.querySelector('#proposta').setAttribute('aria-labelledby', `aba-${i}`);
            exibirProposta(safs[i]);
            // Ao usar setas, o foco precisa acompanhar a mudança visual da aba.
            if (focar) {
                abas[i].focus();
            }
        }
        // O clique e o teclado usam a mesma função para manter os estados sincronizados.
        abas.forEach((aba, i) => {
            aba.addEventListener('click', () => selecionar(i));
            aba.addEventListener('keydown', e => {
                const teclas = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
                // Teclas não relacionadas às abas continuam funcionando normalmente.
                if (!teclas.includes(e.key)) {
                    return;
                }
                e.preventDefault(); // Impede que as setas rolem a página nesta interação.
                let indice;
                if (e.key === 'Home') {
                    indice = 0; // Primeira posição do array.
                } else if (e.key === 'End') {
                    indice = abas.length - 1; // Última posição do array.
                } else {
                    const passo = e.key === 'ArrowRight' ? 1 : -1;
                    // Somar o tamanho e usar o resto (%) faz a navegação circular nas pontas.
                    indice = (i + passo + abas.length) % abas.length;
                }
                selecionar(indice, true);
            });
        });
        selecionar(0); // A primeira proposta aparece assim que a página termina de carregar.
    } catch (erro) {
        alvo.innerHTML = ''; // Não deixa um resultado incompleto visível depois de uma falha.
        mostrarErro(document.querySelector('#erro'), erro);
    }
}
iniciar();
