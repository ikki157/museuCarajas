-- Migration incremental: Evolucao do acervo do Museu Carajas para suporte multimeios
-- Suporta fotografias, videos (MP4/WebM ou YouTube/Vimeo) e documentos PDF historicos,
-- com metadados arquivisticos (periodo estimado, localizacao, tags) e promocao curatorial segura.

-- ============================================================================
-- 1. Expansao da tabela public.galeria
-- ============================================================================

alter table public.galeria
  add column if not exists tipo_midia text not null default 'fotografia',
  add column if not exists periodo_estimado text,
  add column if not exists localizacao text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists midia_externa_url text,
  add column if not exists thumbnail_url text,
  add column if not exists contribuicao_id uuid references public.contribuicoes(id) on delete set null;

-- Permite caminho_storage nulo apenas quando houver midia_externa_url valida
alter table public.galeria
  alter column caminho_storage drop not null;

alter table public.galeria
  drop constraint if exists galeria_caminho_tamanho,
  drop constraint if exists galeria_origem_midia_obrigatoria,
  drop constraint if exists galeria_formato_valido,
  drop constraint if exists galeria_tipo_midia_valido,
  drop constraint if exists galeria_periodo_estimado_tamanho,
  drop constraint if exists galeria_localizacao_tamanho,
  drop constraint if exists galeria_tags_limite,
  drop constraint if exists galeria_midia_externa_url_tamanho,
  drop constraint if exists galeria_thumbnail_url_tamanho;

alter table public.galeria
  add constraint galeria_caminho_tamanho check (
    caminho_storage is null or char_length(btrim(caminho_storage)) between 1 and 512
  ),
  add constraint galeria_origem_midia_obrigatoria check (
    (caminho_storage is not null and char_length(btrim(caminho_storage)) between 1 and 512)
    or (midia_externa_url is not null and char_length(btrim(midia_externa_url)) between 1 and 512)
  ),
  add constraint galeria_formato_valido check (
    formato in ('jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp4', 'webm', 'youtube', 'vimeo')
  ),
  add constraint galeria_tipo_midia_valido check (
    tipo_midia in ('fotografia', 'video', 'documento')
  ),
  add constraint galeria_periodo_estimado_tamanho check (
    periodo_estimado is null or char_length(btrim(periodo_estimado)) between 1 and 80
  ),
  add constraint galeria_localizacao_tamanho check (
    localizacao is null or char_length(btrim(localizacao)) between 1 and 120
  ),
  add constraint galeria_tags_limite check (
    cardinality(tags) <= 10
  ),
  add constraint galeria_midia_externa_url_tamanho check (
    midia_externa_url is null
    or (char_length(btrim(midia_externa_url)) between 1 and 512 and midia_externa_url ~* '^https?://')
  ),
  add constraint galeria_thumbnail_url_tamanho check (
    thumbnail_url is null or char_length(btrim(thumbnail_url)) between 1 and 512
  );

-- Indices para busca por tags e filtragem rapida por tipo de midia publicado
create index if not exists galeria_tags_gin_idx
  on public.galeria using gin (tags);

create index if not exists galeria_publicada_tipo_midia_criado_em_idx
  on public.galeria (publicado, tipo_midia, criado_em desc);

-- ============================================================================
-- 2. Expansao da tabela public.contribuicoes
-- ============================================================================

alter table public.contribuicoes
  add column if not exists tipo_midia text not null default 'fotografia',
  add column if not exists periodo_estimado text,
  add column if not exists localizacao text,
  add column if not exists midia_externa_url text;

-- Relaxa obrigatoriedade de colunas de arquivo binario para suportar envios de video por link externo
alter table public.contribuicoes
  alter column arquivo_caminho drop not null,
  alter column arquivo_nome_original drop not null,
  alter column arquivo_mime drop not null,
  alter column arquivo_tamanho drop not null,
  alter column arquivo_hash drop not null;

alter table public.contribuicoes
  drop constraint if exists contribuicoes_tipo_midia_valido,
  drop constraint if exists contribuicoes_periodo_estimado_tamanho,
  drop constraint if exists contribuicoes_localizacao_tamanho,
  drop constraint if exists contribuicoes_midia_externa_url_tamanho,
  drop constraint if exists contribuicoes_arquivo_caminho_tamanho,
  drop constraint if exists contribuicoes_arquivo_nome_tamanho,
  drop constraint if exists contribuicoes_arquivo_mime_valido,
  drop constraint if exists contribuicoes_arquivo_tamanho_valido,
  drop constraint if exists contribuicoes_arquivo_hash_tamanho,
  drop constraint if exists contribuicoes_midia_consistente;

alter table public.contribuicoes
  add constraint contribuicoes_tipo_midia_valido check (
    tipo_midia in ('fotografia', 'video', 'documento')
  ),
  add constraint contribuicoes_periodo_estimado_tamanho check (
    periodo_estimado is null or char_length(btrim(periodo_estimado)) between 1 and 80
  ),
  add constraint contribuicoes_localizacao_tamanho check (
    localizacao is null or char_length(btrim(localizacao)) between 1 and 120
  ),
  add constraint contribuicoes_midia_externa_url_tamanho check (
    midia_externa_url is null
    or (char_length(btrim(midia_externa_url)) between 1 and 512 and midia_externa_url ~* '^https?://')
  ),
  add constraint contribuicoes_arquivo_caminho_tamanho check (
    arquivo_caminho is null or char_length(arquivo_caminho) between 1 and 512
  ),
  add constraint contribuicoes_arquivo_nome_tamanho check (
    arquivo_nome_original is null or char_length(arquivo_nome_original) between 1 and 255
  ),
  add constraint contribuicoes_arquivo_mime_valido check (
    arquivo_mime is null
    or arquivo_mime in (
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm'
    )
  ),
  add constraint contribuicoes_arquivo_tamanho_valido check (
    arquivo_tamanho is null or arquivo_tamanho between 1 and 52428800
  ),
  add constraint contribuicoes_arquivo_hash_tamanho check (
    arquivo_hash is null or char_length(arquivo_hash) = 64
  ),
  add constraint contribuicoes_midia_consistente check (
    (
      arquivo_caminho is not null
      and arquivo_nome_original is not null
      and arquivo_mime is not null
      and arquivo_tamanho is not null
      and arquivo_hash is not null
    )
    or (
      tipo_midia = 'video'
      and midia_externa_url is not null
      and arquivo_caminho is null
      and arquivo_nome_original is null
      and arquivo_mime is null
      and arquivo_tamanho is null
      and arquivo_hash is null
    )
  );

-- ============================================================================
-- 3. Atualizacao dos buckets de Storage (limite 50 MB + video e PDF)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'galeria',
    'galeria',
    true,
    52428800,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm'
    ]
  ),
  (
    'contribuicoes',
    'contribuicoes',
    false,
    52428800,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- 4. Funcao RPC curatorial para promover contribuicao aprovada para a galeria
-- ============================================================================

create or replace function public.publicar_contribuicao_na_galeria(
  p_contribuicao_id uuid,
  p_caminho_publico text default null,
  p_thumbnail_url text default null,
  p_credito text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contribuicao public.contribuicoes%rowtype;
  v_formato text;
  v_caminho_publico text;
  v_credito text;
  v_galeria_id uuid;
begin
  -- Garante que apenas administradores autenticados do museu ou service_role possam publicar
  if not (public.eh_administrador_museu() or auth.role() = 'service_role') then
    raise exception 'Acesso negado: apenas administradores do museu podem publicar contribuicoes.'
      using errcode = '42501';
  end if;

  select *
  into v_contribuicao
  from public.contribuicoes
  where id = p_contribuicao_id
  for update;

  if not found then
    raise exception 'Contribuicao % nao encontrada.', p_contribuicao_id
      using errcode = 'P0002';
  end if;

  v_caminho_publico := nullif(btrim(p_caminho_publico), '');

  -- Para midias enviadas via arquivo binario, o caminho no bucket publico deve ser informado
  if v_contribuicao.midia_externa_url is null and v_caminho_publico is null then
    raise exception 'Informe p_caminho_publico com o caminho do arquivo copiado para o bucket publico galeria.'
      using errcode = '22023';
  end if;

  -- Determina o formato padronizado com base no MIME do arquivo ou dominio da URL externa
  if v_contribuicao.arquivo_mime is not null then
    v_formato := case v_contribuicao.arquivo_mime
      when 'image/jpeg' then 'jpg'
      when 'image/png' then 'png'
      when 'image/webp' then 'webp'
      when 'application/pdf' then 'pdf'
      when 'video/mp4' then 'mp4'
      when 'video/webm' then 'webm'
      else null
    end;
  elsif v_contribuicao.midia_externa_url is not null then
    if v_contribuicao.midia_externa_url ~* '(youtube\.com|youtu\.be)' then
      v_formato := 'youtube';
    elsif v_contribuicao.midia_externa_url ~* 'vimeo\.com' then
      v_formato := 'vimeo';
    elsif v_contribuicao.midia_externa_url ~* '\.webm(\?|$)' then
      v_formato := 'webm';
    else
      v_formato := 'mp4';
    end if;
  end if;

  if v_formato is null then
    raise exception 'Nao foi possivel determinar um formato valido para a contribuicao %.', p_contribuicao_id
      using errcode = '22023';
  end if;

  v_credito := coalesce(
    nullif(btrim(p_credito), ''),
    nullif(btrim(v_contribuicao.nome), '')
  );

  insert into public.galeria (
    titulo,
    descricao,
    categoria,
    caminho_storage,
    formato,
    credito,
    publicado,
    tipo_midia,
    periodo_estimado,
    localizacao,
    midia_externa_url,
    thumbnail_url,
    contribuicao_id
  )
  values (
    v_contribuicao.titulo,
    v_contribuicao.descricao,
    v_contribuicao.categoria,
    v_caminho_publico,
    v_formato,
    v_credito,
    true,
    v_contribuicao.tipo_midia,
    v_contribuicao.periodo_estimado,
    v_contribuicao.localizacao,
    v_contribuicao.midia_externa_url,
    nullif(btrim(p_thumbnail_url), ''),
    v_contribuicao.id
  )
  returning id into v_galeria_id;

  update public.contribuicoes
  set status = 'publicada'
  where id = v_contribuicao.id;

  return v_galeria_id;
end;
$$;

revoke all on function public.publicar_contribuicao_na_galeria(uuid, text, text, text) from public;
revoke all on function public.publicar_contribuicao_na_galeria(uuid, text, text, text) from anon;
grant execute on function public.publicar_contribuicao_na_galeria(uuid, text, text, text) to authenticated, service_role;

