create extension if not exists pgcrypto;

create or replace function public.atualizar_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create table public.museu_administradores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);

alter table public.museu_administradores enable row level security;

create policy "administradores_leem_proprio_registro"
  on public.museu_administradores
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.eh_administrador_museu()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.museu_administradores
    where user_id = auth.uid()
  );
$$;

revoke all on function public.eh_administrador_museu() from public;
grant execute on function public.eh_administrador_museu() to authenticated;
grant select on public.museu_administradores to authenticated;

create table public.galeria (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text not null,
  caminho_storage text not null unique,
  arquivo_url text,
  formato text not null,
  credito text,
  publicado boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint galeria_titulo_tamanho check (char_length(btrim(titulo)) between 1 and 160),
  constraint galeria_descricao_tamanho check (descricao is null or char_length(descricao) <= 2000),
  constraint galeria_categoria_tamanho check (char_length(btrim(categoria)) between 1 and 80),
  constraint galeria_caminho_tamanho check (char_length(caminho_storage) between 1 and 512),
  constraint galeria_formato_valido check (formato in ('jpg', 'jpeg', 'png', 'webp')),
  constraint galeria_credito_tamanho check (credito is null or char_length(credito) <= 200)
);

create trigger galeria_atualiza_timestamp
  before update on public.galeria
  for each row
  execute function public.atualizar_timestamp();

create index galeria_publicada_criado_em_idx
  on public.galeria (publicado, criado_em desc);

create index galeria_categoria_idx
  on public.galeria (categoria);

alter table public.galeria enable row level security;

create policy "galeria_publicada_leitura_publica"
  on public.galeria
  for select
  to anon, authenticated
  using (publicado = true);

create policy "galeria_admin_leitura"
  on public.galeria
  for select
  to authenticated
  using (public.eh_administrador_museu());

create policy "galeria_admin_insercao"
  on public.galeria
  for insert
  to authenticated
  with check (public.eh_administrador_museu());

create policy "galeria_admin_atualizacao"
  on public.galeria
  for update
  to authenticated
  using (public.eh_administrador_museu())
  with check (public.eh_administrador_museu());

create policy "galeria_admin_exclusao"
  on public.galeria
  for delete
  to authenticated
  using (public.eh_administrador_museu());

revoke all on public.galeria from anon, authenticated;
grant select on public.galeria to anon, authenticated;
grant insert, update, delete on public.galeria to authenticated;
grant all on public.galeria to service_role;

create table public.contribuicoes (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null unique,
  nome text not null,
  email text not null,
  telefone text,
  titulo text not null,
  categoria text not null,
  descricao text not null,
  autorizacao boolean not null default false,
  arquivo_caminho text not null unique,
  arquivo_nome_original text not null,
  arquivo_mime text not null,
  arquivo_tamanho integer not null,
  arquivo_hash text not null,
  status text not null default 'pendente',
  observacoes text,
  ip_hash text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint contribuicoes_autorizacao_check check (autorizacao),
  constraint contribuicoes_protocolo_tamanho check (char_length(protocolo) between 8 and 40),
  constraint contribuicoes_nome_tamanho check (char_length(btrim(nome)) between 5 and 160),
  constraint contribuicoes_email_valido check (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  ),
  constraint contribuicoes_telefone_tamanho check (
    telefone is null or char_length(telefone) <= 30
  ),
  constraint contribuicoes_titulo_tamanho check (char_length(btrim(titulo)) between 3 and 160),
  constraint contribuicoes_categoria_tamanho check (char_length(btrim(categoria)) between 1 and 40),
  constraint contribuicoes_descricao_tamanho check (char_length(btrim(descricao)) between 20 and 2000),
  constraint contribuicoes_arquivo_caminho_tamanho check (
    char_length(arquivo_caminho) between 1 and 512
  ),
  constraint contribuicoes_arquivo_nome_tamanho check (
    char_length(arquivo_nome_original) between 1 and 255
  ),
  constraint contribuicoes_arquivo_mime_valido check (
    arquivo_mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  ),
  constraint contribuicoes_arquivo_tamanho_valido check (
    arquivo_tamanho between 1 and 15728640
  ),
  constraint contribuicoes_arquivo_hash_tamanho check (char_length(arquivo_hash) = 64),
  constraint contribuicoes_ip_hash_tamanho check (char_length(ip_hash) = 64),
  constraint contribuicoes_status_valido check (
    status in ('pendente', 'em_analise', 'aprovada', 'recusada', 'publicada')
  )
);

create trigger contribuicoes_atualiza_timestamp
  before update on public.contribuicoes
  for each row
  execute function public.atualizar_timestamp();

create index contribuicoes_status_criado_em_idx
  on public.contribuicoes (status, criado_em desc);

create index contribuicoes_ip_hash_criado_em_idx
  on public.contribuicoes (ip_hash, criado_em desc);

alter table public.contribuicoes enable row level security;

create policy "contribuicoes_admin_leitura"
  on public.contribuicoes
  for select
  to authenticated
  using (public.eh_administrador_museu());

create policy "contribuicoes_admin_atualizacao"
  on public.contribuicoes
  for update
  to authenticated
  using (public.eh_administrador_museu())
  with check (public.eh_administrador_museu());

create policy "contribuicoes_admin_exclusao"
  on public.contribuicoes
  for delete
  to authenticated
  using (public.eh_administrador_museu());

revoke all on public.contribuicoes from anon, authenticated;
grant select, update, delete on public.contribuicoes to authenticated;
grant all on public.contribuicoes to service_role;
grant all on public.museu_administradores to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'galeria',
    'galeria',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'contribuicoes',
    'contribuicoes',
    false,
    15728640,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "galeria_storage_leitura_publica"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'galeria');

create policy "galeria_storage_admin_insercao"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'galeria' and public.eh_administrador_museu());

create policy "galeria_storage_admin_atualizacao"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'galeria' and public.eh_administrador_museu())
  with check (bucket_id = 'galeria' and public.eh_administrador_museu());

create policy "galeria_storage_admin_exclusao"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'galeria' and public.eh_administrador_museu());

create policy "contribuicoes_storage_admin_leitura"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'contribuicoes' and public.eh_administrador_museu());

create policy "contribuicoes_storage_admin_exclusao"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'contribuicoes' and public.eh_administrador_museu());

alter table public.galeria replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.galeria;
    exception
      when duplicate_object then null;
    end;
  end if;
end;
$$;
