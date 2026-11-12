/* recomendacao.js compara as espécies com a análise e explica sua pontuação.
 * Os pontos ordenam alternativas do protótipo; não representam precisão científica.
 */
import { solos } from './solos.js';

export const ocorrencias = {
  acai: { ufs: ['AP', 'PA', 'MA'], url: 'https://www.infoteca.cnptia.embrapa.br/handle/doc/1155560' },
  andiroba: { ufs: ['AC', 'AM', 'AP', 'PA'], url: 'https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1144718/1/Plantas-para-o-Futuro-Norte-1175-1184.pdf' },
  parica: { ufs: ['AC', 'AM', 'PA', 'RO'], url: 'https://ainfo.cnptia.embrapa.br/digital/bitstream/doc/959848/1/TESE-Selma-Ohashi-Parica.pdf' },
  pitanga: { ufs: ['BA', 'MS', 'ES', 'MG', 'RJ', 'SP', 'PR', 'RS', 'SC'], url: 'https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1106305/1/Pitanga.pdf' },
};

export const fontesAgua = {
  banana: 'https://www.infoteca.cnptia.embrapa.br/infoteca/handle/doc/662460',
  pitanga: 'https://www.embrapa.br/web/agencia-de-informacao-tecnologica/territorios/territorio-mata-sul-pernambucana/atividades-economicas/cultivos/fruticultura/pitanga/aspectos-botanicos-clima-e-solo',
};

const precisaDrenagem = new Set([
  'feijao-guandu', 'crotalaria', 'mucuna', 'gliricidia', 'caupi', 'mandioca',
  'abacaxi', 'banana', 'mamao', 'cacau', 'pupunha', 'margaridao', 'urucum', 'mutambo',
]);
const precisaProfundidade = new Set(['mandioca', 'banana', 'mamao', 'cacau', 'pupunha', 'urucum']);
const medidasCultivo = {
  'pH do solo': ['ph', 12, 0.8],
  'Temperatura do ar': ['temperaturaAr', 16, 5],
  'Temperatura média anual do ar': ['temperaturaAr', 16, 5],
  'Temperatura média mensal do ar': ['mesMaisFrio', 16, 5],
  'Temperatura do solo': ['temperatura', 6, 5],
  'Chuva anual': ['chuvaAnual', 18, 600],
};

function avaliarAmbiente(especie, dados, cultivo) {
  const solo = solos[dados.tipoSolo];
  const drenagem = dados.drenagem || solo?.drenagem;
  const profundidade = dados.profundidade || solo?.profundidade;
  const motivos = [];
  let pontos = 0;
  if (dados.drenagem === 'encharcada' && precisaDrenagem.has(especie.id)) return null;
  // A Embrapa registra pelo menos 1.200 mm/ano de necessidade hídrica para a bananeira.
  if (especie.id === 'banana' && Number.isFinite(dados.chuvaAnual) && dados.chuvaAnual < 1200) {
    if (dados.irrigacao !== 'sim') return null;
    motivos.push('A chuva anual fica abaixo da referência. Avalie quanto a irrigação precisará complementar.');
  }
  if (Number.isFinite(dados.chuvaAnual) && dados.chuvaAnual < 800) {
    if (especie.id === 'pitanga') {
      pontos += 12;
      motivos.push('Tolera períodos secos. Com déficit de água, a frutificação pode ser prejudicada.');
    } else if (especie.id === 'inga-de-metro') {
      pontos -= dados.irrigacao === 'sim' ? 12 : 24;
      motivos.push('A ficha descreve cultivo em ambientes tropicais úmidos. Avalie a oferta de água na área.');
    }
  }
  if (precisaDrenagem.has(especie.id) && ['lenta', 'boa'].includes(drenagem)) {
    pontos += drenagem === 'boa' ? 6 : -24;
    motivos.push(drenagem === 'boa'
      ? 'A drenagem observada atende à preferência de cultivo.'
      : 'A drenagem lenta é um ponto de atenção para esta espécie.');
  }
  if (profundidade === 'raso' && precisaProfundidade.has(especie.id)) {
    pontos -= 22;
    motivos.push('A referência indica solo profundo. Confira o espaço disponível para as raízes.');
  }
  let climaComparado = false;
  for (const faixa of cultivo?.faixas ?? []) {
    const medida = medidasCultivo[faixa.parametro];
    if (!medida || (faixa.parametro === 'Temperatura do ar' && faixa.tipo.includes('emergência'))) continue;
    const [campo, peso, escala] = medida;
    const valor = dados[campo];
    if (!Number.isFinite(valor)) continue;
    if (['temperaturaAr', 'mesMaisFrio', 'chuvaAnual'].includes(campo)) climaComparado = true;
    const distancia = Math.max(0, (faixa.min ?? -Infinity) - valor, valor - (faixa.max ?? Infinity));
    if (faixa.tipo === 'Mínimo descrito' && distancia > 0) return null;
    pontos += distancia === 0 ? peso : -Math.ceil(peso * Math.min(distancia / escala, 2));
    const intervalo = faixa.max == null ? `a partir de ${faixa.min}`
      : faixa.min == null ? `até ${faixa.max}` : `${faixa.min} a ${faixa.max}`;
    motivos.push(`${faixa.parametro} (${valor} ${faixa.unidade}) ${distancia ? 'fora' : 'dentro'} da faixa de referência (${intervalo} ${faixa.unidade}).`);
  }
  if (ocorrencias[especie.id]?.ufs.includes(dados.estado)) {
    pontos += 14;
    motivos.push(`A fonte de distribuição registra ocorrência na UF ${dados.estado}.`);
  }
  if (!climaComparado) motivos.push('Sem comparação climática disponível para esta espécie neste cenário.');
  return { pontos, motivos };
}

// Cada linha traz: campo da análise, limite mínimo, limite máximo, peso e nome legível.
const criterios = [
  ['ph', 'phMin', 'phMax', 'ph', 'pH'],
  ['temperatura', 'temperaturaMin', 'temperaturaMax', 'temperatura', 'Temperatura'],
  ['umidade', 'umidadeMin', 'umidadeMax', 'umidade', 'Umidade'],
];
// Relaciona uma necessidade do diagnóstico à propriedade que a espécie precisa ter.
const funcoes = {
  FIXACAO_NITROGENIO: 'fixaNitrogenio',
  BIOMASSA: 'produzBiomassa',
  COBERTURA_SOLO: 'protegeSolo',
  PRODUCAO_ALIMENTAR: 'produzAlimento',
};
// Devolve uma cópia da espécie com pontos e motivos, ou null se ela for excluída.
// contexto informa o que já foi escolhido no modelo; {} permite avaliar sem esse contexto.
export function pontuarEspecie(especie, dados, diagnostico, pesos, contexto = {}) {
  if (especie.recomendacaoAutomatica === false) return null;
  let pontuacao = 0;
  const justificativas = [];
  const ignorados = []; // Critérios sem informação não ganham pontos.
  for (const [campo, min, max, peso, nome] of criterios) {
    // Sem os dois limites, não sabemos avaliar essa medida para esta espécie.
    if (!Number.isFinite(dados[campo]) || (especie[min] == null && especie[max] == null)) {
      ignorados.push(nome);
      continue;
    }
    // Basta ultrapassar um limite conhecido para excluir a espécie desta análise.
    if (
      (especie[min] != null && dados[campo] < especie[min]) ||
      (especie[max] != null && dados[campo] > especie[max])
    ) {
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
  const ambiente = avaliarAmbiente(especie, dados, contexto.cultivo?.get(especie.id));
  if (!ambiente) return null;
  pontuacao += ambiente.pontos;
  justificativas.push(...ambiente.motivos);
  // Cada função confirmada que atende uma prioridade recebe o peso necessidade.
  for (const necessidade of diagnostico.necessidades) {
    if (funcoes[necessidade] && especie[funcoes[necessidade]] === true) {
      pontuacao += pesos.necessidade;
      justificativas.push(
        `${especie.funcaoPrincipal}: atende ${necessidade.toLowerCase().replaceAll('_', ' ')} (+${pesos.necessidade} pontos).`,
      );
    }
  }
  // Preferências do papel têm prioridade. Sem elas, valorizamos uma camada ainda ausente.
  const ocupaEstratoNecessario = contexto.estratosPreferidos
    ? contexto.estratosPreferidos.includes(especie.estrato)
    : contexto.estratos && !contexto.estratos.includes(especie.estrato);
  if (ocupaEstratoNecessario) {
    pontuacao += pesos.estrato;
    justificativas.push(
      `Ocupa um estrato prioritário para o papel: ${especie.estrato.toLowerCase()} (+${pesos.estrato} pontos).`,
    );
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
    justificativas.push(
      'As referências de cultivo descrevem condições específicas. Consulte a ficha antes de implantar.',
    );
  }
  if (!especie.estados && !ocorrencias[especie.id]?.ufs.includes(dados.estado)) {
    justificativas.push(
      'O modelo não tem registro de ocorrência para esta espécie na UF informada.',
    );
  }
  // ... copia os dados da espécie sem acrescentar pontos ao catálogo original.
  return {
    ...especie,
    pontuacao,
    justificativas,
    criteriosIgnorados: ignorados,
  };
}
// Avalia o catálogo inteiro, remove exclusões e ordena os resultados.
export function recomendar(especies, dados, diagnostico, pesos, contexto) {
  return (
    especies
      .map((especie) => pontuarEspecie(especie, dados, diagnostico, pesos, contexto))
      .filter(Boolean) // null vira false e é retirado; os objetos de espécies permanecem.
      // Maior pontuação vem primeiro; o id desempata para manter uma ordem previsível.
      .sort((a, b) => b.pontuacao - a.pontuacao || a.id.localeCompare(b.id))
  );
}
