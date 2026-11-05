# Validação da landing e da marca — 05/11/2026

Implementação local, ainda não publicada. Conceito gerado por Image Gen integrado: [landing-conceito.png](landing-conceito.png). Capturas reais pelo navegador IAB: [desktop](landing-desktop.png), [largura do conceito](landing-1024.png), [celular](landing-mobile.png). Conceito e capturas foram inspecionados com view_image.

## Comparação visual

| Ponto | Referência e resultado |
| --- | --- |
| Estrutura | Abertura dividida, três etapas editoriais, faixa do projeto e rodapé preservados. |
| Texto inicial | Título, descrição, navegação e rótulos dos CTAs conferidos, sem acréscimos de promessas ou números. |
| Tipografia | Títulos serifados e corpo sem serifa; escalas adaptadas ao layout real, com peso mais leve que o conceito. |
| Cores | Verde profundo, branco e lima; faixa inferior suavizada para legibilidade. |
| Fotografia | Arco preservado; substituição intencional pela fotografia existente e creditada no repositório. |
| Marca | Logo original enviada substitui a assinatura inventada pelo conceito. Folhas simplificadas substituem a ilustração genérica da seção final. |
| Conteúdo das etapas | Texto ajustado às ferramentas existentes, sem prometer entradas de clima ou área que o conceito sugeria. |
| Responsividade | Desktop 1440×1000, tamanho do conceito 1024×1536, celulares 390×844 e 320×740; nenhuma rolagem horizontal. O breakpoint foi ampliado para 760px após revisão. |
| Movimento | Entrada suave e revelação por rolagem; CSS e JS respeitam prefers-reduced-motion. |

A direção visual foi conferida contra o conceito, com as diferenças intencionais acima. Não é uma reprodução pixel a pixel. Não ficaram cortes, imagens quebradas ou transbordamentos observados. O menu mobile foi testado por clique, Escape e navegação para seção. O CTA abriu `/conta.html?proximo=explorar.html`. Console da landing sem erros registrados. As dimensões de logo no cabeçalho, rodapé e template de e-mail foram ajustadas à nova proporção.

## Verificações técnicas

- 39 testes Python da suíte passaram; em seguida, o novo teste de landing pública na produção passou (total atual: 40).
- Sete testes Node do crescimento passaram.
- Testes de sessão migrados para `/explorar.html`, mantendo a verificação de bloqueio real.
- A landing pública é resolvida pelo mesmo servidor local e handler de produção; teste comprova que não consulta o provedor de autenticação.
- Dados e fotos da equipe continuam protegidos; a landing usa apenas assets públicos.
- `git diff --check` sem erros de whitespace.

A assinatura SVG incorpora o JPEG original e usa filtros; não é um vetor de contornos para impressão. As variantes positiva, negativa e monocromática foram rasterizadas e inspecionadas separadamente. As duas tentativas de extração generativa foram descartadas por artefatos, preservando o original fornecido pelo usuário.


## Revisão solicitada pelo usuário — 05/11/2026

Esta revisão substitui as decisões anteriores de hero dividida e restrição geral por login. A fotografia agora cobre toda a hero, com contraste escuro sob o texto, e o verde sólido da abertura ficou na navbar. O menu mobile era recortado pelo `overflow: hidden` do ancestral; o recorte foi removido e a navbar passou a ter sua própria camada acima da hero. O rodapé inclui SESI, FIESP, FIRST LEGO League e Taiobas do Matão.

O CTA da seção de projeto agora aponta para `historia.html` (Sobre nós). Sobre nós, metodologia, catálogo, demonstração, dados de consulta e fotos estão públicos. Somente criador (`analise.html`) e resultado (`resultado.html`) exigem sessão, tanto no servidor quanto no cliente. A restauração pelo histórico não deve redirecionar páginas públicas. As 40 verificações Python passaram. No IAB, Sobre nós carregou sem sessão, sem imagens quebradas; catálogo apresentou os 79 registros; Criar SAF redirecionou para conta preservando `proximo=analise.html`.
