/* analise.js controla o formulário de analise.html.
 * Primeiro preenche um exemplo; ao enviar, transforma os campos em uma análise salva.
 */
import { carregarJSON, estados, lerAnalise, salvarAnalise, mostrarErro } from './utils.js';
import { renderizarCenarios } from './inicio.js';
// # procura pelo id do elemento no HTML. Guardamos os elementos para reutilizá-los.
const formulario = document.querySelector('#form-analise');
const erro = document.querySelector('#erro');
// Cada sigla vira uma opção. join('') junta as opções sem vírgulas; += mantém a opção inicial.
document.querySelector('#estado').innerHTML += estados.map(uf => `<option value="${uf}">${uf}</option>`).join('');

// Copia um objeto de dados para campos cujos atributos name têm os mesmos nomes das chaves.
function preencher(dados, mensagem) {
    for (const [campo, valor] of Object.entries(dados)) {
        // Nem toda informação de um objeto precisa ter um campo correspondente.
        if (!formulario.elements.namedItem(campo)) {
            continue;
        }
        const controle = formulario.elements.namedItem(campo);
        // null significa ausência; nesse caso o campo fica vazio. Um zero é mantido.
        controle.value = valor ?? '';
    }
    // Explica de onde vieram os valores e esconde uma mensagem de erro anterior.
    document.querySelector('#aviso-cenario').textContent = mensagem;
    erro.hidden = true;
}
// Prepara os exemplos e lê a escolha que pode ter vindo da página inicial pela URL.
async function iniciar() {
    try {
        const cenarios = await carregarJSON('cenarios.json');
        // A função de resposta abaixo será chamada quando a pessoa clicar em um cenário.
        renderizarCenarios(cenarios, document.querySelector('#cenarios-analise'), c => {
            preencher(c.dados, `${c.nome} carregado. Dados demonstrativos; você pode editar todos os valores.`);
        });
        // Em ?cenario=solo-a, get('cenario') devolve o texto solo-a.
        const parametros = new URLSearchParams(location.search);
        const selecionado = cenarios.find(c => c.id === parametros.get('cenario'));
        if (selecionado) {
            preencher(selecionado.dados, `${selecionado.nome} carregado. Dados demonstrativos.`);
        } else if (parametros.has('editar') && lerAnalise()) {
            // O link Editar pede os dados que já estavam guardados neste navegador.
            preencher(lerAnalise(), 'Análise anterior carregada para edição.');
        }
    } catch (falha) {
        mostrarErro(erro, falha);
    }
}
// submit acontece ao enviar o formulário, inclusive usando Enter em um campo.
formulario.addEventListener('submit', evento => {
    // Evita o envio tradicional e o recarregamento: vamos cuidar dos dados com JavaScript.
    evento.preventDefault();
    erro.hidden = true;
    // FormData fornece pares name/valor; fromEntries transforma esses pares em um objeto.
    const dados = Object.fromEntries(new FormData(formulario));
    // Campos HTML entregam texto. Convertemos apenas os campos que representam números.
    for (const campo of ['ph', 'umidade', 'temperatura', 'nitrogenio', 'fosforo', 'potassio', 'condutividade']) {
        // Vazio vira null; Number('') daria zero, confundindo ausência com uma medida real.
        dados[campo] = dados[campo] === '' ? null : Number(dados[campo]);
    }
    dados.municipio = dados.municipio.trim(); // Retira espaços antes e depois do nome.
    try {
        // salvarAnalise valida antes de gravar. Só abrimos o resultado se essa etapa funcionar.
        salvarAnalise(dados);
        location.href = 'resultado.html';
    } catch (falha) {
        mostrarErro(erro, falha);
        erro.focus(); // Leva o foco à explicação da falha, inclusive para quem usa teclado.
    }
});
// Declarar iniciar não a executa; esta chamada começa a preparação da página.
iniciar();
