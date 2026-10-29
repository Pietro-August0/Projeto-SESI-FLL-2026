"""Integridade da curadoria: proveniência, contexto, unidades e arquivos locais."""

import json
from pathlib import Path
import unittest

PUBLICO = Path(__file__).resolve().parents[1] / "sistema-agroflorestal"


def dados(nome):
    return json.loads((PUBLICO / "dados" / nome).read_text(encoding="utf-8"))


class CuradoriaTest(unittest.TestCase):
    def test_cada_especie_tem_ficha_e_fontes_rastreaveis(self):
        especies, cultivo, fontes = (
            dados("especies.json"),
            dados("cultivo.json"),
            dados("referencias.json"),
        )
        ids = [e["id"] for e in especies]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertCountEqual(ids, [e["id"] for e in cultivo])
        for ficha in cultivo:
            with self.subTest(especie=ficha["id"]):
                for campo in (
                    "resumo",
                    "luminosidade",
                    "solo",
                    "agua",
                    "manejo",
                    "nutricao",
                    "fontes",
                ):
                    self.assertTrue(ficha[campo])
                for fonte in ficha["fontes"]:
                    self.assertIn(fonte, fontes)
                for faixa in ficha["faixas"]:
                    self.assertIn(faixa["fonte"], ficha["fontes"])
                    for campo in ("parametro", "unidade", "tipo", "contexto"):
                        self.assertTrue(faixa[campo])
                    minimo, maximo = faixa["min"], faixa["max"]
                    self.assertFalse(minimo is None and maximo is None)
                    if minimo is not None and maximo is not None:
                        self.assertLessEqual(minimo, maximo)

    def test_interacoes_tem_pares_unicos_e_contexto_sem_proibicao_global(self):
        ids = {e["id"] for e in dados("especies.json")}
        pares = set()
        fontes = {f["url"] for f in dados("referencias.json").values()}
        for r in dados("interacoes.json"):
            par = frozenset((r["especieA"], r["especieB"]))
            self.assertEqual(len(par), 2)
            self.assertTrue(par <= ids)
            self.assertNotIn(par, pares)
            pares.add(par)
            self.assertIn(
                r["status"], ("FAVORAVEL_CONDICIONAL", "CONSORCIO_DOCUMENTADO", "ATENCAO")
            )
            for campo in ("motivo", "contexto", "manejo", "tipoEvidencia", "revisadoEm"):
                self.assertTrue(r[campo])
            self.assertIn(r["fonte"]["url"], fontes)

    def test_imagens_locais_validas_e_com_creditos(self):
        creditos = {c["id"]: c for c in dados("creditos-imagens.json")}
        for e in dados("especies.json"):
            with self.subTest(especie=e["id"]):
                m = e["imagem"]
                if m is None:
                    self.assertTrue(e.get("registrosTaiobas"))
                    continue
                arquivo = PUBLICO / m["url"]
                self.assertTrue(
                    arquivo.resolve().is_relative_to((PUBLICO / "assets" / "plantas").resolve())
                )
                self.assertTrue(arquivo.is_file())
                self.assertTrue(arquivo.read_bytes().startswith(b"\xff\xd8\xff"))
                for campo in ("autor", "licenca", "licencaUrl", "fonteUrl", "urlOrigem", "alt"):
                    self.assertTrue(m[campo])
                self.assertEqual(
                    m, {k: v for k, v in creditos[e["id"]].items() if k not in ("id", "especie")}
                )

    def test_funcoes_com_novas_evidencias_apontam_para_fontes(self):
        fontes = dados("referencias.json")
        especies = dados("especies.json")
        for e in especies:
            for f in e.get("funcoesDocumentadas", []):
                self.assertIn(f["fonte"], fontes)
                self.assertEqual(e[f["campo"]], f["valor"])
                self.assertTrue(f["contexto"])
        parica = next(e for e in especies if e["id"] == "parica")
        self.assertIs(parica["fixaNitrogenio"], False)

    def test_referencias_climaticas_nao_viraram_limites_do_sensor_de_solo(self):
        # As faixas de consulta incluem médias climáticas e ótima de germinação.
        # Elas não podem ser copiadas para exclusões de uma leitura instantânea.
        for e in dados("especies.json"):
            for campo in (
                "temperaturaMin",
                "temperaturaMax",
                "umidadeMin",
                "umidadeMax",
                "demandaN",
                "demandaP",
                "demandaK",
            ):
                self.assertIsNone(e[campo])


if __name__ == "__main__":
    unittest.main()
