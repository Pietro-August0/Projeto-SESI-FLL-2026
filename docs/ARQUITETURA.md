# Arquitetura e mapa de manutenção

## Fluxos

O navegador solicita uma página ao servidor Python. No modo local, `servidor.py` verifica uma sessão SQLite; na Vercel, `api/site.py` usa `auth_producao.py` para verificar o acesso via Supabase. O caminho resolvido deve permanecer dentro da pasta pública e passar pela lista de extensões permitidas. HTML protegido redireciona ao login; dados e fotografias protegidos retornam erro sem sessão.

A aplicação web usa arquivos locais de pesquisa, interpreta o cenário e monta as propostas no navegador. A análise atual é estado do navegador, não um histórico salvo na conta.

## Módulos do navegador

| Arquivo em `js/`                             | Responsabilidade                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `sessao.js`                                  | Consultar acesso, enviar operações de conta, sair e resolver o destino após login |
| `utils.js`                                   | Validar acesso, carregar dados, escapar HTML e compartilhar rótulos e utilitários |
| `conta.js`                                   | Entrar, criar senha e confirmar e-mail, incluindo reenvio e estados de erro       |
| `guia.js`                                    | Guia de uso e indicação do percurso                                               |
| `interacoes.js`                              | Ícones complementares e revelação progressiva respeitando movimento reduzido      |
| `inicio.js`                                  | Cenários demonstrativos e montagem do crescimento inicial                         |
| `analise.js`                                 | Formulário guiado, validação, revisão e armazenamento da análise                  |
| `diagnostico.js`                             | Interpretar faixas demonstrativas do cenário                                      |
| `recomendacao.js`, `saf.js`                  | Selecionar espécies e compor propostas com motivos e limites                      |
| `resultado.js`                               | Apresentar diagnóstico, propostas e ações de exploração                           |
| `especies.js`, `conteudo-catalogo.js`        | Busca, filtros, fichas, relações e referências da curadoria                       |
| `crescimento.js`                             | Controlar fases, reprodução, inspeção e interação com a paisagem                  |
| `evolucao-plantas.js`, `desenhos-plantas.js` | Estado ilustrativo e geometria própria das plantas e raízes                       |

## Componentes React

`frontend/src/main.tsx` monta ilhas nos elementos `data-ui-about` e `data-ui-carousel`. `about.tsx` apresenta a equipe e usa as abas e o acordeão; `photo-carousel.tsx` compartilha o álbum entre início e Sobre nós. Os componentes em `components/ui/` são fontes shadcn/ui com Radix, Embla e Lucide. O diálogo restaura o foco à fotografia que o abriu; o álbum não usa autoplay.

Vite compila as ilhas para `sistema-agroflorestal/ui/`. Tailwind não aplica preflight global, evitando alterar o reset dos formulários existentes. Os tokens da interface ficam em `css/experiencia.css`, enquanto `frontend/src/ui.css` integra esses tokens aos componentes.

## Dados e evidências

`dados/especies.json` contém 79 registros. Apenas 18 espécies têm representação ilustrativa e participam do modelo demonstrativo. `cultivo.json`, `referencias.json`, `interacoes.json` e créditos mantêm contexto, proveniência e lacunas. Dados de consulta não devem se tornar exclusões automáticas sem equivalência validada com os parâmetros de entrada.

O documento de sementes está em `docs/fontes/`; seu caminho é registrado em `docs/INVENTARIO-ORIGINAL-TAIOBAS.json`. Os testes leem esse caminho para conferir a transcrição, preservando os nomes históricos dos registros.

## Persistência e implantação

SQLite de desenvolvimento fica em `.dados-locais/`, ignorado pelo Git. Produção usa Supabase Auth e PostgreSQL com políticas de acesso, com a migração em `supabase/migrations/`. Brevo fornece SMTP; o template em `supabase/templates/` usa código de confirmação.

`vercel.json` deve encaminhar todas as rotas ao adaptador Python. Um deploy estático ignora a autenticação. O guia de produção detalha cookies, configuração, limites e validação. Alterações de templates ou serviços remotos exigem configuração do provedor; apenas editar o arquivo local não modifica o painel remoto.
