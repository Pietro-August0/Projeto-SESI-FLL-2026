# Guia técnico do ybyrá

![ybyrá](imagens/assinatura-ybyra.svg)

[Identidade visual](IDENTIDADE-VISUAL.md) · [Apresentação do projeto](../README.md)


Aplicação de apoio ao trabalho da equipe na FIRST LEGO League sobre sistemas agroflorestais. Usa HTML, CSS e JavaScript, com um servidor Python para contas e
sessões. As páginas ficam em `sistema-agroflorestal/`. Não é preciso instalar pacotes.

## Executar com login obrigatório

Use Python 3.10 ou mais recente. Na pasta deste repositório, execute:

```sh
python servidor.py
```

Abra `http://127.0.0.1:8765`. Escolha **Criar conta**, informe e-mail e senha com pelo
menos 12 caracteres e confirme a senha. O cadastro abre uma sessão imediatamente.
O e-mail é um identificador de acesso: esta versão local não envia confirmação ou
recuperação de senha por e-mail.

Todas as páginas do sistema, os JSONs do catálogo e as fotos da equipe exigem uma
sessão válida. A página de conta, os estilos e os recursos visuais usados no login
são públicos. Um link direto para uma página protegida leva ao login e volta ao
endereço escolhido após a entrada. **Minha conta → Sair da conta** encerra a sessão.

Use o servidor deste projeto. `python -m http.server`, abrir o HTML por duplo clique
ou publicar somente os arquivos estáticos não aplica as regras de autenticação.

## Contas e armazenamento

As características abaixo descrevem o protótipo SQLite. A publicação na Vercel usa Supabase, confirmação por e-mail via SMTP Brevo e sessões de até uma hora. Consulte o [guia de produção](PRODUCAO.md) para o esquema do banco, as variáveis e a configuração dos serviços.

- Banco SQLite: `.dados-locais/ybyra.sqlite3`, criado ao iniciar, fora da pasta
  pública e ignorado pelo Git. Não é servido como arquivo pelo aplicativo.
- Senhas: PBKDF2-HMAC-SHA256, 600.000 iterações e salt aleatório por conta.
- Sessões: identificadores aleatórios em cookie HttpOnly, SameSite=Lax, com validade
  de oito horas. O banco guarda somente um hash do identificador da sessão.
- O servidor verifica a sessão antes de entregar páginas e dados protegidos.
- Cadastro, entrada e saída exigem requisição da mesma origem. Há limite de
  tentativas para entrada e cadastro. As respostas não são armazenadas em cache.
- Senhas e tokens não são gravados em localStorage, sessionStorage ou logs. A
  análise atual é local ao navegador e é removida ao entrar ou sair de uma conta.
- Os projetos ainda não são salvos por usuário no servidor.

Este é um servidor de desenvolvimento local, vinculado a `127.0.0.1`. Uma publicação
precisa de HTTPS e servidor de aplicação apropriado, preservando a autenticação das
rotas. `YBYRA_ORIGEM` permite configurar a origem HTTPS e `YBYRA_COOKIE_SECURE=1`
ativa o atributo Secure do cookie nesse ambiente. Não substitua este servidor por
hospedagem estática para uma publicação que exija autenticação.

Referências técnicas: [OWASP — Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
e [Python — HTTP server](https://docs.python.org/3/library/http.server.html).

## Navegação e primeiro uso

O caminho principal é **Começar → Informar dados → Explorar SAF**. Depois do login,
**Experimentar um exemplo** abre o formulário preenchido. **Preencher meus dados**
começa do zero. O botão **Como usar** abre um guia de três passos, com fechamento por
Escape e retorno de foco ao botão.

O formulário divide localização, solo e objetivo em três etapas. Continuar valida
os campos atuais; Voltar conserva os valores. Antes de gerar, há um resumo. No
resultado, a leitura do solo e as explicações de camadas/fases ficam em seções
expansíveis. Editar dados recupera a análise atual do navegador.

## Onde editar

Os caminhos de páginas, scripts, estilos e recursos abaixo são relativos a `sistema-agroflorestal/`; `servidor.py` fica na raiz do repositório.

- `servidor.py`: contas, sessões e proteção das rotas.
- `js/sessao.js` e `js/conta.js`: acesso pelo navegador e formulários de conta.
- `js/guia.js` e `css/orientacao.css`: guia e orientação de navegação.
- `js/analise.js`: etapas do formulário.
- `js/crescimento.js` e `css/crescimento.css`: cena, seleção de plantas, fases e controles de reprodução.
- `js/desenhos-plantas.js`: geometrias vetoriais das 18 espécies e suas raízes, editáveis sem ferramentas externas.
- `js/evolucao-plantas.js`: ritmos ilustrativos, encerramento de ciclos e renovação da cobertura; esses valores não são taxas agronômicas.
- `historia.html`: apresentação da equipe, fotos e escolhas do projeto.
- `sobre.html`: metodologia e referências.
- `dados/especies.json` e `js/especies.js`: 18 plantas, fontes, busca e fichas. `dados/cultivo.json` reúne as referências de cultivo, `dados/referencias.json` as fontes e `dados/interacoes.json` os pares documentados.
- `css/global.css` e `css/ecologico.css`: paleta, navbar, rodapé e folhagens.

## Identidade, imagens e autoria

A marca combina **ybyrá** com uma flor estilizada de manacá-da-serra. A paleta da
equipe é `#8E699C`, `#D543F9`, `#39434A`, `#72FFB0` e `#2F905D`. A navbar e o
rodapé seguem a referência enviada pela aluna: verde escuro, detalhes roxos e
ramos extraídos da logo oficial fornecida pela equipe. As versões vetoriais positiva, negativa e monocromática, a flor, os ramos e os favicons ficam em `assets/marca/`. O verde `#26533E` e o roxo `#A76FBD` preservam as cores da ilustração. Os caminhos anteriores continuam como compatibilidade.

Veja o [manual da identidade visual](IDENTIDADE-VISUAL.md) para aplicações, arquivos e originais. O servidor entrega `.ico` e `.webmanifest` com seus tipos de conteúdo correspondentes.

As duas fotos originais fornecidas pela equipe estão em `assets/equipe/` e aparecem
na página O projeto, sem alteração dos arquivos. Não foram inferidos nomes de
pessoas, local ou data. O acesso aos arquivos exige login.

`assets/imagens/natureza-manaca.png` foi gerada com a ferramenta integrada de
imagens. É uma imagem ilustrativa, identificada na página de entrada; não é um
registro da visita. Prompt: fotografia ecológica de floresta brasileira, folhas
verdes e ramo com flores roxas de cinco pétalas, luz suave da manhã, paisagem
natural ao fundo, sem pessoas, construções, texto ou marcas.

As 18 fichas têm imagens licenciadas, armazenadas localmente em `assets/plantas/`, com autor, licença, URL de origem e notas nas fichas. O paricá usa uma fotografia de árvore viva de Nereston (Nelinho) Camargo, via iNaturalist/GBIF, sob CC BY-NC 4.0 (uso não comercial). Consulte [todos os créditos](CREDITOS-IMAGENS.md) e os [critérios da pesquisa](PESQUISA-CATALOGO.md). As imagens locais dispensam acesso externo durante a consulta.

Os resumos adicionais usam [Embrapa — SAFs e recuperação](https://www.embrapa.br/en/codigo-florestal/sistemas-agroflorestais-safs).
Descrições e imagens não alteram o cálculo das recomendações. Faixas sem
confirmação continuam ausentes. A ideia da animação veio do modelo HTML criado
por um aluno. As plantas acompanham as fases de cada proposta; a ilustração não
prevê crescimento, produtividade, saúde do solo ou recuperação de nutrientes.

## Testes

```sh
python -m unittest discover -s tests -v
```

Os testes do catálogo verificam cobertura das fichas, fontes, unidades, relações e integridade das imagens. Os testes de autenticação usam bancos temporários, sem contas reais. Verificam bloqueio de rotas,
cadastro, hash de senha, cookies, login, logout, expiração, origem de requisições,
limite de tentativas e arquivos fora da pasta pública.

### Verificar a animação

Os testes da sequência e dos desenhos usam o executor nativo do Node.js, sem instalar pacotes:

```sh
node --test tests/crescimento.test.mjs
```

O comando foi verificado com Node.js 24.19.0. Node.js é necessário apenas para esse teste, não para executar o ybyrá. A verificação cobre as 18 espécies em 101 posições, continuidade das perenes, retirada de culturas iniciais, renovação das coberturas e geometrias diferentes de raízes. No navegador, conferir também reprodução/pausa, seleção, slider por teclado, mudança de proposta e preferência de movimento reduzido.
