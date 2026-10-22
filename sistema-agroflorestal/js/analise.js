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

// Só a etapa atual aparece. A validação acontece antes de esconder um campo inválido.
const etapas = [...formulario.querySelectorAll('fieldset')];
const continuar = document.querySelector('#etapa-continuar');
const voltar = document.querySelector('#etapa-voltar');
const gerar = document.querySelector('#gerar-proposta');
let etapaAtual = 0;
formulario.noValidate = true;
const ajudas = [
    'A localização identifica sua proposta. Ela não confirma que as plantas são adequadas à região.',
    'pH indica acidez; umidade e temperatura descrevem condições do solo. N, P e K são nutrientes. Nesta versão, os valores servem a um cenário demonstrativo.',
    'O objetivo muda a prioridade da proposta. Escolha entre produção, recuperação da área, diversidade ou uma combinação dessas funções.'
];
const revisao = document.createElement('div');
revisao.className = 'revisao-dados';
etapas[2].append(revisao);
const dicasCampos = {
    ph: 'Indica a acidez do solo. Informe um valor entre 0 e 14.',
    umidade: 'Quantidade de água, em porcentagem.',
    temperatura: 'Temperatura do solo em graus Celsius.',
    nitrogenio: 'Nutriente N · valor didático do exercício.',
    fosforo: 'Nutriente P · valor didático do exercício.',
    potassio: 'Nutriente K · valor didático do exercício.',
    condutividade: 'Relacionada aos sais. Pode ficar em branco.'
};
Object.entries(dicasCampos).forEach(([id, texto]) => {
    const input = document.getElementById(id);
    const dica = document.createElement('small');
    dica.id = `ajuda-${id}`;
    dica.className = 'ajuda-campo';
    dica.textContent = texto;
    input.after(dica);
    input.setAttribute('aria-describedby', dica.id);
});

function mostrarEtapa(indice, focar = true) {
    erro.hidden = true;
    etapaAtual = indice;
    etapas.forEach((etapa, i) => { etapa.hidden = i !== indice; });
    voltar.hidden = indice === 0;
    continuar.hidden = indice === etapas.length - 1;
    gerar.hidden = indice !== etapas.length - 1;
    document.querySelector('#etapa-contagem').textContent = `Seus dados · etapa ${indice + 1} de ${etapas.length}`;
    document.querySelector('#etapa-progresso').value = indice + 1;
    document.querySelector('#etapa-proxima').textContent = ['Próximo: dados do solo', 'Próximo: seu objetivo', 'Pronto para conhecer as combinações?'][indice];
    document.querySelector('#ajuda-etapa').textContent = ajudas[indice];
    if (indice === 2) {
        // textContent mantém dados digitados como texto, sem interpretar HTML.
        revisao.textContent = `Confira antes de gerar: ${formulario.elements.municipio.value}, ${formulario.elements.estado.value}. pH ${formulario.elements.ph.value}; umidade ${formulario.elements.umidade.value}%; temperatura ${formulario.elements.temperatura.value} °C. Use Voltar se quiser ajustar os dados.`;
    }
    if (focar) {
        const titulo = etapas[indice].querySelector('legend');
        titulo.tabIndex = -1;
        titulo.focus();
    }
}

function validarEtapa(indice) {
    erro.hidden = true;
    const campos = [...etapas[indice].querySelectorAll('input, select')];
    if (indice === 0) {
        const municipio = formulario.elements.municipio;
        municipio.setCustomValidity(municipio.value.trim() ? '' : 'Informe o município.');
    }
    const invalido = campos.find(campo => !campo.checkValidity());
    if (!invalido) return true;
    mostrarEtapa(indice, false);
    erro.textContent = indice === 2 ? 'Escolha um objetivo para gerar suas propostas.' : 'Confira o campo destacado antes de continuar.';
    erro.hidden = false;
    invalido.reportValidity();
    invalido.focus();
    return false;
}
function avancar() {
    if (validarEtapa(etapaAtual)) mostrarEtapa(etapaAtual + 1);
}
continuar.addEventListener('click', avancar);
voltar.addEventListener('click', () => mostrarEtapa(etapaAtual - 1));
formulario.elements.municipio.addEventListener('input', evento => evento.target.setCustomValidity(''));
mostrarEtapa(0, false);

// Copia um objeto de dados para campos cujos atributos name têm os mesmos nomes das chaves.
function preencher(dados, mensagem, focar = false) {
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
    document.querySelector('#escolher-cenario').open = false;
    mostrarEtapa(0, focar);
}
// Prepara os exemplos e lê a escolha que pode ter vindo da página inicial pela URL.
async function iniciar() {
    try {
        const cenarios = await carregarJSON('cenarios.json');
        // A função de resposta abaixo será chamada quando a pessoa clicar em um cenário.
        renderizarCenarios(cenarios, document.querySelector('#cenarios-analise'), c => {
            preencher(c.dados, `${c.nome} carregado. Dados demonstrativos; você pode editar todos os valores.`, true);
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
    if (etapaAtual < etapas.length - 1) {
        avancar();
        return;
    }
    for (let i = 0; i < etapas.length; i++) {
        if (!validarEtapa(i)) return;
    }
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
