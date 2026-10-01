const criterios = [ ['ph', 'phMin', 'phMax', 'ph', 'pH'], ['temperatura', 'temperaturaMin', 'temperaturaMax', 'temperatura', 'Temperatura'], ['umidade', 'umidadeMin', 'umidadeMax', 'umidade', 'Umidade'] ];
const funcoes = { FIXACAO_NITROGENIO: 'fixaNitrogenio', BIOMASSA: 'produzBiomassa', COBERTURA_SOLO: 'protegeSolo', PRODUCAO_ALIMENTAR: 'produzAlimento' };
export function pontuarEspecie(especie, dados, diagnostico, pesos, contexto = {}) {
  let pontuacao = 0;
  const justificativas = [];
  const ignorados = [];
  for (const [campo, min, max, peso, nome] of criterios) {
    if (especie[min] == null && especie[max] == null) { ignorados.push(nome); continue; }
    if ((especie[min] != null && dados[campo] < especie[min]) || (especie[max] != null && dados[campo] > especie[max])) return null;
    pontuacao += pesos[peso];
    justificativas.push(`${nome} dentro dos limites cadastrados (+${pesos[peso]} pontos).`);
  }
  // A localização só elimina quando há uma restrição explicitamente cadastrada.
  if (especie.estados && !especie.estados.includes(dados.estado)) return null;
  for (const necessidade of diagnostico.necessidades) {
    if (funcoes[necessidade] && especie[funcoes[necessidade]] === true) {
      pontuacao += pesos.necessidade;
      justificativas.push(`${especie.funcaoPrincipal}: atende ${necessidade.toLowerCase().replaceAll('_', ' ')} (+${pesos.necessidade} pontos).`);
    }
  }
  const ocupaEstratoNecessario = contexto.estratosPreferidos ? contexto.estratosPreferidos.includes(especie.estrato) : contexto.estratos && !contexto.estratos.includes(especie.estrato);
  if (ocupaEstratoNecessario) { pontuacao += pesos.estrato; justificativas.push(`Ocupa um estrato prioritário para o papel: ${especie.estrato.toLowerCase()} (+${pesos.estrato} pontos).`); }
  if (contexto.sucessao?.includes(especie.sucessao)) { pontuacao += pesos.sucessao; justificativas.push(`Sucessão compatível com o papel (+${pesos.sucessao} pontos).`); }
  if (contexto.funcoes && !contexto.funcoes.includes(especie.funcaoPrincipal)) { pontuacao += pesos.diversidade; justificativas.push(`Adiciona uma função à composição (+${pesos.diversidade} pontos).`); }
  justificativas.unshift(especie.funcaoPrincipal);
  if (ignorados.length) justificativas.push(`Sem faixa confirmada para ${ignorados.join(', ')}; esses critérios não somam pontos nem confirmam adaptação.`);
  if (!especie.estados) justificativas.push('Distribuição regional não validada; município e estado contextualizam a análise, sem confirmar aptidão local.');
  return { ...especie, pontuacao, justificativas, criteriosIgnorados: ignorados };
}
export function recomendar(especies, dados, diagnostico, pesos, contexto) {
  return especies.map(especie => pontuarEspecie(especie, dados, diagnostico, pesos, contexto)).filter(Boolean).sort((a, b) => b.pontuacao - a.pontuacao || a.id.localeCompare(b.id));
}
