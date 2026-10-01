# Raiz — Sistema demonstrativo de recomendação agroflorestal

Projeto SESI FLL 2026. Aplicação estática em **HTML5, CSS3 e JavaScript puro**, implementada a partir de `Especificacao_Codex_SAF_HTML_CSS_JS.docx`.

A identidade visual usa tons de vegetação, solo e neutros, títulos em Georgia e interface em fontes locais, sem downloads. O [conceito visual](docs/conceito-visual.png) foi gerado com a ferramenta imagegen como referência estética. A implementação preserva os requisitos do documento: estratos em HTML/CSS, dados efetivamente cadastrados, três cenários e quatro objetivos. Ilustrações, valores científicos e controles extras sugeridos pelo conceito não foram incorporados.

## Executar

Não é necessário instalar dependências npm. Os módulos ES e o carregamento de JSON precisam de **HTTP**; abrir `index.html` por `file://` pode bloquear o funcionamento.

No Windows, abra o PowerShell na pasta do repositório:

```powershell
powershell -ExecutionPolicy Bypass -File .\servir.ps1
```

Abra **http://localhost:8080**. Encerre com Ctrl+C. Para outra porta, acrescente `-Porta 8090`. O script apenas serve arquivos estáticos na interface local; não é um backend da aplicação.

Alternativas: abra `sistema-agroflorestal/index.html` com Live Server no VS Code ou publique a pasta `sistema-agroflorestal` em qualquer hospedagem estática. Se Python já estiver instalado:

```text
python -m http.server 8080 --directory sistema-agroflorestal
```

## Demonstrar

1. Escolha Solo A, B ou C na página inicial, ou clique em **Começar análise**.
2. Edite os valores, município, estado e um dos quatro objetivos. Condutividade é opcional.
3. Clique em **Analisar e visualizar SAFs**.
4. Leia o diagnóstico e as prioridades; compare as propostas nas abas.
5. Explore os cinco estratos, as três fases e as justificativas. Clique numa espécie do estrato para abrir seus motivos.
6. Consulte o catálogo por nome comum, científico, função e estrato. A página Sobre explica regras, referências e limitações.

Somente `analiseAtual` é persistida no localStorage. A edição recarrega os valores anteriores. Dados ausentes ou corrompidos orientam a iniciar outra análise. O armazenamento precisa estar permitido no navegador. A demonstração não exige internet, sensores, contas, APIs ou banco; apenas os links externos de referência precisam de conexão.

## Organização

```text
sistema-agroflorestal/
  index.html              Apresentação, fluxo e cenários
  analise.html            Formulário e objetivo
  resultado.html          Diagnóstico, SAFs, estratos e fases
  especies.html           Catálogo pesquisável
  sobre.html              Metodologia, fontes e limitações
  css/                    Estilos globais e de cada tela
  js/
    utils.js              JSON, rótulos, validação e persistência
    inicio.js             Cenários
    analise.js            Formulário
    diagnostico.js         Classificação por parâmetro
    recomendacao.js        Filtros, pontos e justificativas
    saf.js                Templates, diversidade e interações
    resultado.js          Apresentação dos resultados
    especies.js           Pesquisa e filtros
  dados/
    cenarios.json         Três cenários fictícios
    faixas-solo.json       Faixas, necessidades e pesos
    especies.json         Catálogo inicial com 18 espécies
    modelos-saf.json       Três modelos e seus papéis
    interacoes.json        Relações documentadas entre pares
  assets/                 Ícone local e pasta de imagens
  testes/                 Testes sem bibliotecas, no navegador
servir.ps1                 Servidor estático opcional para Windows
```

## Regras e limites dos dados

- Os limiares de solo são **demonstrativos**, sem calibração. N/P/K usam unidades arbitrárias, sem equivalência com laudos de laboratório. Não prescrevem adubação.
- A pontuação ordena alternativas: pH 25, temperatura 20, umidade 15, cada necessidade atendida 15, novo estrato 10, sucessão compatível 10, nova função 5. Os pesos estão no JSON, não espalhados pelo algoritmo.
- Limites conhecidos incompatíveis eliminam a espécie. Critérios `null` são ignorados, sem pontos e sem inferir compatibilidade. Esta curadoria não confirma limites numéricos nem restrições regionais; esses campos permanecem `null`.
- Os papéis/estratos/fases do catálogo são simplificações pedagógicas. As fontes da Embrapa sustentam uso e funções gerais, e não uma validação agronômica dos arranjos gerados.
- Cobertura e diversidade são princípios dos modelos, não condições efetivamente medidas. O município e estado contextualizam o resultado; só há exclusão regional quando uma lista de estados for cadastrada com evidência.
- `interacoes.json` começa vazio para não inventar relações. Pares ausentes são **DESCONHECIDA**. O motor respeita registros **EVITAR** e mostra relações cadastradas e desconhecidas.
- Modelos completos não repetem espécies; preferem funções e estratos diversos. A segunda variante pode escolher alternativas empatadas. Catálogo insuficiente mostra uma mensagem em vez de fabricar composições.
- As perenes podem ser implantadas como mudas desde a primeira fase; sua função se consolida posteriormente. Cobertura exige renovação/manejo. Não há simulação ano a ano, altura exata, espaçamento ou previsão de produtividade.

Para cadastrar uma interação confirmada:

```json
{
  "especieA": "id-do-catalogo",
  "especieB": "outro-id-do-catalogo",
  "status": "EVITAR",
  "motivo": "Descrição específica da relação documentada e seu contexto",
  "fonte": { "titulo": "Publicação consultada", "url": "https://..." }
}
```

Inclua os registros em um array. Não use esse exemplo como evidência real.

## Verificar

Com o servidor iniciado, abra **http://localhost:8080/testes/index.html**. Os testes exercitam os cenários, os quatro objetivos, diagnóstico, limites/null, interações EVITAR, falta de catálogo, persistência inválida, preenchimento/submissão do formulário, propostas por mouse e teclado, justificativas, busca, filtros e ausência de overflow nas cinco telas. A análise anterior é restaurada ao terminar.

Para testar responsividade, repita a página de testes em uma janela estreita e percorra as cinco telas. Suporte previsto para navegadores modernos com módulos ES, fetch, localStorage e CSS `:has()`.

As referências completas estão em cada espécie e na página **Sobre**. O resultado é educativo e **não substitui avaliação agronômica**.
