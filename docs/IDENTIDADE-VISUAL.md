# Identidade visual do Ybyrá — 2.0

Atualizada em 05/11/2026 a partir de `YBYRA2.0 GREEN.jpeg` e `YBYRA2.0.jpeg`, fornecidos pela equipe. Os originais estão em `sistema-agroflorestal/assets/marca/originais/`.

A assinatura combina a escrita desenhada, onze folhas e a base curva. A versão aplicada preserva o JPEG original embutido no SVG: o filtro retira o fundo verde e mantém a geometria da imagem. Não é uma vetorização dos contornos; para impressão em grande formato, prefira solicitar o arquivo vetorial de origem à equipe. As tentativas de extração por Image Gen não foram adotadas porque introduziram artefatos.

| Arquivo em `assets/marca/` | Aplicação |
| --- | --- |
| `logo-negativa.svg` | Letras brancas e folhas verdes, para fundos escuros |
| `logo-positiva.svg` | Variante para fundo claro |
| `logo-monocromatica.svg` | Silhueta em verde profundo |
| `logo-email.png` | Assinatura rasterizada sobre fundo verde para e-mails |
| `favicon.svg` | Recorte do símbolo central do arquivo original fornecido pela equipe |
| `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `favicon.ico` | Ícones do navegador (ICO em 48px) |
| `apple-touch-icon.png`, `icone-192.png`, `icone-512.png` | Atalhos e instalação |
| `copa.svg` | Variação decorativa em folhas, usada na landing e nos ornamentos |

A folha e a copa são variações vetoriais simplificadas, não a assinatura oficial completa. Os arquivos antigos de flor e ramos permanecem como histórico, sem uso nas páginas atuais. As marcas institucionais não foram alteradas.

Paleta da landing: floresta `#24513e`, lima `#aeef7c`, texto `#173d2e`, branco `#ffffff` e fundo de projeto `#c4f29f`. Títulos em Georgia; interface em Segoe UI/Arial. Preserve contraste, proporção e espaço livre ao redor da marca.

Para regenerar os arquivos, instale `sharp` como dependência de desenvolvimento temporária (`npm install --no-save --no-package-lock sharp`) e execute `node scripts/gerar-marca.mjs` na raiz. O site servido não depende dessa biblioteca.

O conceito visual está em [landing-conceito.png](design/landing-conceito.png). Foi gerado com a ferramenta Image Gen integrada, com um briefing de página completa em português, três seções, verde profundo, títulos serifados, fotografia em arco e apresentação do fluxo real de plantas, solo e propostas educativas. O resultado orienta o layout; a marca original, a fotografia já creditada e os textos verificados do projeto prevalecem sobre a imagem conceitual.
