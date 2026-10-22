/* utils.js reúne ferramentas que várias páginas usam.
 * export permite que outro arquivo importe um valor ou uma função pelo nome.
 * const impede trocar a referência; as propriedades de um objeto ainda podem mudar.
 */

// À esquerda ficam os códigos salvos nos dados; à direita, os nomes mostrados na tela.
import { iniciarGuia } from './guia.js';
import { exigirSessao } from './sessao.js';

let usuarioAtual;
try {
    usuarioAtual = await exigirSessao();
} catch (erro) {
    const aviso = document.createElement('p');
    aviso.className = 'erro';
    aviso.textContent = 'Inicie o projeto com python servidor.py e abra http://127.0.0.1:8765 para usar o login.';
    document.querySelector('main').replaceChildren(aviso);
    throw erro;
}

export const objetivos = {
    PRODUCAO: 'Produção',
    RECUPERACAO: 'Recuperação',
    BIODIVERSIDADE: 'Biodiversidade',
    MISTO: 'Produção + recuperação'
};
// A ordem desta lista determina a ordem das camadas no desenho da proposta.
export const estratos = ['EMERGENTE', 'ALTO', 'MEDIO', 'BAIXO', 'COBERTURA'];
// Este dicionário transforma códigos como MEDIO em textos com acentos, como Médio.
export const rotulos = {
    EMERGENTE: 'Emergente',
    ALTO: 'Alto',
    MEDIO: 'Médio',
    BAIXO: 'Baixo',
    COBERTURA: 'Cobertura',
    FIXACAO_NITROGENIO: 'Fixação de nitrogênio',
    BIOMASSA: 'Biomassa e ciclagem',
    COBERTURA_SOLO: 'Cobertura do solo',
    DIVERSIDADE: 'Diversidade',
    PRODUCAO_ALIMENTAR: 'Produção alimentar',
    AVALIACAO_PH: 'Avaliação do pH',
    AVALIACAO_NUTRIENTES: 'Avaliação de nutrientes',
    AVALIACAO_AGUA: 'Avaliação da água',
    AVALIACAO_TEMPERATURA: 'Avaliação da temperatura',
    AVALIACAO_SALINIDADE: 'Avaliação da salinidade',
    ADUBACAO_VERDE: 'Adubação verde',
    CULTURA_CURTA: 'Cultura de ciclo curto',
    FRUTIFERA: 'Frutífera',
    ARBOREA: 'Arbórea',
    SUPORTE: 'Suporte e biomassa',
    PRODUTIVA: 'Produção alimentar',
    PERENE: 'Perene',
    INICIAL: 'Inicial',
    INTERMEDIARIA: 'Intermediária',
    TARDIA: 'Tardia',
    IMPLANTACAO: 'Implantação',
    DESENVOLVIMENTO: 'Desenvolvimento',
    ESTABELECIDO: 'Estabelecido'
};
// Cada par significa [menor valor aceito, maior valor aceito].
// São limites para conferir a entrada, diferentes das faixas do diagnóstico.
export const limitesEntrada = {
    ph: [0, 14],
    umidade: [0, 100],
    temperatura: [-20, 70],
    nitrogenio: [0, 10000],
    fosforo: [0, 10000],
    potassio: [0, 10000],
    condutividade: [0, 100]
};
// Lê um arquivo da pasta dados e devolve os dados que ele contém.
// async permite usar await: aguardamos a resposta sem impedir o uso da página.
export async function carregarJSON(arquivo) {
    try {
        // import.meta.url é o endereço deste arquivo JS; ../ sobe da pasta js para o site.
        const resposta = await fetch(new URL(`../dados/${arquivo}`, import.meta.url));
        // fetch também recebe respostas de erro, como 404. Precisamos conferir o status.
        if (!resposta.ok) {
            throw new Error('Arquivo indisponível.');
        }
        // json() interpreta o texto do arquivo como listas, objetos e outros valores.
        return await resposta.json();
    } catch {
        // Uma falha de rede, arquivo ausente ou JSON inválido recebe esta orientação.
        throw new Error(`Não foi possível carregar ${arquivo}. Abra o projeto por um servidor HTTP local e confira se o arquivo JSON está disponível e válido.`);
    }
}
// Prepara texto para entrar em uma string HTML: < deve aparecer como texto, não abrir uma tag.
export function escapar(valor) {
    // ?? trata null e undefined; a expressão regular procura os cinco caracteres especiais.
    // replace chama a função para cada caractere e consulta sua substituição no objeto.
    return String(valor ?? '').replace(/[&<>"']/g, letra => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[letra]);
}
// Formata valores para a leitura brasileira: por exemplo, 5.8 aparece como 5,8.
export function numero(valor) {
    return new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 2
    }).format(valor);
}
// Recebe uma análise e devolve mensagens de erro. [] significa que a validação passou.
export function validarAnalise(dados) {
    // Sem um objeto de dados, não podemos consultar os campos com segurança.
    if (!dados || typeof dados !== 'object') {
        return ['Preencha os dados da análise.'];
    }
    const erros = []; // push acrescentará uma mensagem para cada problema encontrado.
    // entries fornece pares [nome, valor]; o segundo par separa o mínimo e o máximo.
    for (const [campo, [min, max]] of Object.entries(limitesEntrada)) {
        // Só a condutividade pode faltar. == null aceita null e undefined, mas preserva zero.
        if (campo === 'condutividade' && dados[campo] == null) {
            continue;
        }
        // Rejeita texto, NaN, infinito e números fora dos limites. || significa "ou".
        if (typeof dados[campo] !== 'number' || !Number.isFinite(dados[campo]) || dados[campo] < min || dados[campo] > max) {
            erros.push(`Confira ${campo}: informe um número entre ${min} e ${max}.`);
        }
    }
    // trim permite detectar um nome formado só por espaços; não altera o texto original.
    if (typeof dados.municipio !== 'string' || !dados.municipio.trim() || dados.municipio.length > 100) {
        erros.push('Informe o município (até 100 caracteres).');
    }
    // includes verifica a presença na lista; ! inverte a resposta.
    if (!estados.includes(dados.estado)) {
        erros.push('Selecione um estado válido.');
    }
    // hasOwn exige um dos códigos que cadastramos no próprio objeto objetivos.
    if (!Object.hasOwn(objetivos, dados.objetivo)) {
        erros.push('Selecione um objetivo válido.');
    }
    return erros;
}
// Siglas usadas tanto para montar as opções do formulário quanto para validar a escolha.
export const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
// Guarda somente uma análise válida no navegador usado pela pessoa.
export function salvarAnalise(dados) {
    const erros = validarAnalise(dados);
    if (erros.length) {
        // join reúne as mensagens em um texto. throw interrompe esta tentativa de salvar.
        throw new Error(erros.join(' '));
    }
    try {
        // localStorage guarda texto; stringify converte o objeto em texto JSON.
        localStorage.setItem('analiseAtual', JSON.stringify(dados));
    } catch {
        throw new Error('O navegador bloqueou o armazenamento. Permita dados locais para continuar.');
    }
}
// Faz o caminho inverso de salvarAnalise. Se não houver dados utilizáveis, devolve null.
export function lerAnalise() {
    try {
        // parse reconstrói o objeto. Um texto corrompido provoca erro e cai no catch.
        const dados = JSON.parse(localStorage.getItem('analiseAtual'));
        // condição ? valorSeVerdadeira : valorSeFalsa; qualquer erro invalida o resultado.
        return validarAnalise(dados).length ? null : dados;
    } catch {
        return null;
    }
}
// Escreve a falha no elemento recebido e retira sua ocultação.
export function mostrarErro(elemento, erro) {
    // textContent escreve texto simples, sem interpretar tags HTML da mensagem.
    elemento.textContent = erro.message || 'Não foi possível concluir esta ação.';
    elemento.hidden = false;
}
// Destaca no menu o link da página que está aberta.
export function iniciarPagina() {
    // split separa o caminho pelas barras; pop pega a última parte, o nome do arquivo.
    const pagina = location.pathname.split('/').pop() || 'index.html';
    // Percorre somente links que estão dentro de nav.
    document.querySelectorAll('nav a').forEach(a => {
        if (a.getAttribute('href') === pagina) {
            // Este atributo informa a página atual aos leitores de tela e ao CSS do menu.
            a.setAttribute('aria-current', 'page');
        }
    });
    iniciarGuia(pagina, Boolean(lerAnalise()));
    const conta = document.querySelector('.conta-atalho span');
    if (conta && usuarioAtual) conta.textContent = 'Minha conta';
}
// Os módulos que importam utils também recebem esta preparação compartilhada.
iniciarPagina();
