/* diagnostico.js interpreta as medidas usando regras educativas de faixas-solo.json.
 * A função não desenha a página: devolve dados que resultado.js vai apresentar.
 */
import { validarAnalise } from './utils.js';

// Recebe os valores da análise e a configuração; devolve parâmetros e necessidades.
export function diagnosticar(dados, configuracao) {
    const erros = validarAnalise(dados);
    // Não classificamos uma análise com entradas inválidas.
    if (erros.length) {
        throw new Error(erros.join(' '));
    }
    const parametros = {}; // Cada medida será guardada pelo nome, como parametros.ph.
    // Set evita repetir uma necessidade que pode ser indicada por várias medidas.
    const necessidades = new Set(configuracao.necessidadesBase);
    // Para cada regra, procura a medida de mesmo nome nos dados digitados.
    for (const [campo, regra] of Object.entries(configuracao.parametros)) {
        const valor = dados[campo];
        // Um dado ausente não recebe diagnóstico; zero continua sendo uma medida válida.
        if (valor == null) {
            continue;
        }
        // Começamos dentro da faixa e mudamos a classificação se algum limite for ultrapassado.
        let status = 'ADEQUADO';
        if (valor < regra.minAdequado) {
            status = 'BAIXO';
        } else if (valor > regra.maxAdequado) {
            // Algumas regras usam ATENCAO para o limite alto; ALTO é a alternativa padrão.
            status = regra.statusAlto || 'ALTO';
        }
        // Reúne os dados necessários para desenhar o cartão desta medida.
        parametros[campo] = {
            status,
            valor,
            rotulo: regra.rotulo,
            unidade: regra.unidade,
            faixa: `${regra.minAdequado} a ${regra.maxAdequado}`,
            explicacao: regra.explicacoes[status]
        };
        // Sem necessidades para esse status, [] permite continuar sem acrescentar nada.
        (regra.necessidades[status] || []).forEach(item => necessidades.add(item));
    }
    // O objetivo também orienta a composição, mesmo sem uma medida correspondente no solo.
    if (['PRODUCAO', 'MISTO'].includes(dados.objetivo)) {
        necessidades.add('PRODUCAO_ALIMENTAR');
    }
    if (dados.objetivo === 'RECUPERACAO') {
        necessidades.add('BIOMASSA');
        necessidades.add('COBERTURA_SOLO');
    }
    // ... transforma os valores únicos do Set em uma lista comum para os próximos arquivos.
    return {
        parametros,
        necessidades: [...necessidades]
    };
}
