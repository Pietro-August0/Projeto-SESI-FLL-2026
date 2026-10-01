import { validarAnalise } from './utils.js';
export function diagnosticar(dados, configuracao) {
  const erros = validarAnalise(dados);
  if (erros.length) throw new Error(erros.join(' '));
  const parametros = {};
  const necessidades = new Set(configuracao.necessidadesBase);
  for (const [campo, regra] of Object.entries(configuracao.parametros)) {
    const valor = dados[campo];
    if (valor == null) continue;
    const status = valor < regra.minAdequado ? 'BAIXO' : valor > regra.maxAdequado ? (regra.statusAlto || 'ALTO') : 'ADEQUADO';
    parametros[campo] = { status, valor, rotulo: regra.rotulo, unidade: regra.unidade, faixa: `${regra.minAdequado} a ${regra.maxAdequado}`, explicacao: regra.explicacoes[status] };
    (regra.necessidades[status] || []).forEach(item => necessidades.add(item));
  }
  if (['PRODUCAO', 'MISTO'].includes(dados.objetivo)) necessidades.add('PRODUCAO_ALIMENTAR');
  if (dados.objetivo === 'RECUPERACAO') { necessidades.add('BIOMASSA'); necessidades.add('COBERTURA_SOLO'); }
  return { parametros, necessidades: [...necessidades] };
}
