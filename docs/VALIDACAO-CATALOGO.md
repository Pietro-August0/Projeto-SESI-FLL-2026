# Validação da ampliação do catálogo

![ybyrá](imagens/assinatura-ybyra.svg)

[Identidade visual](IDENTIDADE-VISUAL.md) · [Apresentação do projeto](../README.md)


Revisão em 22/10/2026.

## Testes automatizados

`python -m unittest discover -s tests -v`: 13 testes aprovados, incluindo 5 de curadoria e 8 de autenticação. Após a revisão final de duas imagens, os 5 testes de curadoria foram executados novamente e passaram.

## Fluxos no navegador

Browser plugin não disponível nesta sessão. Validação realizada com Playwright e Microsoft Edge em modo headless, em servidor temporário com banco e conta exclusivos de teste. O servidor de teste foi encerrado; a instância do usuário foi preservada.

- 18 imagens locais decodificadas e 18 fichas renderizadas
- Consulta de pares: benefício, ordem inversa, atenção, desconhecida e mesma planta
- Busca, filtros, referências numéricas e limpeza
- Link direto abre a ficha; paricá identificado como não fixador; a imagem inicial de herbário foi substituída posteriormente por fotografia da árvore viva
- Desktop 1440 e celular 390 sem rolagem horizontal
- Cálculo dos cenários e nomes legíveis nas interações: [{"id":"solo-a","propostas":3},{"id":"solo-b","propostas":3},{"id":"solo-c","propostas":3}]
- Fluxo cadastro → cenário → proposta → interações → consulta no catálogo

Nenhum erro de JavaScript ou de console foi registrado no fluxo. A inspeção visual das 18 imagens levou à substituição das fotos de guandu e margaridão por registros mais claros, com atualização dos créditos. As novas imagens foram decodificadas no navegador e as capturas do README atualizadas. O texto sobre ausência de faixas validadas para o algoritmo também foi conferido no resultado.

As verificações confirmam integridade dos arquivos e funcionamento dos fluxos; não representam validação agronômica das propostas.
