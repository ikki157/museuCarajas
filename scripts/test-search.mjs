import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SAMPLE_ITEMS = [
  {
    id: 'item-1',
    titulo: 'Chegada da Estrada de Ferro Carajás',
    descricao: 'Locomotiva inaugurando o ramal ferroviário na serra.',
    categoria: 'Ferrovia & Formação',
    tipo_midia: 'fotografia',
    periodo_estimado: 'Década de 1980',
    localizacao: 'Serra dos Carajás, PA',
    tags: ['ferrovia', 'serra dos carajás', 'trem'],
    caminho_storage: 'ferrovia-1985.jpg',
    arquivo_url: null,
    midia_externa_url: null,
    thumbnail_url: null,
    formato: 'jpg',
    credito: 'Acervo Comunitário',
    publicado: true,
    criado_em: '2026-01-10T12:00:00Z',
    atualizado_em: '2026-01-10T12:00:00Z',
  },
  {
    id: 'item-2',
    titulo: 'Cestaria e pintura corporal Mebêngôkre',
    descricao: 'Cultura Xikrin documentada em oficina de trançado tradicional.',
    categoria: 'Etnografia Xikrin',
    tipo_midia: 'fotografia',
    periodo_estimado: '1994',
    localizacao: 'Terra Indígena Xikrin do Cateté',
    tags: ['xikrin', 'cultura xikrin', 'cateté'],
    caminho_storage: 'xikrin-1994.jpg',
    arquivo_url: null,
    midia_externa_url: null,
    thumbnail_url: null,
    formato: 'png',
    credito: 'Coordenação Curatorial',
    publicado: true,
    criado_em: '2026-01-11T12:00:00Z',
    atualizado_em: '2026-01-11T12:00:00Z',
  },
  {
    id: 'item-3',
    titulo: 'Laudo de escavação no sítio Gruta Azul',
    descricao: 'Relatório técnico sobre artefato arqueológico lítico preservado.',
    categoria: 'Patrimônio Arqueológico',
    tipo_midia: 'documento',
    periodo_estimado: 'Década de 1970',
    localizacao: 'Flona de Carajás',
    tags: ['gruta azul', 'lítico', 'arqueológico'],
    caminho_storage: 'laudo-gruta-azul.pdf',
    arquivo_url: null,
    midia_externa_url: null,
    thumbnail_url: null,
    formato: 'pdf',
    credito: 'IPHAN',
    publicado: true,
    criado_em: '2026-01-12T12:00:00Z',
    atualizado_em: '2026-01-12T12:00:00Z',
  },
  {
    id: 'item-4',
    titulo: 'Entrevista com pioneiros de Parauapebas',
    descricao: 'Depoimento audiovisual sobre a formação do núcleo urbano.',
    categoria: 'Memória Urbana',
    tipo_midia: 'video',
    periodo_estimado: 'Anos 1990',
    localizacao: 'Parauapebas',
    tags: ['oralidade', 'pioneiros', 'parauapebas'],
    caminho_storage: null,
    arquivo_url: null,
    midia_externa_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: null,
    formato: 'youtube',
    credito: 'Acervo Audiovisual',
    publicado: true,
    criado_em: '2026-01-13T12:00:00Z',
    atualizado_em: '2026-01-13T12:00:00Z',
  },
]

let viteServer
let filterGaleriaItems
let normalizeText

describe('Museu Carajás — Acervo Search & Filter (filterGaleriaItems)', () => {
  before(async () => {
    viteServer = await createServer({
      root,
      logLevel: 'silent',
      server: { middlewareMode: true, watch: null },
      appType: 'custom',
    })
    const galeriaMod = await viteServer.ssrLoadModule('/src/lib/galeria.ts')
    const utilsMod = await viteServer.ssrLoadModule('/src/lib/utils.ts')
    filterGaleriaItems = galeriaMod.filterGaleriaItems
    normalizeText = utilsMod.normalizeText
  })

  after(async () => {
    await viteServer?.close()
  })

  it('1. exact title match returns the expected item', () => {
    const result = filterGaleriaItems(SAMPLE_ITEMS, {
      query: 'Chegada da Estrada de Ferro Carajás',
    })
    assert.deepEqual(
      result.map((item) => item.id),
      ['item-1'],
    )
  })

  it('2. case-insensitive and accent-insensitive search via normalizeText works cleanly', () => {
    assert.equal(normalizeText('  Serra   dos CARAJÁS — Mebêngôkre  '), 'serra dos carajas — mebengokre')

    const carajas = filterGaleriaItems(SAMPLE_ITEMS, { query: 'carajas' })
    assert.deepEqual(
      carajas.map((item) => item.id),
      ['item-1', 'item-3'],
    )

    const xikrin = filterGaleriaItems(SAMPLE_ITEMS, { query: 'xikrin' })
    assert.deepEqual(
      xikrin.map((item) => item.id),
      ['item-2'],
    )

    const mebengokre = filterGaleriaItems(SAMPLE_ITEMS, { query: 'MEBENGOKRE' })
    assert.deepEqual(
      mebengokre.map((item) => item.id),
      ['item-2'],
    )

    const arqueologia = filterGaleriaItems(SAMPLE_ITEMS, { query: 'arqueologia' })
    assert.deepEqual(
      arqueologia.map((item) => item.id),
      ['item-3'],
    )
  })

  it('3. search matches localizacao, periodo_estimado, and tags', () => {
    const byLocation = filterGaleriaItems(SAMPLE_ITEMS, { query: 'catete' })
    assert.deepEqual(
      byLocation.map((item) => item.id),
      ['item-2'],
    )

    const byPeriod = filterGaleriaItems(SAMPLE_ITEMS, { query: 'decada de 1970' })
    assert.deepEqual(
      byPeriod.map((item) => item.id),
      ['item-3'],
    )

    const byTag = filterGaleriaItems(SAMPLE_ITEMS, { query: 'oralidade' })
    assert.deepEqual(
      byTag.map((item) => item.id),
      ['item-4'],
    )
  })

  it('4. combined filtering respects search query + media type + category together', () => {
    const photoCarajas = filterGaleriaItems(SAMPLE_ITEMS, {
      query: 'carajas',
      mediaType: 'fotografia',
    })
    assert.deepEqual(
      photoCarajas.map((item) => item.id),
      ['item-1'],
    )

    const docArqueologico = filterGaleriaItems(SAMPLE_ITEMS, {
      query: 'carajas',
      mediaType: 'documento',
      category: 'Patrimônio Arqueológico',
    })
    assert.deepEqual(
      docArqueologico.map((item) => item.id),
      ['item-3'],
    )

    const mismatchMedia = filterGaleriaItems(SAMPLE_ITEMS, {
      query: 'carajas',
      mediaType: 'video',
    })
    assert.deepEqual(mismatchMedia, [])
  })

  it('5. non-matching query returns an empty array ([])', () => {
    const empty = filterGaleriaItems(SAMPLE_ITEMS, {
      query: 'astronomia espacial inexistente',
    })
    assert.deepEqual(empty, [])
  })

  it('6. empty or cleared query restores all items', () => {
    const restoredEmpty = filterGaleriaItems(SAMPLE_ITEMS, { query: '' })
    assert.equal(restoredEmpty.length, SAMPLE_ITEMS.length)

    const restoredWhitespace = filterGaleriaItems(SAMPLE_ITEMS, { query: '   ' })
    assert.deepEqual(
      restoredWhitespace.map((item) => item.id),
      SAMPLE_ITEMS.map((item) => item.id),
    )
  })
})

