# Validação de acesso — 29/10/2026

Publicação: https://ybyra-sesi-fll.vercel.app
Deployment: dpl_ChtGLwh8NaYZQ3SUkT3XMzHeGtwf

- 38 testes Python aprovados (`python -m unittest discover -s tests -q`).
- Chrome: criação de senha curta rejeitada, confirmação diferente rejeitada, orientação de força, aba exclusiva de código, retomada após recarregar, reenvio com intervalo, código expirado, zeros à esquerda, copiar/colar, login incorreto, e-mail pendente, senha antiga e indisponibilidade do serviço. Sem erros JavaScript nos cenários.
- Sobre nós verificado em 1366 × 1000 e 390 × 844: texto da equipe, nove miniaturas e ausência de transbordamento horizontal.
- Produção: cadastro real com 202 sem sessão; login antes da confirmação bloqueado; e-mail recebido no Gmail com instruções da nova aba e logotipos; código confirmado; senha incorreta rejeitada; login válido com cookie Secure/HttpOnly; página e foto protegidas acessíveis depois de entrar; logout; reutilização do código rejeitada.
- Arquivos Python e caminhos internos da implantação retornaram 404; fotos da equipe exigem autenticação.

O acesso usa senha e confirmação inicial do e-mail. Nenhum segundo fator adicional foi implantado. Novas senhas exigem pelo menos 12 caracteres; senhas antigas continuam válidas para login. As miniaturas recebidas são de baixa resolução e foram preservadas sem ampliação.
