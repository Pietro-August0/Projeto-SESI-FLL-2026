import { recomendar } from './recomendacao.js';
export function consultarInteracao(a, b, interacoes) {
  return interacoes.find(item => (item.especieA === a && item.especieB === b) || (item.especieA === b && item.especieB === a)) || { status: 'DESCONHECIDA', motivo: 'Sem relação documentada no catálogo local.' };
}
function construir(modelo, catalogo, dados, diagnostico, pesos, interacoes, deslocamento = 0) {
  const escolhidas = [];
  const pendencias = [];
  for (const papel of modelo.papeis) {
    const candidatas = recomendar(catalogo.filter(especie => especie.papeis.includes(papel.tipo)), dados, diagnostico, pesos, { estratos: escolhidas.map(e => e.estrato), estratosPreferidos: papel.estratosPreferidos, funcoes: escolhidas.map(e => e.funcaoPrincipal), sucessao: papel.sucessao }).filter(especie => !escolhidas.some(e => e.id === especie.id || consultarInteracao(e.id, especie.id, interacoes).status === 'EVITAR'));
    // A segunda variante muda as alternativas empatadas, sem retirar prioridade das necessidades.
    const melhores = candidatas.filter(e => e.pontuacao === candidatas[0]?.pontuacao);
    const selecionada = melhores.length ? melhores[deslocamento % melhores.length] : null;
    if (!selecionada) { if (!papel.opcional) pendencias.push(papel.tipo); continue; }
    escolhidas.push({ ...selecionada, papel: papel.tipo, faseEntrada: papel.fase, justificativas: [`Preenche o papel ${papel.tipo.toLowerCase().replaceAll('_', ' ')} deste modelo.`, ...selecionada.justificativas] });
  }
  const fases = { implantacao: [], desenvolvimento: [], estabelecido: [] };
  escolhidas.forEach(e => {
    fases.implantacao.push(e.id); // Perenes são implantadas como mudas; sua função se consolida depois.
    if (e.ciclo !== 'CURTO') fases.desenvolvimento.push(e.id);
    if (e.ciclo === 'PERENE' || e.estrato === 'COBERTURA') fases.estabelecido.push(e.id);
  });
  const relacoes = [];
  for (let i = 0; i < escolhidas.length; i++) for (let j = i + 1; j < escolhidas.length; j++) relacoes.push({ especieA: escolhidas[i].nome, especieB: escolhidas[j].nome, ...consultarInteracao(escolhidas[i].id, escolhidas[j].id, interacoes) });
  return { titulo: modelo.titulo, resumo: modelo.resumo, especies: escolhidas, fases, pendencias, interacoes: relacoes };
}
export function montarSAFs(diagnostico, dados, catalogo, modelos, interacoes, pesos) {
  const compativeis = modelos.filter(modelo => modelo.objetivos.includes(dados.objetivo));
  const resultados = [];
  const assinaturas = new Set();
  for (let variante = 0; variante < catalogo.length && resultados.length < 3; variante++) {
    for (const modelo of compativeis) {
      const saf = construir(modelo, catalogo, dados, diagnostico, pesos, interacoes, variante);
      const assinatura = saf.especies.map(e => e.id).sort().join('|');
      if (saf.especies.length && !saf.pendencias.length && !assinaturas.has(assinatura)) { resultados.push(saf); assinaturas.add(assinatura); }
      if (resultados.length === 3) break;
    }
  }
  return resultados;
}
