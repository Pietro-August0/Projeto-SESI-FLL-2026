/* saf.js monta Sistemas Agroflorestais (SAFs) preenchendo os papéis dos modelos.
 * Uma proposta só é exibida se todos os seus papéis obrigatórios forem preenchidos.
 */
import { recomendar } from './recomendacao.js';

// Procura o par nas duas ordens: a relação de A com B é a mesma consulta de B com A.
export function consultarInteracao(a, b, interacoes) {
  // Sem registro, devolvemos DESCONHECIDA; ausência não comprova compatibilidade.
  return (
    interacoes.find(
      (item) =>
        (item.especieA === a && item.especieB === b) ||
        (item.especieA === b && item.especieB === a),
    ) || {
      status: 'DESCONHECIDA',
      motivo: 'Sem relação documentada no catálogo local.',
    }
  );
}
function* combinar(modelo, catalogo, dados, diagnostico, pesos, interacoes, cultivo) {
  const papeis = modelo.papeis.map((papel) => ({
    ...papel,
    candidatas: catalogo.filter((especie) => especie.papeis.includes(papel.tipo)),
  }));
  function* preencher(indice, escolhidas) {
    if (indice === papeis.length) {
      yield descreverSAF(modelo, escolhidas, interacoes);
      return;
    }
    const papel = papeis[indice];
    const candidatas = recomendar(
      papel.candidatas.filter((especie) => !escolhidas.some((e) =>
        e.id === especie.id || consultarInteracao(e.id, especie.id, interacoes).status === 'EVITAR',
      )),
      dados,
      diagnostico,
      pesos,
      {
        estratosPreferidos: papel.estratosPreferidos,
        funcoes: escolhidas.map((e) => e.funcaoPrincipal),
        estratos: escolhidas.map((e) => e.estrato),
        sucessao: papel.sucessao,
        cultivo,
      },
    );
    for (const especie of candidatas) {
      yield* preencher(indice + 1, [...escolhidas, {
        ...especie,
        papel: papel.tipo,
        faseEntrada: papel.fase,
        justificativas: [
          `Preenche o papel ${papel.tipo.toLowerCase().replaceAll('_', ' ')} deste modelo.`,
          ...especie.justificativas,
        ],
      }]);
    }
    if (papel.opcional) yield* preencher(indice + 1, escolhidas);
  }
  yield* preencher(0, []);
}

export function descreverSAF(modelo, escolhidas, interacoes) {
  // As listas guardam ids para relacionar as fases às mesmas espécies da proposta.
  const fases = {
    implantacao: [],
    desenvolvimento: [],
    estabelecido: [],
  };
  // Ciclos curtos encerram sua participação; coberturas continuam por renovação.
  escolhidas.forEach((e) => {
    fases.implantacao.push(e.id); // Perenes são implantadas como mudas; sua função se consolida depois.
    if (e.ciclo !== 'CURTO' || e.estrato === 'COBERTURA') {
      fases.desenvolvimento.push(e.id);
    }
    // Cobertura é mantida como função do sistema, com renovação e manejo quando preciso.
    if (e.ciclo === 'PERENE' || e.estrato === 'COBERTURA') {
      fases.estabelecido.push(e.id);
    }
  });
  const relacoes = [];
  // j começa depois de i para consultar cada par uma vez, sem comparar uma planta consigo.
  for (let i = 0; i < escolhidas.length; i++) {
    for (let j = i + 1; j < escolhidas.length; j++) {
      relacoes.push({
        ...consultarInteracao(escolhidas[i].id, escolhidas[j].id, interacoes),
        especieA: escolhidas[i].nome,
        especieB: escolhidas[j].nome,
      });
    }
  }
  // Devolve uma proposta organizada; resultado.js cuidará de desenhá-la.
  return {
    titulo: modelo.titulo,
    resumo: modelo.resumo,
    especies: escolhidas,
    fases,
    interacoes: relacoes,
  };
}
// Tenta combinações até encontrar três propostas completas e diferentes.
export function montarSAFs(diagnostico, dados, catalogo, modelos, interacoes, pesos, fichas = []) {
  const cultivo = new Map(fichas.map((ficha) => [ficha.id, ficha]));
  let compativeis = modelos.filter((modelo) => modelo.objetivos.includes(dados.objetivo))
    .map((modelo) => combinar(modelo, catalogo, dados, diagnostico, pesos, interacoes, cultivo));
  const resultados = [];
  const assinaturas = new Set();
  while (compativeis.length && resultados.length < 3) {
    const restantes = [];
    for (const combinacoes of compativeis) {
      for (const saf of combinacoes) {
        const assinatura = saf.especies.map((e) => e.id).sort().join('|');
        if (!assinatura || assinaturas.has(assinatura)) continue;
        resultados.push(saf);
        assinaturas.add(assinatura);
        restantes.push(combinacoes);
        break;
      }
      if (resultados.length === 3) break;
    }
    compativeis = restantes;
  }
  return resultados;
}
