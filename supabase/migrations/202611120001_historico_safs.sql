begin;

create table public.safs (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    id uuid not null,
    criado_em timestamptz not null default now(),
    dados jsonb not null check (
        octet_length(dados::text) <= 16384
        and jsonb_typeof(dados) = 'object'
        and coalesce(jsonb_typeof(dados -> 'analise' -> 'municipio') = 'string', false)
        and coalesce(jsonb_typeof(dados -> 'analise' -> 'estado') = 'string', false)
        and coalesce(jsonb_typeof(dados -> 'proposta' -> 'titulo') = 'string', false)
        and coalesce(jsonb_typeof(dados -> 'meses') = 'number', false)
    ),
    primary key (usuario_id, id)
);

create index safs_historico on public.safs (usuario_id, criado_em desc, id);
alter table public.safs enable row level security;
revoke all on table public.safs from anon, authenticated;
grant select on table public.safs to authenticated;
grant insert (usuario_id, id, dados) on table public.safs to authenticated;

create policy usuario_le_proprios_safs on public.safs
    for select to authenticated using ((select auth.uid()) = usuario_id);
create policy usuario_salva_proprios_safs on public.safs
    for insert to authenticated with check ((select auth.uid()) = usuario_id);

commit;
