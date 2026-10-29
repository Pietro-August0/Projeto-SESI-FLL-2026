# Publicar o ybyrá na Vercel

O site está publicado em [ybyra-sesi-fll.vercel.app](https://ybyra-sesi-fll.vercel.app), com o projeto Supabase `ybyra-sesi-fll` na região de São Paulo e SMTP Brevo configurado. As instruções abaixo documentam a configuração e permitem reproduzi-la. A aplicação não cria serviços nem aplica SQL automaticamente.

## Serviços

| Serviço | Função |
| --- | --- |
| Vercel | Executar a função Python e entregar as páginas protegidas. |
| Supabase Free | PostgreSQL, cadastro, senhas, confirmação e sessões. |
| Brevo Free | Entregar os e-mails transacionais por SMTP, até 300 envios/dia no plano consultado em 29/10/2026. |

O limite da Brevo é compartilhado com os outros envios da conta. Planos gratuitos têm cotas e condições próprias; a gratuidade não inclui a compra de um domínio. O site pode usar o endereço gratuito da Vercel. Para o remetente de e-mail, a configuração recomendada é um domínio que a equipe controle e autentique na Brevo; `vercel.app` não permite configurar o DNS de um remetente próprio.

Sem domínio próprio por enquanto, use um endereço existente verificado em **Senders / Remetentes**. A Brevo informa que pode substituir o domínio do remetente por um endereço `brevosend.com` para viabilizar a entrega; essa alternativa é temporária e precisa de teste real. Não tente autenticar `gmail.com` nem `vercel.app`, pois não são domínios da equipe. Conclua também a verificação do telefone e eventuais requisitos de ativação da conta antes de testar o envio.

## 1. Criar o banco no Supabase

1. Crie um projeto em [Supabase](https://supabase.com/dashboard), no plano Free. Guarde a senha do banco no seu gerenciador de senhas.
2. Abra o **SQL Editor** e execute `supabase/migrations/202610290001_contas.sql`.
3. A autenticação usa a tabela gerenciada `auth.users`: não crie uma tabela de senhas. O script cria `public.perfis`, relaciona cada perfil à conta e ativa Row Level Security. Uma pessoa autenticada só pode consultar o próprio perfil; visitantes não podem consultar perfis. O gatilho cria o perfil automaticamente.
4. Copie a **Project URL** e a **Publishable key** do painel de API do projeto. A chave legada `anon` também funciona neste campo. A integração não precisa da senha do PostgreSQL nem de `service_role` ou secret key.
5. Em **Authentication**, habilite o provedor **Email**, permita cadastros e mantenha **Confirm email** ativado. Use senha mínima de 12 caracteres. As contas do protótipo SQLite não são transferidas; os participantes devem se cadastrar novamente e confirmar a posse do e-mail.

O banco contém as contas e seus perfis. As análises e propostas continuam no navegador, sem histórico permanente por usuário.

## 2. Configurar o e-mail gratuito

1. Crie uma conta Free na [Brevo](https://www.brevo.com/). Conclua a validação da conta e a ativação do envio transacional.
2. Adicione e valide o remetente. Com domínio próprio, publique os registros de autenticação solicitados pela Brevo no provedor DNS. Sem domínio, use o endereço existente verificado e as condições temporárias descritas acima.
3. Em **SMTP & API**, copie o login SMTP e gere uma **chave SMTP**. Essa chave é diferente da senha da conta e de uma chave da API.
4. No Supabase, em **Authentication → Emails / SMTP settings**, habilite o SMTP personalizado e preencha:

| Campo | Valor |
| --- | --- |
| Host | `smtp-relay.brevo.com` |
| Porta | `587` |
| Usuário | O login SMTP informado pela Brevo |
| Senha | A chave SMTP gerada na Brevo |
| E-mail remetente | O endereço validado na Brevo |
| Nome remetente | `ybyrá` |

5. Se o plano permitir, desative o rastreamento de cliques nesses e-mails. O plano gratuito consultado oferece apenas rastreamento anônimo, que também reescreve os links. Por isso o template inclui um código numérico para confirmar a conta sem depender do link reescrito. O projeto criado usa códigos de oito dígitos; a aplicação também aceita códigos de seis dígitos de outros projetos Supabase.
6. Em **Authentication → Email Templates → Confirm signup**, copie o conteúdo de `supabase/templates/confirmacao.html` e use o assunto `Seu código de confirmação — ybyrá`.

O template é parte necessária da integração. A pessoa informa o código recebido na opção aba **Confirmar e-mail**. O botão do e-mail abre diretamente essa aba (`/conta.html?etapa=confirmar`), sem transportar o código ou um token na URL, evitando perder a confirmação na reescrita de links da Brevo. O código funciona mesmo em outro navegador e só pode ser usado uma vez. Depois, a pessoa entra com e-mail e senha. O servidor também aceita links com `#token_hash=...` para compatibilidade com templates de outros provedores, mas o template da Brevo usa códigos.

O SMTP padrão do Supabase restringe destinatários a membros autorizados do projeto e não atende ao cadastro público. Configure o SMTP personalizado antes de abrir o site ao público.

## 3. Configurar a Vercel

1. Importe o repositório na Vercel. Use **Framework Preset: Other**, **Root Directory: raiz do repositório**, sem Build Command e sem Output Directory personalizados. Não use `sistema-agroflorestal` como raiz ou saída estática: a autorização é feita pela função Python.
2. Em **Settings → Environment Variables**, configure:

| Nome | Exemplo |
| --- | --- |
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | A chave publishable do projeto |
| `YBYRA_ORIGEM` | `https://nome-do-site.vercel.app` |

3. Use a URL pública exata, sem caminho e sem barra final. Configure as variáveis para **Production**. Se testar em **Preview**, use a origem exata daquela implantação e, de preferência, um projeto Supabase de teste separado.
4. No Supabase, em **Authentication → URL Configuration**, defina **Site URL** com a mesma origem pública. O template de confirmação usa essa URL. Para testes locais, altere-a apenas no projeto de teste.
5. Faça um deploy ou redeploy para aplicar as variáveis. `vercel.json` usa `routes` para encaminhar todas as rotas a `api/site.py` antes da resolução de arquivos estáticos; a função reutiliza a proteção de páginas, JSON e fotos da equipe. Não substitua essa configuração por uma reescrita com prioridade do sistema de arquivos: isso pode expor arquivos pelo prefixo `/sistema-agroflorestal/`. `.vercelignore` impede o envio do banco local e dos arquivos de ambiente.

Senhas e SMTP ficam no Supabase/Brevo. Nenhuma chave administrativa deve ir para o JavaScript ou para o Git. A sessão usa cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`. O acesso é validado junto ao Supabase, incluindo a confirmação do e-mail. Sem as variáveis obrigatórias, o serviço responde como indisponível e não ativa o SQLite.

As sessões duram até uma hora, limitadas também pela validade do token no Supabase. Ao expirar, a pessoa precisa entrar novamente; não há renovação automática nesta versão. O logout remove o cookie e encerra a sessão no provedor; um token de acesso previamente copiado pode continuar válido até expirar, conforme o funcionamento do Supabase. O servidor não devolve esse token ao JavaScript.

## 4. Validar antes de divulgar

1. Sem estar conectado, abra `/index.html` e `/dados/especies.json`: a primeira rota deve ir para a conta; a segunda deve negar acesso.
2. Cadastre um endereço real de teste. A tela deve pedir confirmação, sem entrar automaticamente. Verifique o recebimento, inclusive na pasta de spam.
3. Tente entrar antes de confirmar: o acesso deve ser negado. Use **Reenviar confirmação** e respeite o intervalo configurado no Supabase.
4. Abra o e-mail, volte ao site e confirme pelo código recebido. Entre com a senha e abra uma página protegida.
5. Reabra o mesmo link e teste um link expirado: ambos devem pedir uma nova confirmação. A expiração e o uso único são controlados pelo Supabase.
6. Saia da conta e confira que a navegação protegida pede login novamente.
7. Confira os logs de entrega da Brevo e os logs de autenticação do Supabase. Revise as cotas e os limites em **Authentication → Rate Limits**; o limitador local em memória não é usado na Vercel. Os limites do provedor valem também para chamadas diretas à API. Se houver abuso, complemente com regras de Firewall na Vercel; CAPTCHA exige integração adicional.

Os testes automatizados do repositório simulam o Supabase: cobrem o contrato HTTP, as restrições de acesso e os estados de erro. Eles não substituem aplicar o SQL, validar o isolamento no banco real, fazer um deploy e testar a entrega efetiva do e-mail.

## Teste local

O protótipo existente continua disponível com `python servidor.py`, usando SQLite e sem envio de e-mail. Para testar o fluxo Supabase, defina as três variáveis de `.env.example` no ambiente do terminal, use `YBYRA_ORIGEM=http://127.0.0.1:8765` e execute:

```sh
python servidor.py --producao
```

O programa não carrega `.env` automaticamente. Configure a Site URL do projeto Supabase de teste para o mesmo endereço local. Não execute o servidor de desenvolvimento para expor o site na internet; o ponto de entrada de produção é a função da Vercel.

## Referências

- [Funções Python na Vercel](https://vercel.com/docs/functions/runtimes/python/api-directory).
- [SMTP personalizado no Supabase](https://supabase.com/docs/guides/auth/auth-smtp).
- [Templates de e-mail e proteção contra pré-leitura de links](https://supabase.com/docs/guides/auth/auth-email-templates).
- [Limites do Supabase Auth](https://supabase.com/docs/guides/auth/rate-limits).
- [SMTP transacional da Brevo](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP).
- [Limites do plano gratuito da Brevo](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan).
- [Remetente temporário sem domínio autenticado](https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-Domain-authentication).
