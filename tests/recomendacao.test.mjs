import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { pontuarEspecie } from '../sistema-agroflorestal/js/recomendacao.js';
import { montarSAFs } from '../sistema-agroflorestal/js/saf.js';

function ler(nome) {
  return JSON.parse(readFileSync(new URL(`../sistema-agroflorestal/dados/${nome}.json`, import.meta.url)));
}

const catalogo = ler('especies');
const modelos = ler('modelos-saf');
const interacoes = ler('interacoes');
const fichas = ler('cultivo');
const { pesos } = ler('faixas-solo');
const diagnostico = { necessidades: ['COBERTURA_SOLO', 'FIXACAO_NITROGENIO', 'PRODUCAO_ALIMENTAR'] };
const solo = { ph: 5.8, tipoSolo: 'latossolo', objetivo: 'MISTO' };
const seco = { ...solo, estado: 'PE', temperaturaAr: 27.2, mesMaisFrio: 24.6, chuvaAnual: 368 };
const umido = { ...solo, estado: 'PA', temperaturaAr: 27.1, mesMaisFrio: 26.3, chuvaAnual: 2017 };

test('climas diferentes com o mesmo solo e objetivo mudam a composição', () => {
  const compor = (dados) => montarSAFs(diagnostico, dados, catalogo, modelos, interacoes, pesos, fichas);
  const propostasSecas = compor(seco);
  const propostasUmidas = compor(umido);
  assert.ok(propostasSecas.length && propostasUmidas.length);
  assert.notDeepEqual(propostasSecas[0].especies.map((e) => e.id), propostasUmidas[0].especies.map((e) => e.id));
  assert.ok(propostasSecas.every((saf) => saf.especies.every((e) => e.id !== 'banana')));
});

test('condições observadas têm prioridade sobre a indicação da classe de solo', () => {
  const banana = catalogo.find((especie) => especie.id === 'banana');
  const contexto = { cultivo: new Map(fichas.map((ficha) => [ficha.id, ficha])) };
  const pontuar = (dados) => pontuarEspecie(banana, dados, diagnostico, pesos, contexto);
  const soloLento = { ...umido, tipoSolo: 'gleissolo' };
  assert.ok(pontuar(soloLento).pontuacao < pontuar({ ...soloLento, drenagem: 'boa' }).pontuacao);
  assert.equal(pontuar({ ...umido, drenagem: 'encharcada' }), null);
  assert.ok(pontuar({ ...seco, irrigacao: 'sim' }));
});
