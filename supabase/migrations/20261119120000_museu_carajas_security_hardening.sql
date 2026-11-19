-- Migration incremental de endurecimento de seguranca e integridade (Museu Carajas)
-- 1. Previne publicacao duplicada de uma mesma contribuicao na galeria
-- 2. Endurece validacao de estado e caminho na RPC publicar_contribuicao_na_galeria
-- 3. Restringe esquemas inseguros em public.galeria.arquivo_url
-- 4. Adiciona indice para suporte a rate-limiting secundario por e-mail

-- ============================================================================
-- 1. Unicidade de contribuicao_id na galeria (previne publicacao duplicada)
-- ============================================================================

create unique index if not exists galeria_contribuicao_id_unique_idx
  on public.galeria (contribuicao_id)
  where contribuicao_id is not null;

-- ============================================================================
-- 2. Indice de suporte a rate-limiting por e-mail na fila de contribuicoes
-- ============================================================================

create index if not exists contribuicoes_email_criado_em_idx
  on public.contribuicoes (email, criado_em desc);

-- ============================================================================
-- 3. Validacao defensiva de esquema de URL em public.galeria.arquivo_url
-- ============================================================================

alter table public.galeria
  drop constraint if exists galeria_arquivo_url_segura;

alter table public.galeria
  add constraint galeria_arquivo_url_segura check (
    arquivo_url is null
    or (
      char_length(btrim(arquivo_url)) between 1 and 1024
      and arquivo_url !~* '^//'
      and arquivo_url ~* '^(https://|http://(localhost|127\.0\.0\.1)(:[0-9]+)?/|/[^/])'
    )
  ) not valid;

-- ============================================================================
-- 4. Endurecimento da RPC publicar_contribuicao_na_galeria
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
  v_thumbnail_url text;
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

  -- Impede republicacao ou promocao de envios ja recusados
  if v_contribuicao.status = 'publicada' then
    raise exception 'Contribuicao % ja foi publicada anteriormente.', p_contribuicao_id
      using errcode = '23505';
  end if;

  if v_contribuicao.status = 'recusada' then
    raise exception 'Contribuicao % esta marcada como recusada e nao pode ser publicada diretamente.', p_contribuicao_id
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.galeria
    where contribuicao_id = v_contribuicao.id
  ) then
    raise exception 'Ja existe um registro na galeria vinculado a contribuicao %.', p_contribuicao_id
      using errcode = '23505';
  end if;

  v_caminho_publico := nullif(btrim(p_caminho_publico), '');
  v_thumbnail_url := nullif(btrim(p_thumbnail_url), '');

  -- Valida caminho no bucket publico contra path traversal
  if v_caminho_publico is not null then
    if v_caminho_publico ~ '(^/|\\|\.\.)' or char_length(v_caminho_publico) > 512 then
      raise exception 'Caminho publico invalido para o bucket galeria.'
        using errcode = '22023';
    end if;
  end if;

  if v_thumbnail_url is not null then
    if v_thumbnail_url ~* '^//' or v_thumbnail_url !~* '^(https://|/[^/]|[a-z0-9._/-]+)$' then
      raise exception 'URL ou caminho de miniatura invalido.'
        using errcode = '22023';
    end if;
  end if;

  -- Para midias enviadas via arquivo binario, o caminho no bucket publico deve ser informado
  if v_contribuicao.midia_externa_url is null and v_caminho_publico is null then
    raise exception 'Informe p_caminho_publico com o caminho do arquivo copiado para o bucket publico galeria.'
      using errcode = '22023';
  end if;

  if v_contribuicao.midia_externa_url is not null
     and v_contribuicao.midia_externa_url !~* '^https://' then
    raise exception 'URL externa de midia deve utilizar HTTPS.'
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
    v_thumbnail_url,
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

