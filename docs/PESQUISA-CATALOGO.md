# Pesquisa ampliada do catálogo

![ybyrá](imagens/assinatura-ybyra.svg)

[Identidade visual](IDENTIDADE-VISUAL.md) · [Apresentação do projeto](../README.md)


**Revisão: 22/10/2026.** Pesquisa feita para ampliar o conteúdo do ybyrá, com rastreabilidade por dado e por relação.

## Cobertura

- 18 fichas com condições de luz, solo, água, manejo e nutrição.
- 43 referências numéricas com unidade, significado, contexto e fonte.
- 20 pares de espécies com evidência e cuidados explícitos.
- 30 fontes técnicas, científicas e taxonômicas.
- 18 imagens locais licenciadas, incluindo uma fotografia de paricá vivo em floração. Consulte os [créditos](CREDITOS-IMAGENS.md).

## Critérios de interpretação

Foram priorizados Embrapa, FAO, Kew, IDAM, MAPA, SENAR, EMATER-PA, Tropical Forages e artigos originais. Números de ocorrência natural não foram apresentados como limites fisiológicos. Faixas ótimas não viraram critérios absolutos de exclusão. Cada referência identifica a variável: ar, solo, chuva anual, chuva por ciclo ou umidade relativa do ar.

`cultivo.json` e `referencias.json` ampliam a consulta. Os campos numéricos de exclusão em `especies.json` permanecem nulos sem validação para o método e as entradas do sistema. Assim, não se converte chuva em umidade percentual do solo, nem temperatura média anual do ar em leitura instantânea de solo. O milho, por exemplo, tem uma referência de temperatura do solo para germinação, que não representa todas as fases.

As funções preenchidas nesta revisão possuem registros em `funcoesDocumentadas`, com fonte e contexto. A capacidade de fixar N não garante nodulação, transferência à planta vizinha ou uma dose de fertilizante. O paricá foi explicitamente registrado como não fixador, conforme a monografia da Embrapa.

As interações são consultadas nas duas ordens. Relações documentadas exibem o contexto e não ganham pontos automaticamente. Um registro de cultivo conjunto não prova benefício isolado entre todas as plantas de um SAF. Nenhuma relação desta revisão foi classificada como proibição global; alertas regionais e de manejo são apresentados como atenção. O código preserva a exclusão de futuros registros EVITAR.

## Lacunas preservadas

- Não há uma dose universal de N, P ou K por espécie; os valores arbitrários do formulário não equivalem a mg/kg, mg/dm³, kg/ha ou concentração foliar.
- Não foram cadastradas porcentagens genéricas de umidade do solo sem método de medição, textura e profundidade.
- Distribuição natural e registro de cultivo não foram convertidos em lista de estados aptos.
- A ausência de relação entre duas espécies continua significando ausência de registro, não neutralidade nem incompatibilidade.
- A foto de mucuna representa Mucuna pruriens sem variedade confirmada; o nome Mucuna aterrima foi mantido com nota taxonômica do Kew.
- A foto de banana representa Musa acuminata dentro do grupo Musa spp.; a imagem não identifica todas as cultivares.
- A imagem inicial de herbário do paricá foi substituída por fotografia de árvore viva em Parauapebas (PA), de Nereston (Nelinho) Camargo. O registro iNaturalist 81016397 contém identificações como Schizolobium amazonicum, agrupado como S. parahyba na plataforma. A foto 132840097 usa CC BY-NC 4.0, conforme o registro GBIF 3337735552; uso não comercial.

## Relações cadastradas

| Par | Classificação | Evidência e contexto | Fonte |
| :--- | :--- | :--- | :--- |
| Bananeira + Cacaueiro | FAVORAVEL_CONDICIONAL | Recomendação técnica. Implantação do cacau no sistema descrito pelo SENAR. | [SENAR / MAPA-CEPLAC — Cacau: produção, manejo e colheita](https://www.gov.br/agricultura/pt-br/assuntos/ceplac/arquivos/cartilhas-senar/215-cacau-producao-manejo-colheita.pdf) |
| Gliricídia + Cacaueiro | FAVORAVEL_CONDICIONAL | Recomendação técnica. Estabelecimento de cacaueiros. | [SENAR / MAPA-CEPLAC — Cacau: produção, manejo e colheita](https://www.gov.br/agricultura/pt-br/assuntos/ceplac/arquivos/cartilhas-senar/215-cacau-producao-manejo-colheita.pdf) |
| Bananeira + Cupuaçuzeiro | CONSORCIO_DOCUMENTADO | Unidade de observação. Dom Eliseu, PA; unidade implantada em 2006, com três espécies. | [Embrapa — SAF com paricá, cupuaçu e banana em Dom Eliseu, PA](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/409311/1/Digitalizar0197.pdf) |
| Paricá + Cupuaçuzeiro | CONSORCIO_DOCUMENTADO | Unidade de observação. Dom Eliseu, PA; arranjo de três espécies. | [Embrapa — SAF com paricá, cupuaçu e banana em Dom Eliseu, PA](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/409311/1/Digitalizar0197.pdf) |
| Paricá + Bananeira | CONSORCIO_DOCUMENTADO | Unidade de observação. Dom Eliseu, PA; arranjo de três espécies. | [Embrapa — SAF com paricá, cupuaçu e banana em Dom Eliseu, PA](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/409311/1/Digitalizar0197.pdf) |
| Milho + Feijão-caupi | ATENCAO | Experimento de campo. Petrolina, PE; cultivares e populações específicas no semiárido. | [Lima Filho — Respostas fisiológicas do milho e caupi à consorciação](https://apct.sede.embrapa.br/pab/pt_BR/article/view/5875) |
| Milho + Mucuna-preta | ATENCAO | Recomendação técnica. Sistema com semeadura diferida da mucuna descrito pela Embrapa. | [Embrapa — Consórcio de milho com mucuna](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/255547/1/CT200713.pdf) |
| Milho + Crotalária | ATENCAO | Experimento de campo. Itiquira, MT; arranjos e safras avaliados em 2012/13 e 2013/14. | [Kappes e Zancanaro — Consórcios de crotalárias com milho](https://rbms.sede.embrapa.br/ojs/article/view/615) |
| Gliricídia + Feijão-caupi | ATENCAO | Experimento de campo. Quarto ciclo de cultivo em um experimento no semiárido da Paraíba; presença também de milho. | [Martins et al. (2015) — Nitrogênio fixado por caupi e gliricídia em SAF](https://apct.sede.embrapa.br/pab/pt_BR/article/view/19971) |
| Gliricídia + Milho | ATENCAO | Experimento de campo. Mesmo experimento na Paraíba; efeito do sistema, não antagonismo universal do par. | [Martins et al. (2015) — Nitrogênio fixado por caupi e gliricídia em SAF](https://apct.sede.embrapa.br/pab/pt_BR/article/view/19971) |
| Mandioca + Abacaxi | FAVORAVEL_CONDICIONAL | Experimento de campo. Rio Branco, AC; arranjo e densidades do estudo. | [Embrapa — Produção orgânica de abacaxi e mandioca consorciados](https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/999737/producao-organica-de-abacaxi-e-mandioca-consorciados) |
| Abacaxi + Feijão-caupi | CONSORCIO_DOCUMENTADO | Recomendação técnica. Ficha agroecológica do MAPA. | [MAPA — Ficha agroecológica: cultivo do abacaxi em consórcios](https://www.gov.br/agricultura/pt-br/assuntos/sustentabilidade/organicos/fichas-agroecologicas/arquivos-producao-vegetal/10-cultivo-do-abacaxi-em-consorcios-1.pdf) |
| Mandioca + Feijão-caupi | CONSORCIO_DOCUMENTADO | Recomendação técnica. Recomendação da Embrapa no contexto do Baixo Tocantins. | [Embrapa — O Trio da Produtividade na Cultura da Mandioca](https://cnpma.embrapa.br/boaspraticas/download/Trio_Produtividade_Cultura_Mandioca.pdf) |
| Mandioca + Milho | CONSORCIO_DOCUMENTADO | Recomendação técnica. Contexto da recomendação para mandioca no Baixo Tocantins. | [Embrapa — O Trio da Produtividade na Cultura da Mandioca](https://cnpma.embrapa.br/boaspraticas/download/Trio_Produtividade_Cultura_Mandioca.pdf) |
| Andiroba + Açaizeiro | CONSORCIO_DOCUMENTADO | Registro em SAF. Várzeas amazônicas, incluindo rio Juba, Cametá, PA. | [Embrapa — Espécies Arbóreas Brasileiras, volume 5: Andiroba](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140287/1/Especies-Arboreas-Brasileiras-vol-5-Andiroba.pdf) |
| Bananeira + Pupunheira | FAVORAVEL_CONDICIONAL | Recomendação técnica. Cultivo de pupunha para palmito em áreas sujeitas a ventos fortes. | [Embrapa Florestas — Cultivo da pupunheira para produção de palmito](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1002146/1/2014ApostilaTTPupunha.pdf) |
| Paricá + Cacaueiro | CONSORCIO_DOCUMENTADO | Registro de uso. Uso agroflorestal descrito na monografia da Embrapa. | [Embrapa — Espécies Arbóreas Brasileiras, volume 2: Paricá](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140876/1/Especies-Arboreas-Brasileiras-vol-2-Parica.pdf) |
| Paricá + Milho | CONSORCIO_DOCUMENTADO | Registro de uso. Paragominas, PA; culturas anuais durante a fase inicial. | [Embrapa — Espécies Arbóreas Brasileiras, volume 2: Paricá](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140876/1/Especies-Arboreas-Brasileiras-vol-2-Parica.pdf) |
| Margaridão + Gliricídia | CONSORCIO_DOCUMENTADO | Ficha técnica de espécies. Uso em sistemas de biomassa e forragem; sem ensaio local do par no ybyrá. | [Tropical Forages — Tithonia diversifolia](https://www.tropicalforages.info/text/entities/tithonia_diversifolia.htm) |
| Abacaxi + Milho | ATENCAO | Alerta técnico regional. Recomendação do manual para o Pará; não demonstra incompatibilidade universal nem identifica aqui todos os agentes causais. | [EMATER-PA — Manual técnico: cultivo do abacaxi](https://www.emater.pa.gov.br/storage/app/uploads/public/648/b27/807/648b27807eafd458945489.pdf) |

## Fontes consultadas

| Chave nos dados | Referência | Seção utilizada |
| :--- | :--- | :--- |
| `guandu` | [Tropical Forages — Cajanus cajan](https://www.tropicalforages.info/text/entities/cajanus_cajan.htm) | Ecology; Uses/applications |
| `crotalaria` | [Tropical Forages — Crotalaria juncea](https://www.tropicalforages.info/pdf/crotalaria_juncea.pdf) | Ecology; Uses/applications |
| `canavalia` | [FAO EcoCrop — Canavalia ensiformis](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=609) | Ecology: Optimal e Absolute |
| `mucuna` | [Tropical Forages — Mucuna pruriens](https://www.tropicalforages.info/text/entities/mucuna_pruriens.htm) | Ecology; Toxicity |
| `kew-mucuna` | [Kew POWO — Mucuna aterrima](https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:509138-1) | Sinonímia com Mucuna pruriens var. utilis |
| `gliricidia` | [Tropical Forages — Gliricidia sepium](https://www.tropicalforages.info/text/entities/gliricidia_sepium.htm) | Ecology; Defoliation; Toxicity |
| `caupi` | [Tropical Forages — Vigna unguiculata](https://www.tropicalforages.info/text/entities/vigna_unguiculata.htm) | Ecology; Environment |
| `mandioca` | [Embrapa — O Trio da Produtividade na Cultura da Mandioca](https://cnpma.embrapa.br/boaspraticas/download/Trio_Produtividade_Cultura_Mandioca.pdf) | Módulo técnico: clima, solos e conservação do solo |
| `milho` | [Embrapa — Cultivo do milho: condições climáticas](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/486917/1/Sistema-de-Producao-Cultivo-do-Milho.pdf) | Condições climáticas; germinação e floração |
| `abacaxi` | [Embrapa — Abacaxi: descrição do habitat](https://ainfo.cnptia.embrapa.br/digital/bitstream/item/182432/1/7ddc230c2f7a-Abacaxi-03a.pdf) | Seção 2.5: solo e clima |
| `banana-mamao` | [Embrapa — Zoneamento agrícola para espécies frutíferas tropicais do Centro-Sul de Sergipe](https://www.cpatc.embrapa.br/labgeo/BP_04.pdf) | Tabelas 1 e 2, página impressa 11 |
| `mamao` | [Embrapa — Mamão: recomendações de calagem e adubação](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1134673/1/cap10-livro-RecomendacaoCalagemAdubacao-AnaLuciaBorges-AINFO.pdf) | Clima e solo |
| `acai` | [IDAM — Manejo do açaí (Euterpe oleracea)](https://www.idam.am.gov.br/manejo-do-acai/) | Condições de clima e cultivo |
| `acai-plantio` | [Embrapa Ageitec — Açaí: plantio](https://portaldxp-h.sede.embrapa.br/en/web/agencia-de-informacao-tecnologica/cultivos/acai/producao/plantio) | Estabelecimento de mudas em terra firme e sombreamento inicial |
| `cupuacu` | [Embrapa — Plantas para o Futuro: cupuaçu](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1144579/1/Plantas-para-o-Futuro-Norte-519-542.pdf) | Hábitat e sombreamento na implantação |
| `cacau` | [SENAR / MAPA-CEPLAC — Cacau: produção, manejo e colheita](https://www.gov.br/agricultura/pt-br/assuntos/ceplac/arquivos/cartilhas-senar/215-cacau-producao-manejo-colheita.pdf) | Seções 4.1 e 4.2: sombreamento provisório e definitivo |
| `cacau-clima` | [Revista de Política Agrícola — Condições da cacauicultura](https://rpa.sede.embrapa.br/RPA/article/download/1416/pdf/2912) | Página impressa 112: exigências fisiológicas e solos |
| `pupunha` | [Embrapa Florestas — Pupunha: perguntas e respostas](https://www.embrapa.br/en/web/florestas/pupunha/perguntas-e-respostas) | Perguntas 6, 7, 8 e 12; cultivo para palmito |
| `pupunha-vento` | [Embrapa Florestas — Cultivo da pupunheira para produção de palmito](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1002146/1/2014ApostilaTTPupunha.pdf) | Página impressa 9: clima, solo e quebra-ventos |
| `andiroba` | [Embrapa — Espécies Arbóreas Brasileiras, volume 5: Andiroba](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140287/1/Especies-Arboreas-Brasileiras-vol-5-Andiroba.pdf) | Solos; clima; características silviculturais; SAFs |
| `parica` | [Embrapa — Espécies Arbóreas Brasileiras, volume 2: Paricá](https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/1140876/1/Especies-Arboreas-Brasileiras-vol-2-Parica.pdf) | Clima; solos; associações simbióticas; SAFs |
| `margaridao` | [Tropical Forages — Tithonia diversifolia](https://www.tropicalforages.info/text/entities/tithonia_diversifolia.htm) | Ecology; Companion species; Weed potential; Toxicity |
| `saf-parica` | [Embrapa — SAF com paricá, cupuaçu e banana em Dom Eliseu, PA](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/409311/1/Digitalizar0197.pdf) | Unidade de observação implantada em 2006; composição do sistema |
| `milho-caupi` | [Lima Filho — Respostas fisiológicas do milho e caupi à consorciação](https://apct.sede.embrapa.br/pab/pt_BR/article/view/5875) | Resumo; experimento em Petrolina, PE |
| `gliricidia-caupi` | [Martins et al. (2015) — Nitrogênio fixado por caupi e gliricídia em SAF](https://apct.sede.embrapa.br/pab/pt_BR/article/view/19971) | Resumo; quarto ciclo de cultivo no semiárido da Paraíba |
| `milho-mucuna` | [Embrapa — Consórcio de milho com mucuna](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/255547/1/CT200713.pdf) | Seção 3.1.1: semeadura diferida e competição |
| `milho-crotalaria` | [Kappes e Zancanaro — Consórcios de crotalárias com milho](https://rbms.sede.embrapa.br/ojs/article/view/615) | Resumo; Itiquira, MT, safras 2012/13 e 2013/14 |
| `abacaxi-mandioca` | [Embrapa — Produção orgânica de abacaxi e mandioca consorciados](https://www.embrapa.br/en/busca-de-publicacoes/-/publicacao/999737/producao-organica-de-abacaxi-e-mandioca-consorciados) | Resumo; cultivo orgânico em Rio Branco, AC |
| `abacaxi-consorcio` | [MAPA — Ficha agroecológica: cultivo do abacaxi em consórcios](https://www.gov.br/agricultura/pt-br/assuntos/sustentabilidade/organicos/fichas-agroecologicas/arquivos-producao-vegetal/10-cultivo-do-abacaxi-em-consorcios-1.pdf) | Consórcios com culturas de ciclo curto |
| `abacaxi-milho` | [EMATER-PA — Manual técnico: cultivo do abacaxi](https://www.emater.pa.gov.br/storage/app/uploads/public/648/b27/807/648b27807eafd458945489.pdf) | Seção 8, página impressa 19: cuidados fitossanitários em consórcios |
