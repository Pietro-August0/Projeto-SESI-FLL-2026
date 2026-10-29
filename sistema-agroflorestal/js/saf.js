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
// Monta uma proposta. deslocamento permite variar a escolha entre candidatas empatadas.
function construir(modelo, catalogo, dados, diagnostico, pesos, interacoes, deslocamento = 0) {
  const escolhidas = [];
  const pendencias = []; // Guarda os papéis obrigatórios que ficaram sem candidata.
  for (const papel of modelo.papeis) {
    // Primeiro aceita só espécies que podem cumprir este papel; depois calcula os pontos.
    const candidatas = recomendar(
      catalogo.filter((especie) => especie.papeis.includes(papel.tipo)),
      dados,
      diagnostico,
      pesos,
      {
        estratos: escolhidas.map((e) => e.estrato), // Camadas que já estão presentes.
        estratosPreferidos: papel.estratosPreferidos,
        funcoes: escolhidas.map((e) => e.funcaoPrincipal),
        sucessao: papel.sucessao,
      },
      // some pergunta se já existe uma escolhida repetida ou uma relação proibida.
    ).filter(
      (especie) =>
        !escolhidas.some(
          (e) =>
            e.id === especie.id ||
            consultarInteracao(e.id, especie.id, interacoes).status === 'EVITAR',
        ),
    );
    // recomendar ordena por pontos, então a primeira candidata possui a maior nota.
    const melhores = candidatas.filter((e) => e.pontuacao === candidatas[0]?.pontuacao);
    // % calcula o resto: a posição volta ao início quando chega ao fim dos empates.
    const selecionada = melhores.length ? melhores[deslocamento % melhores.length] : null;
    // Uma falta opcional é aceita; uma falta obrigatória ficará registrada na proposta.
    if (!selecionada) {
      if (!papel.opcional) {
        pendencias.push(papel.tipo);
      }
      continue;
    }
    // Acrescenta a escolhida com o papel que ela cumprirá especificamente neste modelo.
    escolhidas.push({
      ...selecionada,
      papel: papel.tipo,
      faseEntrada: papel.fase,
      justificativas: [
        `Preenche o papel ${papel.tipo.toLowerCase().replaceAll('_', ' ')} deste modelo.`,
        ...selecionada.justificativas,
      ],
    });
  }
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
    pendencias,
    interacoes: relacoes,
  };
}
// Tenta combinações até encontrar três propostas completas e diferentes.
export function montarSAFs(diagnostico, dados, catalogo, modelos, interacoes, pesos) {
  // Cada objetivo pode permitir modelos diferentes.
  const compativeis = modelos.filter((modelo) => modelo.objetivos.includes(dados.objetivo));
  const resultados = [];
  const assinaturas = new Set(); // Guarda combinações já vistas, sem repetir valores.
  for (let variante = 0; variante < catalogo.length && resultados.length < 3; variante++) {
    for (const modelo of compativeis) {
      const saf = construir(modelo, catalogo, dados, diagnostico, pesos, interacoes, variante);
      // Ordenar os ids torna a assinatura igual mesmo se a ordem das espécies mudar.
      const assinatura = saf.especies
        .map((e) => e.id)
        .sort()
        .join('|');
      // Exige espécies, nenhuma falta obrigatória e uma combinação ainda não usada.
      if (saf.especies.length && !saf.pendencias.length && !assinaturas.has(assinatura)) {
        resultados.push(saf);
        assinaturas.add(assinatura);
      }
      // Já temos o máximo de propostas mostrado nas abas, então podemos parar.
      if (resultados.length === 3) {
        break;
      }
    }
  }
  return resultados;
}
