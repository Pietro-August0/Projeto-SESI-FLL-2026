import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { perfisVisuais, estadoDaPlanta, faseDoProgresso } from '../sistema-agroflorestal/js/evolucao-plantas.js';
import { desenharEspecie, desenharRaizes } from '../sistema-agroflorestal/js/desenhos-plantas.js';

const especies = JSON.parse(await readFile(new URL('../sistema-agroflorestal/dados/especies.json', import.meta.url), 'utf8')).filter(e => perfisVisuais[e.id]);
const fases = {
    implantacao: especies.map(e => e.id),
    desenvolvimento: especies.filter(e => e.ciclo !== 'CURTO' || e.estrato === 'COBERTURA').map(e => e.id),
    estabelecido: especies.filter(e => e.ciclo === 'PERENE' || e.estrato === 'COBERTURA').map(e => e.id)
};

test('cada espécie do catálogo possui um desenho próprio, sem fallback por estrato', () => {
    assert.deepEqual(Object.keys(perfisVisuais).sort(), especies.map(e => e.id).sort());
    const tipos = Object.values(perfisVisuais).map(p => p.tipo);
    assert.equal(new Set(tipos).size, especies.length);
});

test('todos os quadros geram geometria finita e opacidades válidas', () => {
    for (const e of especies) {
        for (let t = 0; t <= 100; t++) {
            const estado = estadoDaPlanta(e, t, fases);
            for (const chave of ['crescimento', 'vigor', 'opacidade', 'raiz', 'reproducao', 'residuos']) {
                assert(Number.isFinite(estado[chave]), `${e.id}, quadro ${t}, ${chave}`);
                assert(estado[chave] >= 0 && estado[chave] <= 1, `${e.id}: ${chave} fora da faixa`);
            }
            assert(!/NaN|Infinity|undefined/.test(desenharEspecie(e, estado) + desenharRaizes(e, estado)));
        }
    }
});

test('culturas curtas encerram o ciclo sem reaparecer como plantas adultas', () => {
    const milho = especies.find(e => e.id === 'milho');
    assert(estadoDaPlanta(milho, 24, fases).presente);
    assert(!estadoDaPlanta(milho, 50, fases).presente);
    assert(!estadoDaPlanta(milho, 100, fases).presente);
    assert(estadoDaPlanta(milho, 100, fases).residuos > 0);
});

test('coberturas anuais são renovadas com novos indivíduos', () => {
    const cobertura = especies.find(e => e.id === 'feijao-de-porco');
    const antes = estadoDaPlanta(cobertura, 28, fases);
    const depois = estadoDaPlanta(cobertura, 40, fases);
    assert.equal(antes.geracao, 0);
    assert.equal(depois.geracao, 1);
    assert(depois.crescimento < antes.crescimento);
    assert.equal(depois.estado, 'Cobertura renovada');
    assert(depois.residuos > 0);
    assert(estadoDaPlanta(cobertura, 100, fases).presente);
});

test('perenes conservam crescimento contínuo e os ritmos diferem entre espécies', () => {
    for (const e of especies.filter(e => e.ciclo === 'PERENE')) {
        let anterior = 0;
        for (let t = 0; t <= 100; t++) {
            const estado = estadoDaPlanta(e, t, fases);
            assert(estado.presente);
            assert(estado.crescimento >= anterior);
            anterior = estado.crescimento;
        }
    }
    const banana = estadoDaPlanta(especies.find(e => e.id === 'banana'), 50, fases);
    const andiroba = estadoDaPlanta(especies.find(e => e.id === 'andiroba'), 50, fases);
    assert.notEqual(banana.crescimento, andiroba.crescimento);
});

test('raízes tuberosas, fasciculadas e ramificadas têm geometrias diferentes', () => {
    const desenhos = ['mandioca', 'milho', 'andiroba'].map(id => {
        const e = especies.find(e => e.id === id);
        return desenharRaizes(e, estadoDaPlanta(e, 24, fases));
    });
    assert.equal(new Set(desenhos).size, 3);
});

test('a sequência limita a entrada e mantém os marcos das três fases', () => {
    const e = especies[0];
    assert.deepEqual(estadoDaPlanta(e, -10, fases), estadoDaPlanta(e, 0, fases));
    assert.deepEqual(estadoDaPlanta(e, 200, fases), estadoDaPlanta(e, 100, fases));
    assert.deepEqual([0, 33, 34, 66, 67, 100].map(faseDoProgresso), [0, 0, 1, 1, 2, 2]);
});
