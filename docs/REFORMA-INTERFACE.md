# Reforma da interface — 29/10/2026

## Direção visual e implementação

Conceito escolhido para a implementação (Image Gen integrado):
`C:/Users/pietr/.codex/generated_images/01a18801-06a3-7a70-93a8-46c9b1afca70/exec-87d1521c-0876-4d03-a30e-62d04de9fad1.png`.

A comparação com o navegador foi feita com `view_image`, em 1435 × 1096 (dimensão nativa do conceito) e 390 × 844. Foram inspecionados: hierarquia do título e das ações, tipografia, cores, espaçamentos, tratamento das fotografias, ícones, estados de foco e comportamento no celular. Capturas em `docs/imagens/sobre-nos-v2.png` e `inicio-v2.png`.

A composição segue o conceito: abertura em duas colunas, título com palavra em itálico lilás, foto, faixa de números, galeria e abas. Adaptações intencionais: logotipos oficiais da equipe e instituições; fotos reais fornecidas no lugar das imagens conceituais; legendas acessíveis e controles de ampliação; rodapé funcional; texto completo original em acordeão; “de desafio do robô” corrige a legenda do conceito. Proporções e altura se ajustam às fotografias reais e aos controles. A estrutura e os cinco pontos visuais foram comparados; essas adaptações são deliberadas.

Auditoria de texto da abertura: título e ações mantidos do conceito; texto curto da equipe mantido; nenhuma estatística nova. A legenda da foto é uma adaptação de contexto. O restante do site recebeu introduções menores e divulgação progressiva dos detalhes técnicos.

Paleta: fundo #f6f7f3, texto/floresta #173d32, ação #245b43, lilás #765888, superfície lilás #eee8f2 e superfície verde #e9efe5. Ícones de contorno coerentes. Entrada e revelação ao rolar usam transform/opacity; transições de foco, seleção e hover distinguem as ações. `prefers-reduced-motion` remove as animações.

## shadcn/ui

Componentes reais instalados pelo CLI `@shadcn` (base Radix), em `frontend/src/components/ui`. About usa Button, Dialog, Accordion e Tabs. Ícones Lucide. Tokens semânticos compartilhados com o site. Não há Tailwind preflight global, para preservar os controles existentes. O pacote React só é carregado no Sobre nós.

Para reconstruir:

```powershell
npm ci --prefix frontend
npm run check --prefix frontend
npm run build --prefix frontend
```

O build gera `sistema-agroflorestal/ui/interface.js` e `interface.css`. Esses arquivos compilados entram na publicação Python existente. Login, confirmação por e-mail e regras do banco não foram alterados.

## Evidência de validação

- Browser plugin not available; usado Playwright com Chrome headless, conforme a skill de testes.
- 38 testes Python aprovados; 7 testes de desenvolvimento das plantas aprovados; TypeScript e build aprovados.
- Seis páginas em desktop e celular: Sobre nós, início, análise, plantas, metodologia e conta; sem transbordamento horizontal.
- Galeria com nove registros, avançar/voltar, Escape e restauração do foco; abas; história completa; metodologia expansível; busca por banana e nomes do inventário.
- Entrada animada e revelação ao rolar verificadas, além de movimento reduzido.
- Cenário → três etapas → proposta → representação do crescimento, inclusive em celular.
- Cadastro, senha curta, confirmação diferente, código, copiar/colar, reenvio, erro de login e indisponibilidade revalidados na interface com respostas controladas.
- Sem erros JavaScript relevantes nas interações verificadas.

As fotos de origem permanecem intactas nos assets. Cópias WebP otimizadas estão em `assets/equipe/`, protegidas pela autenticação. Os arquivos WhatsApp soltos e as miniaturas antigas sem uso não são incluídos nesta publicação.

Publicação confirmada: `dpl_4rYfg4BpkgHzJVZE1rrD4veCSj9i`. Verificação HTTP das rotas, hashes do JavaScript/CSS publicados e proteção dos arquivos.

## Ajuste da abertura, carrossel e rodapé

O início usa agora uma fotografia natural de floresta com o texto e as ações existentes. Há WebPs de 1920 e 900 pixels, com `picture` responsivo e prioridade de carregamento na abertura. Fonte e licença estão em CREDITOS-IMAGENS.md. O bloco de crescimento foi movido para baixo da abertura e recebe a revelação por IntersectionObserver, respeitando movimento reduzido.

O álbum usa o Carousel real do shadcn/ui com Embla, tanto no início quanto no Sobre nós. São nove registros, navegação manual por setas, teclado e arraste, sem reprodução automática. A ampliação conserva Escape, navegação entre imagens e retorno do foco à foto de origem.

O rodapé passou a ter quatro marcas alinhadas, sem as legendas Instituições/Nossa participação/Parceiro de pesquisa. Os arquivos de marca originais permanecem intactos. O FLL é enquadrado por CSS para evitar as margens brancas excessivas; Taiobas usa o símbolo fornecido e o nome legível em texto.

Validação local: Playwright/Chrome (Browser plugin não disponível), em 1440 × 1000 e 390 × 844. Passaram: texto preservado; fotografia responsiva; crescimento abaixo e centralizado; entrada ao rolar; movimento reduzido; nove slides; setas, teclado e arraste; ampliação, Escape e foco; marcas sem legendas; início e Sobre nós sem transbordamento; controles do crescimento. Sem erros JavaScript. TypeScript e build aprovados. Evidências em docs/imagens/inicio-natural.png, inicio-natural-mobile.png e logos-rodape.png.

Publicação deste ajuste confirmada: `dpl_2LtVhEjZXnHPrLBy8heMctpNb4db`. JavaScript, CSS e foto publicados conferidos por SHA-1; rotas protegidas mantidas. Rodapé também validado em 320 e 768 pixels.

A organização posterior removeu as fontes intermediárias sem consumidores e moveu o inventário original. Consulte [Guia técnico](GUIA-TECNICO.md) para distinguir esses ajustes dos registros históricos acima.
