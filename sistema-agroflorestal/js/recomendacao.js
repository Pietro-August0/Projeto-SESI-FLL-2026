/* recomendacao.js compara as espécies com a análise e explica sua pontuação.
 * Os pontos ordenam alternativas educativas; não representam precisão científica.
 */

// Cada linha traz: campo da análise, limite mínimo, limite máximo, peso e nome legível.
const criterios = [
    ['ph', 'phMin', 'phMax', 'ph', 'pH'],
    ['temperatura', 'temperaturaMin', 'temperaturaMax', 'temperatura', 'Temperatura'],
    ['umidade', 'umidadeMin', 'umidadeMax', 'umidade', 'Umidade']
];
// Relaciona uma necessidade do diagnóstico à propriedade que a espécie precisa ter.
const funcoes = {
    FIXACAO_NITROGENIO: 'fixaNitrogenio',
    BIOMASSA: 'produzBiomassa',
    COBERTURA_SOLO: 'protegeSolo',
    PRODUCAO_ALIMENTAR: 'produzAlimento'
};
// Devolve uma cópia da espécie com pontos e motivos, ou null se ela for excluída.
// contexto informa o que já foi escolhido no modelo; {} permite avaliar sem esse contexto.
export function pontuarEspecie(especie, dados, diagnostico, pesos, contexto = {}) {
    let pontuacao = 0;
    const justificativas = [];
    const ignorados = []; // Critérios sem informação não ganham pontos.
    for (const [campo, min, max, peso, nome] of criterios) {
        // Sem os dois limites, não sabemos avaliar essa medida para esta espécie.
        if (especie[min] == null && especie[max] == null) {
            ignorados.push(nome);
            continue;
        }
        // Basta ultrapassar um limite conhecido para excluir a espécie desta análise.
        if (especie[min] != null && dados[campo] < especie[min] || especie[max] != null && dados[campo] > especie[max]) {
            return null;
        }
        // += soma o peso cadastrado, sem substituir os pontos de critérios anteriores.
        pontuacao += pesos[peso];
        justificativas.push(`${nome} dentro dos limites cadastrados (+${pesos[peso]} pontos).`);
    }
    // Só restringimos estados se uma lista regional tiver sido cadastrada.
    if (especie.estados && !especie.estados.includes(dados.estado)) {
        return null;
    }
    // Cada função confirmada que atende uma prioridade recebe o peso necessidade.
    for (const necessidade of diagnostico.necessidades) {
        if (funcoes[necessidade] && especie[funcoes[necessidade]] === true) {
            pontuacao += pesos.necessidade;
            justificativas.push(`${especie.funcaoPrincipal}: atende ${necessidade.toLowerCase().replaceAll('_', ' ')} (+${pesos.necessidade} pontos).`);
        }
    }
    // Preferências do papel têm prioridade. Sem elas, valorizamos uma camada ainda ausente.
    const ocupaEstratoNecessario = contexto.estratosPreferidos
        ? contexto.estratosPreferidos.includes(especie.estrato)
        : contexto.estratos && !contexto.estratos.includes(especie.estrato);
    if (ocupaEstratoNecessario) {
        pontuacao += pesos.estrato;
        justificativas.push(`Ocupa um estrato prioritário para o papel: ${especie.estrato.toLowerCase()} (+${pesos.estrato} pontos).`);
    }
    // ?. evita consultar includes se o modelo não informou uma lista de sucessões.
    if (contexto.sucessao?.includes(especie.sucessao)) {
        pontuacao += pesos.sucessao;
        justificativas.push(`Sucessão compatível com o papel (+${pesos.sucessao} pontos).`);
    }
    // Uma função nova aumenta a variedade da composição já escolhida.
    if (contexto.funcoes && !contexto.funcoes.includes(especie.funcaoPrincipal)) {
        pontuacao += pesos.diversidade;
        justificativas.push(`Adiciona uma função à composição (+${pesos.diversidade} pontos).`);
    }
    // unshift coloca a função principal antes dos motivos acumulados com push.
    justificativas.unshift(especie.funcaoPrincipal);
    if (ignorados.length) {
        justificativas.push(`Sem faixa confirmada para ${ignorados.join(', ')}; esses critérios não somam pontos nem confirmam adaptação.`);
    }
    if (!especie.estados) {
        justificativas.push('Distribuição regional não validada; município e estado contextualizam a análise, sem confirmar aptidão local.');
    }
    // ... copia os dados da espécie sem acrescentar pontos ao catálogo original.
    return {
        ...especie,
        pontuacao,
        justificativas,
        criteriosIgnorados: ignorados
    };
}
// Avalia o catálogo inteiro, remove exclusões e ordena os resultados.
export function recomendar(especies, dados, diagnostico, pesos, contexto) {
    return especies
        .map(especie => pontuarEspecie(especie, dados, diagnostico, pesos, contexto))
        .filter(Boolean) // null vira false e é retirado; os objetos de espécies permanecem.
        // Maior pontuação vem primeiro; o id desempata para manter uma ordem previsível.
        .sort((a, b) => b.pontuacao - a.pontuacao || a.id.localeCompare(b.id));
}
