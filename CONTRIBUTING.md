# Contribuir com o ybyrá

## Preparação

1. Use `python servidor.py` para o modo local, com banco temporário ou conta de desenvolvimento.
2. Instale `npm ci` na raiz para a formatação e `npm ci --prefix frontend` para componentes React.
3. Instale `requirements-dev.txt` somente se precisar formatar Python. O aplicativo não exige pacotes Python externos.

## Onde editar

- HTML, CSS e módulos do site: `sistema-agroflorestal/`.
- React e componentes shadcn/ui: `frontend/src/`. Reconstrua com `npm run ui:build` e versione a saída em `sistema-agroflorestal/ui/`.
- Regras e pesquisa: JSONs em `sistema-agroflorestal/dados/`, com fontes e contexto para cada alteração.
- Contas: `servidor.py` para SQLite e `auth_producao.py` para Supabase. Preserve a proteção do adaptador `api/site.py` e de `vercel.json`.

## Convenções

Use UTF-8, LF, espaços (dois em web/JSON, quatro em Python) e as configurações `.editorconfig`, Prettier e Ruff. Preserve os componentes fornecidos por shadcn, documentando ajustes locais. Comentários devem explicar decisões, limites, segurança e efeitos indiretos; evite descrever novamente cada linha.

Prefira nomes claros em português no domínio e nomes convencionais das bibliotecas nos componentes. Ao renomear arquivos, confira HTML, imports JS/TS, URLs em CSS/JSON, testes e links da documentação. Não altere o nome original registrado em uma fonte histórica só para padronizar um caminho.

## Antes do commit

```sh
npm run format:check
python -m ruff format --check .
npm run ui:check
npm run ui:build
python -m unittest discover -s tests -v
npm test
```

Confira o diff e a navegação em desktop e celular quando alterar interfaces. Exercite teclado, foco, movimento reduzido, cadastro, login e cenário → formulário → proposta. A suíte Python usa dados isolados; não utilize contas reais nos testes automatizados.

Não versione `.env`, bancos, sessões, tokens, `node_modules` ou caches. A chave pública do Supabase não substitui autorização no banco. Nunca exponha uma chave administrativa no navegador. Não registre senha, cookie ou código de confirmação em logs.

## Limpeza de assets

Antes de remover um arquivo, pesquise referências diretas e usos dinâmicos nos JSONs. Logos de entrega, referências históricas, licenças e documentos de pesquisa podem ser necessários mesmo sem aparecer na interface. Registre remoções e migrações relevantes em `docs/ORGANIZACAO.md`.
