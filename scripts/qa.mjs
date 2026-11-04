import { chromium } from 'playwright'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5173'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(os.tmpdir(), 'museu-qa')
fs.mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge', headless: true })

async function preparePage(viewport, isMobile = false) {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    locale: 'pt-BR',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  return { context, page, consoleErrors, pageErrors }
}

async function gotoSection(page, sectionId) {
  await page.evaluate((id) => {
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    const element = document.getElementById(id)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 84
      window.scrollTo(0, Math.max(0, top))
    }
    root.style.scrollBehavior = previous
  }, sectionId)
  await page.waitForTimeout(700)
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    const step = 500
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 70))
    }
    window.scrollTo(0, 0)
    root.style.scrollBehavior = previous
  })
  await page.waitForTimeout(600)
}

async function ensureImages(page) {
  await page.evaluate(async () => {
    const images = Array.from(document.images)
    images.forEach((image) => {
      if (!image.complete) image.loading = 'eager'
    })
    await Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true })
              image.addEventListener('error', resolve, { once: true })
            }),
      ),
    )
  })
  await page.waitForTimeout(500)
}

async function reportLayout(page, label) {
  await ensureImages(page)
  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    brokenImages: Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
    imagesWithoutAlt: Array.from(document.images).filter((image) => !image.hasAttribute('alt')).length,
    emptyLinks: Array.from(document.querySelectorAll('a')).filter(
      (link) => !link.getAttribute('href') || link.getAttribute('href') === '#',
    ).length,
  }))
  console.log(`[layout:${label}]`, JSON.stringify(layout))
  return layout
}

async function activeNavLabel(page) {
  return page
    .locator('nav[aria-label="Navegação principal"] a[aria-current="location"]')
    .textContent()
    .catch(() => null)
}

async function makeImageFixture(page, mime) {
  const base64 = await page.evaluate((type) => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const context = canvas.getContext('2d')
    if (!context) return ''
    context.fillStyle = '#a34d2b'
    context.fillRect(0, 0, 16, 16)
    context.fillStyle = '#f7f1e7'
    context.fillRect(4, 4, 8, 8)
    return canvas.toDataURL(type).split(',')[1] ?? ''
  }, mime)
  return Buffer.from(base64, 'base64')
}

const desktop = await preparePage({ width: 1440, height: 900 })
const desktopPage = desktop.page
await scrollThrough(desktopPage)
await desktopPage.screenshot({ path: path.join(OUT_DIR, 'desktop-full.png'), fullPage: true })
await desktopPage.screenshot({ path: path.join(OUT_DIR, 'desktop-hero.png') })
await reportLayout(desktopPage, 'desktop')

const activeSections = {}
for (const sectionId of ['museu', 'acervo', 'exposicoes', 'galeria', 'educacao', 'contribua', 'visite']) {
  await gotoSection(desktopPage, sectionId)
  activeSections[sectionId] = await activeNavLabel(desktopPage)
  await desktopPage.screenshot({ path: path.join(OUT_DIR, `desktop-${sectionId}.png`) })
}
console.log('[active-nav:desktop]', JSON.stringify(activeSections))

await gotoSection(desktopPage, 'acervo')
await desktopPage.locator('#tab-xikrin').focus()
await desktopPage.keyboard.press('ArrowDown')
const collectionTabs = await desktopPage.evaluate(() => ({
  selectedTab: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
  visiblePanel: document.querySelector('[role="tabpanel"]:not([hidden])')?.id,
  panels: document.querySelectorAll('[role="tabpanel"]').length,
}))
console.log('[collection-tabs]', JSON.stringify(collectionTabs))

console.log('[console:desktop]', JSON.stringify(desktop.consoleErrors))
console.log('[pageerrors:desktop]', JSON.stringify(desktop.pageErrors))
await desktop.context.close()

const mobile = await preparePage({ width: 390, height: 844 }, true)
const mobilePage = mobile.page
await scrollThrough(mobilePage)
await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile-full.png'), fullPage: true })
await reportLayout(mobilePage, 'mobile')

await mobilePage.evaluate(() => window.scrollTo(0, 0))
await mobilePage.waitForTimeout(300)
await mobilePage.getByRole('button', { name: 'Abrir menu' }).click()
await mobilePage.waitForTimeout(600)
await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile-menu.png') })
const menuState = await mobilePage.evaluate(() => ({
  expanded: document.querySelector('button[aria-label="Fechar menu"]')?.getAttribute('aria-expanded'),
  activeElement: document.activeElement?.textContent?.trim().slice(0, 40),
  bodyOverflow: document.body.style.overflow,
}))
console.log('[menu]', JSON.stringify(menuState))
await mobilePage.keyboard.press('Escape')
await mobilePage.waitForTimeout(500)
const menuClosed = await mobilePage.evaluate(() => ({
  panelInert: document.getElementById('menu-mobile')?.hasAttribute('inert'),
  bodyOverflow: document.body.style.overflow,
  activeElement: document.activeElement?.getAttribute('aria-label'),
}))
console.log('[menu-closed]', JSON.stringify(menuClosed))

for (const sectionId of ['museu', 'acervo', 'exposicoes', 'contribua', 'visite']) {
  await gotoSection(mobilePage, sectionId)
  await mobilePage.screenshot({ path: path.join(OUT_DIR, `mobile-${sectionId}.png`) })
}

console.log('[console:mobile]', JSON.stringify(mobile.consoleErrors))
console.log('[pageerrors:mobile]', JSON.stringify(mobile.pageErrors))

await gotoSection(mobilePage, 'contribua')

const fileInput = mobilePage.locator('#arquivo')

async function tryFile(file) {
  await fileInput.setInputFiles(file)
  await mobilePage.waitForTimeout(700)
  const error = await mobilePage.locator('#arquivo-error').textContent().catch(() => null)
  return (error ?? '').trim()
}

const validJpgPath = path.join(root, 'public', 'images', 'museu', 'museu-08.jpg')
const jpgBuffer = fs.readFileSync(validJpgPath)
const pngBuffer = await makeImageFixture(mobilePage, 'image/png')
const webpBuffer = await makeImageFixture(mobilePage, 'image/webp')
const pdfBuffer = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\nstartxref\n0\n%%EOF\n',
)

const validationCases = []

validationCases.push([
  'extensão não permitida',
  await tryFile({ name: 'arquivo.txt', mimeType: 'text/plain', buffer: Buffer.from('texto') }),
])
validationCases.push([
  'conteúdo falso',
  await tryFile({ name: 'falsa.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('não é imagem') }),
])
validationCases.push([
  'extensão divergente',
  await tryFile({ name: 'foto.png', mimeType: 'image/png', buffer: jpgBuffer }),
])
validationCases.push([
  'MIME divergente',
  await tryFile({ name: 'foto.jpg', mimeType: 'application/pdf', buffer: jpgBuffer }),
])
validationCases.push([
  'PDF corrompido',
  await tryFile({
    name: 'documento.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\nconteúdo sem finalizador'),
  }),
])
validationCases.push([
  'arquivo vazio',
  await tryFile({ name: 'vazio.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(0) }),
])
validationCases.push([
  'fotografia acima de 10 MB',
  await tryFile({
    name: 'grande.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(10 * 1024 * 1024 + 10)]),
  }),
])

console.log('[validation-errors]')
for (const [label, message] of validationCases) {
  console.log(`- ${label}: ${message}`)
}

const pngError = await tryFile({ name: 'pixel.png', mimeType: 'image/png', buffer: pngBuffer })
const webpError = await tryFile({ name: 'pixel.webp', mimeType: 'image/webp', buffer: webpBuffer })
const pdfError = await tryFile({ name: 'documento.pdf', mimeType: 'application/pdf', buffer: pdfBuffer })
const jpgError = await tryFile({ name: 'museu.jpg', mimeType: 'image/jpeg', buffer: jpgBuffer })
console.log(
  '[validation-success]',
  JSON.stringify({ pngError, webpError, pdfError, jpgError }),
)
const previewVisible = await mobilePage.locator('img[alt^="Pré-visualização"]').isVisible().catch(() => false)
console.log('[preview-visible]', previewVisible)

await mobilePage.getByRole('button', { name: 'Remover' }).click()
await mobilePage.waitForTimeout(200)
const previewAfterRemove = await mobilePage.locator('img[alt^="Pré-visualização"]').count()
console.log('[preview-after-remove]', previewAfterRemove)

await mobilePage.evaluate(() => document.querySelector('form')?.requestSubmit())
await mobilePage.waitForTimeout(400)
const requiredErrors = await mobilePage.evaluate(() =>
  ['nome', 'email', 'titulo', 'categoria', 'descricao', 'arquivo', 'autorizacao']
    .map((field) => {
      const error = document.getElementById(`${field}-error`)
      return error ? `${field}: ${error.textContent?.trim()}` : `${field}: (sem erro)`
    }),
)
console.log('[required-errors]', JSON.stringify(requiredErrors))

console.log('[form] preenchendo campos')
await mobilePage.locator('#nome').fill('Maria da Silva')
await mobilePage.locator('#email').fill('maria@example.com')
await mobilePage.locator('#titulo').fill('Fotografia histórica de teste')
await mobilePage.locator('#categoria').selectOption('fotografia')
await mobilePage.locator('#descricao').fill('Fotografia de teste para validar o formulário do museu e o envio.')
await mobilePage.locator('#autorizacao').check()
console.log('[form] anexando arquivo válido')
const validAttachmentError = await tryFile({
  name: 'museu.jpg',
  mimeType: 'image/jpeg',
  buffer: jpgBuffer,
})
console.log('[form] arquivo válido', JSON.stringify({ validAttachmentError }))
console.log('[form] enviando sem Supabase configurado')
await mobilePage.evaluate(() => document.querySelector('form')?.requestSubmit())
await mobilePage.waitForTimeout(700)
const unconfiguredMessage = await mobilePage.locator('[role="alert"]').allTextContents()
const successVisible = await mobilePage.getByText('Obrigado por compartilhar essa memória.').count()
console.log('[unconfigured-submit]', JSON.stringify({ unconfiguredMessage, successVisible }))
await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile-form-unconfigured.png') })

await mobile.context.close()
await browser.close()
