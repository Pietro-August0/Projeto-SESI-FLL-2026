<div align="center">

![ybyrá — Ideias que criam raízes](docs/imagens/capa-ybyra.svg)

**Um apoio digital ao trabalho da equipe na FIRST LEGO League sobre sistemas agroflorestais.**

[Conheça o projeto](#o-projeto) · [Veja a experiência](#a-experiência-em-imagens) · [Execute localmente](#executar-localmente) · [Guia técnico](docs/GUIA-TECNICO.md)

![HTML5](https://img.shields.io/badge/HTML5-39434A?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-8E699C?logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-39434A?logo=javascript&logoColor=72FFB0)
![Python](https://img.shields.io/badge/Python-2F905D?logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-39434A?logo=sqlite&logoColor=white)

</div>

## O projeto

O **ybyrá** foi criado para complementar o trabalho da equipe na **FIRST LEGO League** sobre **Sistemas Agroflorestais (SAFs)**. Ele reúne informações sobre plantas, organiza propostas de composição agroflorestal e representa suas fases visualmente, apoiando a exploração e a apresentação das ideias do time.

A experiência parte de uma pergunta: **como transformar informações sobre o solo e as funções das plantas em uma proposta de SAF que possa ser explorada e explicada?** O usuário informa um cenário, consulta sugestões e vê os motivos de cada escolha. O catálogo e as referências permitem continuar a investigação.

O foco é o projeto de agrofloresta da equipe. A programação é o meio usado para construir essa ferramenta; o ensino de computação não é o objetivo central do produto.

> **Protótipo em evolução.** As propostas usam regras demonstrativas, com limites explícitos. Não constituem um planejamento agronômico validado nem substituem avaliação técnica de campo.

## Do cenário à proposta

| Etapa | O que acontece |
| :--- | :--- |
| **01 · Acessar** | Criar uma conta com e-mail e senha e entrar no sistema. |
| **02 · Informar** | Experimentar um cenário fictício ou preencher localização, condições do solo e objetivo em três etapas. |
| **03 · Explorar** | Consultar propostas, espécies, funções e explicações sobre as escolhas. |
| **04 · Visualizar** | Percorrer uma representação das fases do SAF, com plantas e raízes. |
| **05 · Investigar** | Explorar o catálogo de 18 espécies, suas fichas e as fontes consultadas. |

```mermaid
flowchart LR
    A[Conta e acesso] --> B[Cenário e objetivo]
    B --> C[Leitura demonstrativa do solo]
    C --> D[Propostas com justificativas]
    D --> E[Fases ilustradas do SAF]
    D --> F[Catálogo e referências]
```

A representação das fases nasceu de um protótipo criado por um integrante da equipe. A cena agora usa desenhos próprios para as 18 espécies, com folhas, ramos, frutos e raízes característicos. É possível selecionar cada planta, percorrer as fases, reproduzir, pausar, recomeçar, ajustar a velocidade e ocultar as raízes. Culturas iniciais encerram seu ciclo no arranjo, enquanto coberturas de ciclo curto são representadas por novas plantas a cada renovação.

A sequência ajuda a visualizar a organização do sistema, sem prever tempo real de crescimento, produtividade ou recuperação de nutrientes. As formas são estilizadas e os ritmos são parâmetros de ilustração.

## A experiência em imagens

Capturas reais da aplicação local. As telas protegidas foram registradas com uma conta temporária de demonstração.

| Entrada e cadastro | Início e orientação |
| :---: | :---: |
| ![Página de acesso com identidade ecológica](docs/imagens/acesso.png) | ![Início com caminhos para criar uma proposta de SAF](docs/imagens/inicio.png) |
| Acesso obrigatório com e-mail e senha. | Um caminho para experimentar ou informar os próprios dados. |

| Propostas agroflorestais | Catálogo de plantas |
| :---: | :---: |
| ![Resultado com propostas e representação das fases](docs/imagens/proposta.png) | ![Catálogo com fichas de espécies e filtros](docs/imagens/plantas.png) |
| Composições acompanhadas de motivos e limites. | Espécies, funções, imagens e referências para consulta. |

<details>
<summary><strong>Ver a página do projeto e da equipe</strong></summary>

![Página O projeto, com a história e fotografias da equipe](docs/imagens/equipe.png)

</details>

## Uma identidade construída com o time

O nome **ybyrá** foi escolhido pela equipe pela associação com árvore em tupi-guarani. A logo oficial enviada pela equipe combina a escrita desenhada de **ybyrá**, a flor de **manacá-da-serra** e ramos com folhas que envolvem as letras. O desenho foi preservado em versões vetoriais para fundos claros e escuros; os mesmos ramos aparecem no cabeçalho, no rodapé e nas peças de apresentação.

| Roxo | Magenta | Cinza | Menta | Verde |
| :---: | :---: | :---: | :---: | :---: |
| `#8E699C` | `#D543F9` | `#39434A` | `#72FFB0` | `#2F905D` |

As ideias do time aparecem na navegação, no catálogo com imagens, na representação do SAF crescendo e na página que apresenta o projeto. O cabeçalho e o rodapé foram inspirados no modelo visual enviado por uma aluna.

A marca usa verde `#26533E` e roxo `#A76FBD`, extraídos da ilustração. A paleta acima continua nos controles e destaques da interface.

[Manual e arquivos da identidade](docs/IDENTIDADE-VISUAL.md) · [Logo para fundo claro](sistema-agroflorestal/assets/marca/logo-positiva.svg) · [Logo para fundo escuro](sistema-agroflorestal/assets/marca/logo-negativa.svg) · [Veja a página do projeto](sistema-agroflorestal/historia.html)

## Como funciona

| Parte | Tecnologia | Responsabilidade |
| :--- | :--- | :--- |
| Interface | HTML, CSS e JavaScript | Páginas, formulário, catálogo e ilustração das fases. |
| Propostas | JavaScript e arquivos JSON | Aplicação de regras locais e explicação dos resultados. |
| Acesso | Python, biblioteca padrão | Cadastro, login, sessões e proteção das páginas e dados. |
| Contas | SQLite | E-mail, hashes de senha e sessões em banco local. |

A análise é processada no navegador. O servidor cuida do acesso e entrega os arquivos protegidos. Não há dependência de serviços externos para gerar propostas; as imagens do catálogo são locais e os links de referência exigem internet.

### O que já está disponível

- Cadastro, login, logout e navegação protegida por sessão.
- Formulário em etapas, cenários demonstrativos e guia de uso.
- Propostas com justificativas e representação ilustrativa das fases.
- Catálogo de 18 espécies com imagens locais, 43 referências numéricas de cultivo e consulta a 20 pares de interação, com fontes e contexto.
- Identidade ybyrá, layout responsivo e página da equipe.

**Ainda não implementados:** perfil editável, modos de tema e histórico de projetos por usuário. A análise atual fica no navegador e é removida ao entrar ou sair da conta; ela não funciona como histórico permanente.

### O que os resultados significam

Os cenários e limiares de solo são demonstrativos. N, P e K usam unidades arbitrárias, sem equivalência com um laudo de laboratório. Dados desconhecidos permanecem ausentes; a falta de um registro não comprova compatibilidade entre espécies. As propostas não definem espaçamento, densidade ou manejo e não confirmam adequação regional.

A curadoria reúne 30 fontes técnicas e científicas, incluindo Embrapa, FAO e Tropical Forages, acessíveis nas fichas e na [metodologia e fontes](sistema-agroflorestal/sobre.html). As 43 referências numéricas distinguem condições ótimas, ocorrência natural e limites descritos. Temperatura do ar, chuva e umidade atmosférica não são convertidas em medidas do solo nem usadas como exclusões automáticas.

[Veja os critérios, as lacunas e as fontes da pesquisa ampliada](docs/PESQUISA-CATALOGO.md).

## Executar localmente

### Publicação na Vercel

**Site publicado:** [ybyra-sesi-fll.vercel.app](https://ybyra-sesi-fll.vercel.app). O cadastro exige confirmação pelo código enviado ao e-mail.

A integração de produção usa **Supabase (PostgreSQL + autenticação)** e **Brevo (SMTP)** para cadastro com confirmação por e-mail. O código inclui o esquema SQL, o template de confirmação, login por cookie HttpOnly e reenvio do e-mail. Os serviços foram configurados e validados na publicação acima. Para reproduzir a configuração, siga o [guia de produção](docs/PRODUCAO.md); o repositório não cria serviços remotos automaticamente.

### Protótipo local

**Requisito:** Python 3.10 ou mais recente. Não é necessário instalar pacotes Python ou usar Node.js.

Na pasta do repositório:

```sh
python servidor.py
```

No Windows, se o comando disponível for o inicializador Python, use `py servidor.py`.

Abra [ybyrá no navegador](http://127.0.0.1:8765), escolha **Criar conta** e informe e-mail e senha de pelo menos oito caracteres. Depois, experimente um dos cenários pela página inicial. Para encerrar o servidor, use `Ctrl+C` no terminal.

**Por que um servidor se as páginas são HTML?** O HTML apresenta as telas. O servidor verifica quem está conectado, cadastra contas e protege as páginas e os dados. Abrir o HTML com duplo clique ou usar um servidor estático não executa essa autenticação.

O banco é criado em `.dados-locais/ybyra.sqlite3`, fora da pasta pública e ignorado pelo Git. Esta versão não envia confirmação ou recuperação de senha por e-mail. O servidor foi preparado para testes locais; publicação exige configuração apropriada de HTTPS e autenticação.

[Detalhes de contas, segurança, edição e testes →](docs/GUIA-TECNICO.md)

## Estrutura do repositório

```text
Projeto-SESI-FLL-2026/
├── README.md                     # Apresentação do projeto
├── servidor.py                   # Servidor local e autenticação
├── docs/
│   ├── GUIA-TECNICO.md            # Execução, dados, créditos e manutenção
│   └── imagens/                  # Capa e capturas da aplicação
├── sistema-agroflorestal/
│   ├── *.html                    # Páginas do sistema
│   ├── assets/                   # Marca, ícones, fotos e ilustrações
│   ├── css/                      # Estilos e identidade visual
│   ├── dados/                    # Espécies, cenários e regras em JSON
│   └── js/                       # Interações e geração das propostas
└── tests/                        # Testes da autenticação e proteção de rotas
```

## Autoria e referências visuais

O ybyrá incorpora ideias, desenhos e protótipos enviados pela equipe para complementar seu trabalho na FIRST LEGO League. As fotografias da equipe foram fornecidas pelo próprio time. A imagem de natureza da tela de entrada foi gerada e é identificada como ilustrativa. As imagens licenciadas do catálogo são locais e têm créditos nas fichas; o paricá aparece em uma fotografia da árvore viva em floração, com autoria e licença indicadas.

[Créditos de todas as imagens botânicas](docs/CREDITOS-IMAGENS.md).

[Créditos e referências completos](docs/GUIA-TECNICO.md#identidade-imagens-e-autoria) · [Projeto de referência para a apresentação deste README: Vaggu](https://github.com/Pietro-August0/Vaggu)

### Cadastro em produção

Na Vercel, o cadastro exige senha com pelo menos 12 caracteres e confirmação do e-mail. A tela oferece orientação de senha, confirmação da senha e uma aba separada para inserir, colar ou copiar o código, com reenvio após intervalo. Após confirmar, a pessoa entra com e-mail e senha. Não há segundo fator adicional. A versão local SQLite continua sem envio de e-mail.

A página **Sobre nós** apresenta os Jumpers, o texto fornecido pela equipe e nove imagens adicionais em um álbum compacto, preservando a resolução das miniaturas recebidas.
