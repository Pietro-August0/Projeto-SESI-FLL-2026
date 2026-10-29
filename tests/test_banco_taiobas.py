"""Rastreabilidade do inventário histórico e separação das hipóteses de cultivo."""
import json
from pathlib import Path
import re
import unicodedata
import unittest
import xml.etree.ElementTree as ET
import zipfile

RAIZ = Path(__file__).resolve().parents[1]
PUBLICO = RAIZ / 'sistema-agroflorestal'


def normalizar(texto):
    texto = unicodedata.normalize('NFD', texto).encode('ascii', 'ignore').decode().lower()
    return re.sub('[^a-z0-9]', '', texto)


class BancoTaiobasTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.banco = json.loads((RAIZ / 'docs/INVENTARIO-ORIGINAL-TAIOBAS.json').read_text(encoding='utf-8'))
        cls.catalogo = json.loads((PUBLICO / 'dados/especies.json').read_text(encoding='utf-8'))

    def test_todas_as_celulas_do_documento_foram_preservadas(self):
        documento = RAIZ / self.banco['documento']['arquivo']
        if not documento.exists():
            self.skipTest('Documento original do parceiro não disponível neste checkout')
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        with zipfile.ZipFile(documento) as zipado:
            raiz = ET.fromstring(zipado.read('word/document.xml'))
        nomes = [' '.join(t.text or '' for t in celula.findall('.//w:t', ns))
                 for celula in raiz.findall('.//w:tbl/w:tr/w:tc', ns)]
        registros = sorted(self.banco['registros'], key=lambda r: r['ordemNoDocumento'])
        self.assertEqual(nomes, [r['nomeOriginal'] for r in registros])
        self.assertEqual(list(range(1, len(nomes) + 1)), [r['ordemNoDocumento'] for r in registros])
        for r in registros:
            self.assertEqual(normalizar(r['nomeOriginal']), normalizar(r['nome']))

    def test_fichas_tem_fontes_e_nao_inventam_identificacao_do_lote(self):
        registros = self.banco['registros']
        self.assertEqual(len(registros), 69)
        self.assertEqual(len({r['id'] for r in registros}), len(registros))
        for r in registros:
            with self.subTest(registro=r['id']):
                self.assertIn(r['status'], ('CATALOGO', 'PESQUISADO', 'PENDENTE'))
                for campo in ('nomeOriginal', 'nomeCientifico', 'resumo', 'cultivo', 'propagacao', 'cuidados'):
                    self.assertTrue(r[campo])
                self.assertIs(r['identidadeDoLoteConfirmada'], False)
                if r['status'] == 'PESQUISADO':
                    self.assertTrue(r['fontes'])
                for fonte in r['fontes']:
                    referencia = self.banco['fontes'][fonte]
                    self.assertTrue(referencia['url'].startswith('https://'))
                    self.assertTrue(referencia['escopo'])

    def test_correspondencias_nao_duplicam_especies_ou_variedades(self):
        ids = {e['id'] for e in self.catalogo}
        existentes = [r for r in self.banco['registros'] if r['status'] == 'CATALOGO']
        self.assertEqual(len(existentes), 8)
        self.assertEqual(len({r['especieId'] for r in existentes}), 6)
        for r in self.banco['registros']:
            if r['status'] == 'CATALOGO':
                self.assertIn(r['especieId'], ids)
            else:
                self.assertIsNone(r['especieId'])
                self.assertIn(r['id'], ids)
                ficha = next(e for e in self.catalogo if e['id'] == r['id'])
                self.assertTrue(ficha['registrosTaiobas'])
                self.assertIn(ficha['situacaoUso'], ('MODELO', 'COMPLEMENTAR', 'IDENTIFICACAO', 'HISTORICO'))
                if ficha['registrosTaiobas'][0]['identificacao'] == 'PENDENTE':
                    self.assertIs(ficha['recomendacaoAutomatica'], False)
        bananas = [r for r in existentes if r['especieId'] == 'banana']
        self.assertEqual(len(bananas), 3)

    def test_credito_do_parceiro_e_observacao_historica_estao_explicitos(self):
        self.assertEqual(self.banco['parceiro']['nome'], 'Grupo Taiobas do Matão USP')
        self.assertIsNone(self.banco['parceiro']['logo'])
        self.assertIn('informados pela equipe', self.banco['parceiro']['origemCredito'])
        self.assertEqual(self.banco['documento']['anoInventario'], 2021)
        self.assertEqual(self.banco['solo']['ano'], 2022)
        self.assertIn('algoritmo', self.banco['solo']['aplicacao'])
        for pagina in ('especies.html', 'historia.html', 'sobre.html'):
            self.assertIn('Grupo Taiobas do Matão USP', (PUBLICO / pagina).read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
