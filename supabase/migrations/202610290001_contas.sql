-- Execute no SQL Editor do projeto Supabase. auth.users é mantida pelo Supabase Auth.
begin;

create table if not exists public.perfis (
    id uuid primary key references auth.users(id) on delete cascade,
    criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;
revoke all on table public.perfis from anon, authenticated;
grant select on table public.perfis to authenticated;

drop policy if exists "usuario_consulta_proprio_perfil" on public.perfis;
create policy "usuario_consulta_proprio_perfil" on public.perfis
    for select to authenticated
    using ((select auth.uid()) = id);

create schema if not exists ybyra_privado;
revoke all on schema ybyra_privado from public, anon, authenticated;

create or replace function ybyra_privado.criar_perfil_ybyra()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.perfis (id) values (new.id) on conflict (id) do nothing;
    return new;
end;
$$;

revoke all on function ybyra_privado.criar_perfil_ybyra() from public, anon, authenticated;
drop trigger if exists ao_cadastrar_ybyra on auth.users;
create trigger ao_cadastrar_ybyra after insert on auth.users
    for each row execute function ybyra_privado.criar_perfil_ybyra();

insert into public.perfis (id, criado_em)
    select id, created_at from auth.users
    on conflict (id) do nothing;

commit;
