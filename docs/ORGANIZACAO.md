# Organização do repositório

## Revisão de 29/10/2026

- Formatação de fontes web, JSON e Markdown pelo Prettier; Python pelo Ruff, com configurações versionadas.
- README reescrito com catálogo de 79 registros, subconjunto de 18 espécies do modelo, senha mínima de 12 caracteres, produção e build React.
- Índice de documentação, arquitetura e guia de contribuição adicionados.
- Documento original do banco movido da raiz para `docs/fontes/banco-sementes-taiobas-2021.docx`; caminho do inventário atualizado para manter a verificação do documento nos testes.
- Removidas nove miniaturas `assets/equipe/jumpers-01.jpg` a `jumpers-09.jpg`, substituídas pelos WebPs ativos.
- Removidos arquivos soltos `assets/WhatsApp*`: fontes intermediárias e duplicatas substituídas pelos assets organizados de equipe e instituições. A versão anterior permanece recuperável no Git.
- Removido `assets/imagens/floresta-luz.jpg`, substituído por WebPs responsivos; fonte e licença preservadas nos créditos.
- Removido `frontend/src/components/ui/badge.tsx`, sem consumidores. Os demais componentes são usados na interface.

## O que foi preservado

Os logotipos em diferentes variantes são entregáveis documentados da identidade. As fotos `equipe-visita.jpg` e `equipe-trilha.jpg` são fixtures reais dos testes de proteção de arquivos; permanecem utilizadas. Capturas antigas e relatórios de pesquisa são evidências históricas, não resíduos de build.

`node_modules`, `.dados-locais`, `.vercel` e `__pycache__` são dependências, dados ou caches locais ignorados pelo Git. Não foram apagados: remover dados de contas ou configurações locais não faz parte de uma limpeza de código. O diretório `sistema-agroflorestal/ui/` é uma saída compilada necessária para executar o servidor sem Node.js e deve ser reconstruído, não editado manualmente.

A revisão organiza o código sem redefinir regras de autenticação, composição ou pesquisa. Comentários preservam explicações de domínio e segurança; foram ajustados pontos de entrada e decisões de foco e montagem React. O documento histórico mantém sua autoria e conteúdo original.

## Verificações da revisão

38 testes Python e sete Node aprovados; TypeScript e build aprovados; Prettier e Ruff sem pendências. Foram conferidos os caminhos HTML/imports e links locais da documentação, a igualdade dos JSONs de pesquisa e a igualdade da árvore sintática Python antes/depois da formatação. O teste visual local em Chrome/Playwright cobriu início, galeria, rodapé, crescimento, teclado, foco e telas móveis, sem erros JavaScript.
