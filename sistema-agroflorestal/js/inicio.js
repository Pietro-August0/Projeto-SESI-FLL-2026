/* inicio.js desenha os botões dos exemplos fictícios.
 * A mesma função serve à página inicial e ao formulário, que dão respostas diferentes ao clique.
 */
import { carregarJSON, escapar, mostrarErro } from './utils.js';
import { iniciarCrescimento } from './crescimento.js';

// A cena da abertura usa um exemplo identificado, independente da análise salva.
const crescimentoInicio = document.querySelector('#crescimento-inicio');
if (crescimentoInicio) {
  carregarJSON('especies.json')
    .then((catalogo) => {
      const ids = ['andiroba', 'banana', 'feijao-guandu', 'mandioca', 'feijao-de-porco'];
      const especies = ids.map((id) => catalogo.find((e) => e.id === id));
      iniciarCrescimento(
        crescimentoInicio,
        {
          especies,
          fases: {
            implantacao: ids,
            desenvolvimento: especies
              .filter((e) => e.ciclo !== 'CURTO' || e.estrato === 'COBERTURA')
              .map((e) => e.id),
            estabelecido: especies
              .filter((e) => e.ciclo === 'PERENE' || e.estrato === 'COBERTURA')
              .map((e) => e.id),
          },
        },
        { compacto: true },
      );
    })
    .catch((erro) => mostrarErro(document.querySelector('#erro'), erro));
}

// alvo é o elemento que receberá os botões; aoSelecionar é a função chamada após a escolha.
export function renderizarCenarios(cenarios, alvo, aoSelecionar) {
  // map produz um botão para cada cenário. As crases permitem texto HTML em várias linhas.
  // ${...} insere valores no texto; escapar evita tratar caracteres do dado como tags.
  alvo.innerHTML = cenarios
    .map(
      (c) => `
        <button class="cenario" type="button" data-cenario="${escapar(c.id)}">
            <span class="cenario-letra">${escapar(c.nome)}</span>
            <strong>${escapar(c.titulo)}</strong>
            <span>${escapar(c.descricao)}</span>
            <span class="cenario-link">
                Carregar cenário <span aria-hidden="true">→</span>
            </span>
        </button>
    `,
    )
    .join('');
  // Os botões só existem depois de preencher innerHTML; agora podemos registrar seus cliques.
  alvo.querySelectorAll('button').forEach((botao) => {
    botao.addEventListener('click', () => {
      // dataset.cenario lê data-cenario. find recupera o objeto de dados correspondente.
      aoSelecionar(cenarios.find((c) => c.id === botao.dataset.cenario));
    });
  });
}
// Na página de análise esse elemento não existe, então não fazemos a navegação abaixo.
const alvo = document.querySelector('#cenarios-inicio');
if (alvo) {
  // then recebe os dados carregados; catch apresenta uma falha de leitura.
  carregarJSON('cenarios.json')
    .then((cenarios) =>
      renderizarCenarios(cenarios, alvo, (c) => {
        // Codificamos o id para que ele possa ser usado com segurança como valor na URL.
        location.href = `analise.html?cenario=${encodeURIComponent(c.id)}`;
      }),
    )
    .catch((erro) => mostrarErro(document.querySelector('#erro'), erro));
}
