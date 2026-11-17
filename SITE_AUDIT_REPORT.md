# 1. Visão Geral Executiva e Stack Tecnológica

- **Propósito do Site e Domínio de Negócio:**
  Portal institucional e acervo digital interativo do **Museu Municipal Hilmar Harry Kluck**, localizado em Parauapebas (PA) e vinculado à Secretaria Municipal de Cultura (Secult). O sistema é uma Single-Page Application (SPA) dividida em oito seções temáticas que apresentam a história institucional do museu (criado por lei em 2011 e aberto em 2020), a biografia do indigenista Hilmar Harry Kluck, o acervo arqueológico da Serra dos Carajás (+11 mil anos) e etnográfico do povo indígena Xikrin do Cateté, as exposições e projetos (*Conhecer para Preservar* e *Salvaguarda*), uma galeria de fotografias sincronizada em tempo real via banco de dados (Supabase Realtime), informações de ações educativas, orientações de visitação e um fluxo completo de submissão de contribuições da comunidade (upload validado de imagens JPG/PNG/WEBP até 10 MB e documentos PDF até 15 MB, com geração de protocolo e armazenamento privado para curadoria).

- **Stack Tecnológica Completa:**
  - **Linguagens:** TypeScript (`~5.9.3`), SQL (PostgreSQL / Supabase), HTML5, CSS3, JavaScript ES Modules (`.mjs` para automação/QA).
  - **Framework & Biblioteca de UI:** React (`^19.3.1`) e React DOM (`^19.3.1`) com `@vitejs/plugin-react` (`^6.2.1`).
  - **Estilização & Design System:** Tailwind CSS v4 (`^4.3.4`) integrado via plugin nativo `@tailwindcss/vite` (`^4.3.4`), utilizando configuração CSS-first (`@theme` em `src/index.css`).
  - **Tipografia Local (Self-Hosted):** `@fontsource-variable/fraunces` (`^5.3.0`) para títulos serifados editoriais e `@fontsource-variable/inter` (`^5.3.0`) para corpo de texto e interface.
  - **Ícones:** `lucide-react` (`^1.66.0`).
  - **Backend-as-a-Service (BaaS) & Tempo Real:** Supabase (`@supabase/supabase-js` `^2.118.0`) — PostgreSQL com Row Level Security (RLS), Supabase Realtime (`postgres_changes`), Supabase Storage (buckets `galeria` e `contribuicoes`) e Supabase Edge Functions em Deno (`supabase/functions/enviar-contribuicao/index.ts`).
  - **Build Tool & Bundler:** Vite (`^8.3.5`, baseado em Rolldown).
  - **Testes & QA Automatizado:** Playwright (`^1.58.2`) via script customizado (`scripts/qa.mjs`).
  - **Gerenciador de Pacotes:** npm (com `package-lock.json` lockfile v3).

- **Scorecard de Saúde Atual (0 a 10):**

| Dimensão Avaliada | Nota (0–10) | Justificativa Rápida Baseada em Evidências do Código |
| :--- | :---: | :--- |
| **Arquitetura** | **8,0 / 10** | Estrutura modular limpa e bem separada (`components/`, `hooks/`, `lib/`, `data/`, `supabase/`), com degradação graciosa quando o Supabase não está configurado. Perde pontos pela duplicação integral da lógica de validação binária de arquivos entre cliente (`src/lib/file-validation.ts`) e servidor (`supabase/functions/enviar-contribuicao/index.ts`) e ausência de roteamento real/URLs compartilháveis para estados da galeria e abas. |
| **Qualidade de Código** | **8,2 / 10** | Código TypeScript em modo `strict: true` (`tsconfig.app.json`), sem uso de `any`, com tratamento defensivo de estados. Contudo, possui código morto documentado (classes CSS `.display-soft`, `.balance`, `.animate-fade-up`, função `normalizeText`, tipo `GaleriaRow`, estado `lastUpdated` não consumido), ausência de ESLint/Prettier configurados e falta de campo `engines` no `package.json`. |
| **UI/UX & Responsividade** | **8,5 / 10** | Direção de arte editorial de alto nível (paleta *parchment/forest/clay/copper*), animações suaves com suporte parcial a `prefers-reduced-motion`, *skeletons* de carregamento e estados vazios/erro bem desenhados. Penalizado pelo uso excessivo de micro-tipografia (`8px` a `9.5px`) e pela falta de feedback visual de foco via teclado na *dropzone* de upload (`ContributionForm.tsx`). |
| **Performance (Core Web Vitals)** | **7,2 / 10** | Bom uso de `fetchPriority="high"` no Hero e `loading="lazy"` nas demais seções. Porém, carrega 266 KB de fontes variáveis Fraunces (`full.css` + `full-italic.css`) quando apenas o eixo `opsz` (146 KB) é usado; imagens estáticas estão apenas em `.jpg` sem WebP/AVIF ou `srcset`; tags `<img>` não declaram `width`/`height` explícitos (gerando risco de CLS na galeria em colunas); e `useGaleria.ts` acumula WebSocket Realtime + polling de 60s sem paginação (`.limit()`). |
| **SEO** | **6,8 / 10** | Possui JSON-LD (`@type: "Museum"`), título e meta description em `index.html`. Entretanto, `og:image` usa caminho relativo (`/images/museu/museu-01.jpg`, inválido para crawlers sociais), faltam `robots.txt`, `sitemap.xml`, tag `<link rel="canonical">`, `og:url`, `openingHoursSpecification` no Schema.org, e há repetição de títulos `<h2>`/`<h3>` idênticos (`"Conhecer para preservar."`) em múltiplas seções. |
| **Acessibilidade (WCAG)** | **7,4 / 10** | Excelente implementação de *skip link*, `useFocusTrap`, `role="tablist"` com navegação por setas e `aria-live`. Contudo, apresenta falhas severas de contraste (WCAG AA) em textos com opacidade reduzida (`text-parchment/28`, `text-parchment/30`, `text-stone/45` com razão ~1.8:1 a 2.4:1), input de arquivo `.sr-only` sem anel de foco visível na *dropzone*, e bug de foco ao acionar `focusFirstError('arquivo')`. |
| **Segurança** | **7,5 / 10** | Ótima validação de *magic bytes* (assinatura binária de JPG, PNG, WEBP, PDF), políticas RLS restritivas no banco e detecção de chave secreta no frontend. Todavia, a Edge Function lê até 17 MB de `FormData` em memória **antes** de checar o *rate limit*, confia no primeiro IP de `X-Forwarded-For` (vulnerável a *spoofing*), rejeita envios legítimos se o relógio do cliente estiver adiantado em relação ao servidor (`form_started_at`), e `readJwtRole` em `src/lib/supabase.ts` pode falhar silenciosamente com `atob()` em payloads JWT base64url sem padding. |

---

# 2. Inventário Completo de Arquivos Lidos e Arquitetura de Pastas

## Árvore de Diretórios Mapeada

```text
./
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── favicon.svg
│   └── images/
│       └── museu/
│           ├── museu-01.jpg
│           ├── museu-02.jpg
│           ├── museu-03.jpg
│           ├── museu-04.jpg
│           ├── museu-05.jpg
│           ├── museu-06.jpg
│           ├── museu-07.jpg
│           ├── museu-08.jpg
│           ├── museu-09.jpg
│           └── museu-10.jpg
├── scripts/
│   ├── qa.mjs
│   └── seed-galeria.mjs
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── home/
│   │   │   ├── AboutMuseum.tsx
│   │   │   ├── Collection.tsx
│   │   │   ├── Contribute.tsx
│   │   │   ├── ContributionForm.tsx
│   │   │   ├── Education.tsx
│   │   │   ├── Exhibitions.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── GalleryLightbox.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── Visit.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Logo.tsx
│   │       ├── Reveal.tsx
│   │       └── SectionHeading.tsx
│   ├── data/
│   │   └── content.ts
│   ├── hooks/
│   │   ├── useActiveSection.ts
│   │   ├── useBodyScrollLock.ts
│   │   ├── useFocusTrap.ts
│   │   ├── useGaleria.ts
│   │   ├── useMediaQuery.ts
│   │   └── useScrolled.ts
│   └── lib/
│       ├── contribuicao.ts
│       ├── file-validation.ts
│       ├── galeria.ts
│       ├── supabase.ts
│       └── utils.ts
└── supabase/
    ├── config.toml
    ├── functions/
    │   └── enviar-contribuicao/
    │       └── index.ts
    └── migrations/
        └── 20261102120000_museu_schema.sql
```

## Catálogo de Arquivos Analisados

| Caminho do Arquivo | Camada / Tipo | Responsabilidade Principal | Status / Complexidade |
| :--- | :--- | :--- | :--- |
| `.env.example` | Configuração / Ambiente | Modelo das variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. | Ativo / Baixa (3 linhas) |
| `.gitignore` | Configuração / Git | Ignora `node_modules`, `dist`, arquivos `.env*`, logs e diretórios temporários do Supabase. | Ativo / Baixa (16 linhas) |
| `index.html` | Entrada / Markup | Documento HTML5 raiz (`lang="pt-BR"`), meta tags de SEO/OpenGraph, dados estruturados JSON-LD (`Museum`) e montagem do `#root`. | Ativo / Média (55 linhas) |
| `package.json` | Manifesto / Dependências | Define scripts (`dev`, `build`, `preview`, `qa`, `seed:galeria`) e dependências de produção e desenvolvimento. | Ativo / Baixa (32 linhas) |
| `README.md` | Documentação | Guia de instalação, arquitetura do banco Supabase, deploy da Edge Function, seed da galeria e créditos das fotos. | Ativo / Baixa (130 linhas) |
| `tsconfig.json` | Configuração / TS | Arquivo de referência de projeto TypeScript apontando para `tsconfig.app.json` e `tsconfig.node.json`. | Ativo / Baixa (4 linhas) |
| `tsconfig.app.json` | Configuração / TS | Configuração do compilador TypeScript para o código em `src/` (`target: ES2022`, `strict: true`, `noUnusedLocals: true`). | Ativo / Baixa (25 linhas) |
| `tsconfig.node.json` | Configuração / TS | Configuração do compilador TypeScript para o ambiente Node (`vite.config.ts`). | Ativo / Baixa (23 linhas) |
| `vite.config.ts` | Configuração / Build | Configura o bundler Vite com os plugins `@vitejs/plugin-react` e `@tailwindcss/vite`. | Ativo / Baixa (7 linhas) |
| `public/favicon.svg` | Asset / Ícone | Vetor SVG do emblema espiral do museu nas cores `#12241B`, `#F7F1E7` e `#B87333`. | Ativo / Baixa (6 linhas) |
| `public/images/museu/museu-01.jpg` a `museu-10.jpg` | Assets / Imagens | 10 fotografias institucionais em JPEG (`1280x720`, 96 DPI, entre 55 KB e 129 KB, totalizando 892 KB) usadas nas seções e no seed. | Ativo / Baixa (10 arquivos binários) |
| `scripts/qa.mjs` | Script / QA E2E | Suite automatizada com Playwright (canal `msedge`) que testa layout desktop/mobile, navegação, abas, menu mobile e validação de arquivos. | Ativo / Alta (303 linhas) |
| `scripts/seed-galeria.mjs` | Script / Banco & Storage | Faz upload das 10 imagens de `public/images/museu` para o bucket `galeria` e executa `upsert` na tabela `public.galeria` usando `service_role`. | Ativo / Média (164 linhas) |
| `src/main.tsx` | Entrada / Frontend | Importa fontes variáveis (`Inter` e `Fraunces`), `src/index.css` e renderiza `<App />` em `<StrictMode>`. | Ativo / Baixa (13 linhas) |
| `src/App.tsx` | Raiz / Layout | Composição sequencial da SPA: `<Header />`, `<main id="conteudo">` (8 seções) e `<Footer />`. | Ativo / Baixa (29 linhas) |
| `src/index.css` | Estilos / Design System | Tema Tailwind v4 (`@theme`), estilos base, classes utilitárias/componentes (`.site-container`, `.display`, `.input-base`) e `@keyframes`. | Ativo com código morto / Média (225 linhas) |
| `src/vite-env.d.ts` | Tipagem / Ambiente | Declaração de tipos TypeScript para `ImportMetaEnv` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`). | Ativo / Baixa (10 linhas) |
| `src/data/content.ts` | Dados Estáticos | Textos institucionais, itens de navegação, horários/endereços de visitação, categorias do acervo, biografia e créditos. | Ativo / Média (146 linhas) |
| `src/lib/supabase.ts` | Infra / Cliente BaaS | Valida variáveis de ambiente, bloqueia uso acidental de chaves secretas (`service_role`) no navegador e instancia o cliente Supabase. | Ativo / Média (44 linhas) |
| `src/lib/galeria.ts` | Domínio / Galeria | Define `GaleriaItem`, normaliza registros vindos do Supabase (`mapGaleriaRow`) e resolve URLs públicas do Storage (`getGaleriaImageUrl`). | Ativo com tipo morto / Baixa (47 linhas) |
| `src/lib/file-validation.ts` | Domínio / Validação | Validação client-side de arquivos (extensão, MIME, *magic bytes* binários, decodificação de imagem via `createImageBitmap` e `%%EOF` de PDF). | Ativo / Alta (240 linhas) |
| `src/lib/contribuicao.ts` | Domínio / Serviço API | Monta `FormData` e invoca a Edge Function `enviar-contribuicao`, tratando erros de rede e respostas estruturadas. | Ativo / Média (97 linhas) |
| `src/lib/utils.ts` | Utilitários | Funções auxiliares `cn()`, `formatDate()`, `formatBytes()`, `normalizeText()` (não utilizada) e `buildMailto()`. | Ativo com função morta / Baixa (36 linhas) |
| `src/hooks/useActiveSection.ts` | Hook / UI | Detecta a seção ativa na viewport durante a rolagem usando `requestAnimationFrame` para atualizar `aria-current` no menu. | Ativo / Média (58 linhas) |
| `src/hooks/useBodyScrollLock.ts` | Hook / UI | Bloqueia o scroll do `document.body` e compensa a largura da barra de rolagem quando modais/menus estão abertos. | Ativo / Baixa (22 linhas) |
| `src/hooks/useFocusTrap.ts` | Hook / Acessibilidade | Prende o foco de tabulação (`Tab` / `Shift+Tab`) dentro de um container modal ativo e restaura o foco ao fechar. | Ativo / Média (66 linhas) |
| `src/hooks/useGaleria.ts` | Hook / Dados & Realtime | Consulta `public.galeria`, gerencia assinatura Realtime (`postgres_changes`), reconexão `online`/`offline` e polling de 60s. | Ativo / Alta (145 linhas) |
| `src/hooks/useMediaQuery.ts` | Hook / Responsividade | Escuta alterações em `window.matchMedia(query)` para controle de estado responsivo em JavaScript. | Ativo / Baixa (19 linhas) |
| `src/hooks/useScrolled.ts` | Hook / UI | Monitora `window.scrollY > threshold` para alternar o estilo visual do cabeçalho fixo. | Ativo / Baixa (14 linhas) |
| `src/components/ui/Button.tsx` | Componente UI | Componentes polimórficos `<Button>` e `<ButtonLink>` com variantes de estilo (`primary`, `light`, `forest`, `outline-light`, `outline-dark`, `ghost`). | Ativo com variantes não usadas / Baixa (64 linhas) |
| `src/components/ui/Logo.tsx` | Componente UI | Renderiza o símbolo vetorial `<LogoMark>` e a assinatura tipográfica `<Logo>` em versões clara/escura e compacta. | Ativo / Baixa (52 linhas) |
| `src/components/ui/Reveal.tsx` | Componente UI | Wrapper de animação *fade-in/translate-y* acionado na entrada da viewport via `IntersectionObserver`. | Ativo / Baixa (50 linhas) |
| `src/components/ui/SectionHeading.tsx` | Componente UI | Cabeçalho padronizado para seções com *eyebrow*, título `<h2>` fluido e descrição opcional. | Ativo / Baixa (65 linhas) |
| `src/components/layout/Header.tsx` | Layout / Navegação | Barra de navegação fixa com *skip link*, links de âncora ativos, botão de CTA e gaveta de menu mobile modal. | Ativo / Alta (247 linhas) |
| `src/components/layout/Footer.tsx` | Layout / Rodapé | Rodapé institucional com links rápidos, endereço, e-mails, aviso de protótipo/créditos e botão de retorno ao topo. | Ativo / Média (130 linhas) |
| `src/components/home/Hero.tsx` | Seção da Página | Seção inicial (`#inicio`) em tela cheia (`100svh`) com imagem de fundo prioritária, chamada principal, CTAs e resumo institucional. | Ativo / Média (117 linhas) |
| `src/components/home/AboutMuseum.tsx` | Seção da Página | Seção `#museu` com histórico institucional, citação do arqueólogo, indicadores numéricos e bloco `#hilmar` com biografia. | Ativo / Média (190 linhas) |
| `src/components/home/Collection.tsx` | Seção da Página | Seção `#acervo` com sistema de abas verticais acessíveis (`role="tablist"`) exibindo 6 categorias do acervo. | Ativo / Alta (215 linhas) |
| `src/components/home/Exhibitions.tsx` | Seção da Página | Seção `#exposicoes` destacando a mostra *Conhecer para Preservar*, o projeto *Salvaguarda* e agendamento escolar via `mailto:`. | Ativo / Média (206 linhas) |
| `src/components/home/Gallery.tsx` | Seção da Página | Seção `#galeria` com indicador de status Realtime, filtros por categoria, grade em colunas CSS, *skeleton* e estados de erro/vazio. | Ativo / Alta (363 linhas) |
| `src/components/home/GalleryLightbox.tsx` | Modal / Galeria | Portal modal (`createPortal`) para visualização ampliada de imagens da galeria com navegação por teclado (`←`, `→`, `Esc`). | Ativo / Média (152 linhas) |
| `src/components/home/Education.tsx` | Seção da Página | Seção `#educacao` detalhando públicos-alvo das ações educativas e botões de solicitação de visita em grupo. | Ativo / Média (138 linhas) |
| `src/components/home/Contribute.tsx` | Seção da Página | Seção `#contribua` explicando o que pode ser doado, limites de arquivos e incorporando `<ContributionForm />`. | Ativo / Média (132 linhas) |
| `src/components/home/ContributionForm.tsx` | Formulário Interativo | Formulário completo de envio de contribuições com máscara de telefone, *drag-and-drop*, pré-visualização, validação e tela de protocolo. | Ativo / Muito Alta (768 linhas) |
| `src/components/home/Visit.tsx` | Seção da Página | Seção `#visite` com endereço, link para Google Maps, horários, orientação para grupos, contatos e acessibilidade. | Ativo / Média (211 linhas) |
| `supabase/config.toml` | Configuração / BaaS | Configuração local da CLI do Supabase (portas, limites de storage de 50 MiB, `verify_jwt = false` para a função `enviar-contribuicao`). | Ativo / Baixa (38 linhas) |
| `supabase/migrations/20261102120000_museu_schema.sql` | Banco de Dados / SQL | Migração criando tabelas (`museu_administradores`, `galeria`, `contribuicoes`), triggers, índices, buckets, políticas RLS e publicação Realtime. | Ativo / Alta (273 linhas) |
| `supabase/functions/enviar-contribuicao/index.ts` | Backend / Edge Function | Endpoint serverless Deno que valida CORS, campos, *honeypot*, tempo de preenchimento, *rate limit* por IP e assinatura binária, salvando no Storage e DB. | Ativo / Muito Alta (560 linhas) |

---

# 3. Mapeamento de Páginas, Rotas e Fluxos de Usuário

O projeto não utiliza biblioteca de roteamento múltiplo (`react-router-dom` ou similar); opera como uma **Single-Page Application (SPA) baseada em navegação por âncoras (`#hash`)** renderizada integralmente em `src/App.tsx` (linhas 12–28).

| URL / Rota (Âncora) | Arquivo Fonte Principal | Componentes Utilizados | Estado Atual | Problemas Identificados na Seção / Rota |
| :--- | :--- | :--- | :--- | :--- |
| `/` ou `/#inicio` | `src/components/home/Hero.tsx` | `Header`, `Logo`, `Hero`, `ButtonLink` | Funcional | Imagem LCP (`/images/museu/museu-01.jpg`) sem `<link rel="preload">` no `index.html` e sem atributos `width`/`height` (linhas 12–17); textos de rodapé do Hero com contraste insuficiente `text-parchment/30` e `text-parchment/35` (linhas 73, 107). |
| `/#museu` e `/#hilmar` | `src/components/home/AboutMuseum.tsx` | `Reveal`, `SectionHeading` | Funcional | Nota de rodapé e selo lateral com baixo contraste `text-stone/55`, `text-stone/70` e `text-parchment/35` (linhas 48, 120, 179); imagens sem atributos `width`/`height` explícitos (linhas 28–33, 37–42); âncora secundária `#hilmar` (linha 157) não consta em `sectionIds` (`src/data/content.ts`, linha 25). |
| `/#acervo` | `src/components/home/Collection.tsx` | `Reveal`, `SectionHeading` | Funcional | Renderiza simultaneamente 6 painéis `<div role="tabpanel">` no DOM com imagens locais `.jpg` sem `srcset` ou formatos modernos WebP/AVIF (linhas 154–208); avisos em `text-[10px] text-parchment/28` (linhas 145, 201) são quase invisíveis (contraste ~2.1:1); trocar de aba não sincroniza o estado na URL (impossibilita compartilhar link direto para uma coleção). |
| `/#exposicoes` | `src/components/home/Exhibitions.tsx` | `Reveal`, `SectionHeading` | Funcional | O `<h2>` principal (`"Conhecer para preservar."`, linha 19) é idêntico ao `<h2>` de `Education.tsx` (linha 27) e ao `<h3>` da própria seção (linha 164), prejudicando a navegação semântica por cabeçalhos; botão de agendamento escolar (linha 182) recria estilização manual em vez de usar `<ButtonLink>`. |
| `/#galeria` | `src/components/home/Gallery.tsx` & `GalleryLightbox.tsx` | `Reveal`, `SectionHeading`, `GalleryCard`, `GallerySkeleton`, `GalleryLightbox` | Funcional (Requer Supabase para exibir fotos) | Sem fallback estático em produção caso o Supabase esteja indisponível; tags `<img>` nos cards (linhas 33–39) usam `h-auto w-full` sem `width`/`height` ou `aspect-ratio`, causando *Layout Shift* (CLS) na grade `columns-1 sm:columns-2 lg:columns-3` conforme carregam; `useGaleria` não pagina resultados (`.limit()`) e mantém polling de 60s mesmo com WebSocket Realtime ativo (`src/hooks/useGaleria.ts`, linhas 39–43, 120–122). |
| `/#educacao` | `src/components/home/Education.tsx` | `Reveal`, `SectionHeading`, `ButtonLink` | Funcional | Repete o mesmo título `<h2>` `"Conhecer para preservar."` (linha 27); legendas e créditos com contraste muito baixo `text-parchment/35` e `text-parchment/30` (linhas 52, 103, 127); no mobile, o `figcaption` com posicionamento absoluto `-bottom-5` (linha 121) sobrepõe a margem inferior da seção sem compensação no container pai. |
| `/#contribua` | `src/components/home/Contribute.tsx` & `ContributionForm.tsx` | `Reveal`, `SectionHeading`, `ContributionForm`, `Button`, `FieldError` | Funcional (Submissão requer Supabase + Edge Function) | `#contribua` não faz parte de `navItems` (`src/data/content.ts`, linhas 15–25), portanto o menu principal perde toda marcação de item ativo quando o usuário rola até esta seção; *dropzone* de arquivo (`ContributionForm.tsx`, linhas 554–663) não exibe contorno de foco ao navegar com `Tab`; `focusFirstError('arquivo')` foca uma `<div>` não interativa (linha 240); validação de tempo na Edge Function falha se o relógio do dispositivo do usuário estiver adiantado em relação ao servidor (`supabase/functions/enviar-contribuicao/index.ts`, linhas 358–367). |
| `/#visite` | `src/components/home/Visit.tsx` | `Reveal`, `SectionHeading` | Funcional | Textos auxiliares em `text-[9px] text-stone/50` e `text-[10px] text-stone/60` (linhas 149, 200) apresentam baixo contraste; o endereço aponta apenas para uma busca genérica no Google Maps (`visit.mapUrl` em `src/data/content.ts`, linha 39) sem coordenadas geográficas exatas (`geo` / `hasMap` no Schema.org). |

---

# 4. Análise Profunda por Dimensão Técnica (Com Citações de Arquivos e Linhas)

## 4.1. Arquitetura, Organização de Código e Dívida Técnica

1. **Duplicação Crítica e Divergência na Validação de Arquivos (Cliente vs. Edge Function):**
   - `src/lib/file-validation.ts` (linhas 21–90 e 122–240) e `supabase/functions/enviar-contribuicao/index.ts` (linhas 22–56 e 109–291) duplicam integralmente as tabelas `FORMAT_LABELS`, `EXTENSIONS`, `MIME_TYPES`, `CANONICAL_MIME` e as funções `ascii()`, `containsAscii()`, `detectFormat()`, `hasValidPdfEnding()` e `sanitizeFileName()`.
   - **Divergência Comportamental Real:** No navegador, `validateContributionFile()` verifica a integridade de imagens decodificando o bitmap via `createImageBitmap(file)` ou `new Image()` (`src/lib/file-validation.ts`, linhas 92–120). Já na Edge Function, `hasValidImageEnding()` (`supabase/functions/enviar-contribuicao/index.ts`, linhas 171–203) exige que arquivos PNG terminem **exatamente** nos últimos 12 bytes com o chunk `IEND` (`00 00 00 00 49 45 4E 44 AE 42 60 82`, linhas 191–202) e que arquivos WEBP tenham `riffSize === file.size - 8` (linha 179). Se um usuário anexar um PNG ou WEBP válido que possua bytes de *padding* ou metadados XMP ao final do arquivo, o navegador aprovará o arquivo na pré-validação (`createImageBitmap` ignora bytes após `IEND`), mas o servidor rejeitará o envio após o upload completo com erro 400 (`"A imagem parece estar corrompida ou incompleta"`).

2. **Código Morto, Estilos Órfãos e Estados Não Consumidos:**
   - `src/index.css` (linhas 89–92): A classe `.display-soft` está definida, mas não possui nenhuma referência em `src/`.
   - `src/index.css` (linhas 148–150): A classe utilitária `.balance` está definida e nunca é utilizada.
   - `src/index.css` (linhas 152–154 e 174–183): A classe `.animate-fade-up` e a keyframe `@keyframes fade-up` estão definidas e nunca são utilizadas.
   - `src/lib/utils.ts` (linhas 23–29): A função exportada `normalizeText(value: string)` não é importada em nenhum arquivo do repositório.
   - `src/lib/galeria.ts` (linhas 17–20): O tipo exportado `GaleriaRow` nunca é utilizado (a própria função `mapGaleriaRow` na linha 24 recebe `row: Record<string, unknown>`).
   - `src/hooks/useGaleria.ts` (linhas 12, 26, 51, 144): O estado `lastUpdated` é criado, atualizado a cada requisição e retornado pelo hook, mas `src/components/home/Gallery.tsx` (linha 104) o ignora completamente.
   - `src/components/ui/Button.tsx` (linhas 7–10, 18, 21–22): As variantes `'forest'`, `'outline-dark'` e `'ghost'` nunca são utilizadas no projeto, enquanto links com aparência de botão são estilizados manualmente em `src/components/home/Exhibitions.tsx` (linha 182), `src/components/home/Gallery.tsx` (linha 301), `src/components/home/ContributionForm.tsx` (linha 352) e `src/components/home/Visit.tsx` (linha 188).

3. **Acoplamento de Dados de Contato e Falta de Padronização de Ambiente:**
   - `src/lib/utils.ts` (linha 35) codifica diretamente a string `'mailto:museudeparauapebas@gmail.com,museu.secult@parauapebas.pa.gov.br'` em vez de consumir `visit.emails` de `src/data/content.ts` (linha 37).
   - `package.json` (linhas 1–32) não declara `"engines": { "node": ">=20.12.0" }`. Como o Vite `^8.3.5` (via `rolldown`) importa `styleText` de `node:util` (introduzido no Node.js 20.12.0), a execução em Node 18 falha imediatamente com `SyntaxError` sem aviso prévio do gerenciador de pacotes.
   - `scripts/qa.mjs` (linha 12) força `channel: 'msedge'` em `chromium.launch()`, quebrando a execução de `npm run qa` em ambientes Linux ou CI onde o Microsoft Edge não está instalado.

---

## 4.2. UI/UX, Design System e Responsividade

1. **Micro-tipografia Excessivamente Pequena em Telas Mobile e Desktop:**
   - O projeto utiliza tamanhos de fonte arbitrários abaixo de `10px` em dezenas de elementos informativos:
     - `8px` e `8.5px`: `src/components/ui/Logo.tsx` (linhas 40, 46), `src/components/home/Collection.tsx` (linha 180), `src/components/home/Gallery.tsx` (linhas 47, 63, 66, 76), `src/components/home/GalleryLightbox.tsx` (linhas 63, 143), `src/components/home/ContributionForm.tsx` (linhas 375, 583).
     - `9px` e `9.5px`: `src/components/home/Hero.tsx` (linhas 73, 82, 90, 98), `src/components/home/AboutMuseum.tsx` (linhas 43, 48), `src/components/home/Collection.tsx` (linhas 115, 201), `src/components/home/Gallery.tsx` (linhas 171, 215, 238, 251), `src/components/home/Visit.tsx` (linhas 188, 200).
   - Textos de `8px` a `9.5px` combinados com `uppercase` e `tracking-[0.18em]` a `tracking-[0.32em]` comprometem severamente a legibilidade.

2. **Comportamento de Navegação Ativa (`useActiveSection`) na Seção `#contribua`:**
   - Em `src/data/content.ts` (linhas 15–25), `navItems` contém 7 itens (`inicio`, `museu`, `acervo`, `exposicoes`, `galeria`, `educacao`, `visite`), omitindo `contribua` (que é renderizado como um botão CTA separado no `Header.tsx`, linhas 106–117).
   - Como `useActiveSection(sectionIds)` (`src/hooks/useActiveSection.ts`, linhas 31–37) só monitora `sectionIds`, quando o usuário está na seção `#contribua` (entre `#educacao` e `#visite`), o cabeçalho mantém `"Educação e Cultura"` sublinhado como seção ativa (`aria-current="location"`), gerando feedback espacial incorreto.

3. **Sobreposição Visual no `figcaption` de `Education.tsx`:**
   - Em `src/components/home/Education.tsx` (linha 121), o `<figcaption>` usa `className="absolute -bottom-5 left-4 right-4 ..."`, projetando-se `20px` (`-bottom-5`) para fora do `<figure>` sem que o container pai (linhas 110–133) adicione `pb-5` compensatório.

---

## 4.3. Performance e Otimização de Recursos

1. **Desperdício de Payload nas Fontes Variáveis (`Fraunces`):**
   - `src/main.tsx` (linhas 4–5) importa `@fontsource-variable/fraunces/full.css` e `@fontsource-variable/fraunces/full-italic.css`.
   - Os arquivos `full` incluem os 4 eixos variáveis da fonte (`opsz`, `wght`, `SOFT`, `WONK`), pesando **119 KB** (`fraunces-latin-full-normal.woff2`) + **147 KB** (`fraunces-latin-full-italic.woff2`) = **266 KB** apenas para o subset `latin` (além de 231 KB adicionais caso `latin-ext` seja acionado).
   - Porém, `src/index.css` (linhas 84–87) fixa `'SOFT' 0, 'WONK' 0` na classe `.display` (e `.display-soft` nas linhas 89–92 não é usada). Substituir `full.css` e `full-italic.css` por `opsz.css` (66 KB) e `opsz-italic.css` (80 KB) reduz imediatamente **120 KB (45%)** do peso de fontes na renderização crítica sem alterar um único pixel visual.

2. **Gargalos de LCP (Largest Contentful Paint) e Otimização de Imagens:**
   - `index.html` não declara `<link rel="preload" as="image" href="/images/museu/museu-01.jpg" fetchpriority="high" />`. O navegador só descobre a imagem principal do Hero (`src/components/home/Hero.tsx`, linhas 12–17) após baixar, parsear e executar os bundles JS e CSS.
   - As 10 imagens em `public/images/museu/` (`museu-01.jpg` a `museu-10.jpg`, `1280x720`, 892 KB no total) estão apenas em formato JPEG tradicional, sem conversão para **WebP** ou **AVIF** e sem variantes responsivas (`srcset` / `sizes`) para dispositivos móveis.

3. **Risco de CLS (Cumulative Layout Shift) na Galeria e Ausência de `width`/`height`:**
   - Nenhuma tag `<img>` em todo o projeto (`Hero.tsx` linha 12, `AboutMuseum.tsx` linhas 28 e 37, `Collection.tsx` linha 169, `Exhibitions.tsx` linha 37, `Gallery.tsx` linha 33, `GalleryLightbox.tsx` linha 105, `Education.tsx` linha 114, `Visit.tsx` linha 169) define os atributos HTML `width` e `height`.
   - Em `src/components/home/Gallery.tsx` (linhas 33–39 e 322), os cards usam `className="h-auto w-full object-cover"` dentro de um layout CSS multi-colunas (`columns-1 gap-5 sm:columns-2 lg:columns-3`). Como a altura intrínseca da imagem é desconhecida antes do download terminar, cada imagem que carrega redistribui os itens entre as 3 colunas, provocando saltos visuais severos (CLS).

4. **Re-renderizações e Sobrecarga de Rede no Hook `useGaleria`:**
   - `src/hooks/useGaleria.ts` (linhas 87–126) abre um canal WebSocket Realtime (`postgres_changes`), mas mantém simultaneamente um `window.setInterval` a cada 60 segundos (linhas 120–122) e um listener `visibilitychange` (linhas 116–118) que refazem o `SELECT` completo na tabela `galeria` mesmo quando o canal Realtime está com status `'SUBSCRIBED'` (`status === 'live'`).
   - Além disso, a query em `src/hooks/useGaleria.ts` (linhas 39–43) não possui `.limit()`, buscando todas as linhas publicadas de uma só vez.
   - Em `src/components/home/ContributionForm.tsx` (linha 164), `const validationErrors = buildErrors()` é recalculado em toda renderização (a cada tecla digitada em qualquer campo).

---

## 4.4. SEO e Descoberta

1. **URL Relativa em `og:image` e Metadados Sociais Incompletos (`index.html`):**
   - `index.html` (linha 23) define `<meta property="og:image" content="/images/museu/museu-01.jpg" />`. Pelo protocolo OpenGraph, caminhos relativos são inválidos e ignorados por scrapers do WhatsApp, Facebook, LinkedIn e X/Twitter, que exigem URL absoluta (`https://...`).
   - Faltam em `index.html` (linhas 16–25): `<link rel="canonical" ...>`, `<meta property="og:url" ...>`, `<meta property="og:site_name" ...>`, `<meta property="og:image:alt" ...>`, `<meta property="og:image:width" content="1280" />`, `<meta property="og:image:height" content="720" />`, `<meta name="twitter:title" ...>` e `<meta name="twitter:image" ...>`.

2. **Ausência de `robots.txt` e `sitemap.xml`:**
   - O diretório `public/` contém apenas `favicon.svg` e `images/`. Não existem `public/robots.txt` nem `public/sitemap.xml` para orientar mecanismos de busca.

3. **Dados Estruturados JSON-LD Incompletos (`index.html`, linhas 26–45):**
   - O bloco `@type: "Museum"` não inclui `url`, `image`, `isAccessibleForFree: true`, nem `openingHoursSpecification` (embora os horários de segunda a sexta 8h–18h e fim de semana 10h–16h estejam definidos em `src/data/content.ts`, linhas 31–32).

4. **Duplicação de Títulos Semânticos (`<h2>` / `<h3>`):**
   - `src/components/home/Exhibitions.tsx` (linha 19) e `src/components/home/Education.tsx` (linha 27) renderizam exatamente o mesmo `<h2>`: `"Conhecer para preservar."`, além do `<h3>` `"Conhecer para Preservar"` em `Exhibitions.tsx` (linha 164).

---

## 4.5. Acessibilidade (WCAG)

1. **Falhas Sistemáticas de Contraste de Cores (WCAG 2.1 Critério 1.4.3 — Nível AA):**
   - Diversos textos utilizam opacidades entre `25%` e `55%` que resultam em razões de contraste entre **1,8:1 e 2,6:1** (muito abaixo do mínimo de **4,5:1** exigido pela WCAG AA para textos pequenos):
     - `src/components/home/Collection.tsx` (linhas 116, 145, 196, 201): `text-parchment/25`, `text-parchment/28`, `text-parchment/30` sobre `bg-forest-deep` (`#102119`) → contraste ~2,0:1 a 2,2:1.
     - `src/components/home/Hero.tsx` (linhas 73, 107): `text-parchment/35` e `text-parchment/30` sobre `#102119` → contraste ~2,1:1 a 2,4:1.
     - `src/components/home/AboutMuseum.tsx` (linhas 48, 120, 179): `text-stone/55` e `text-stone/70` sobre `bg-parchment` (`#f7f1e7`), e `text-parchment/35` sobre `bg-forest` (`#1b3327`) → contraste ~2,2:1 a 2,6:1.
     - `src/components/home/Gallery.tsx` (linhas 66, 76, 251, 330): `text-stone/55`, `text-stone/45` e `text-stone/65` sobre `bg-parchment` (`#f7f1e7`) → a cor `--color-stone` (`#7d7466`) pura sobre `#f7f1e7` já possui contraste de **3,95:1** (insuficiente para texto `< 18pt`), e com opacidade `/45` cai para **~1,8:1**.
     - `src/components/layout/Footer.tsx` (linhas 37, 61, 86, 121): `text-parchment/40`, `text-parchment/45`, `text-parchment/35` sobre `bg-forest-deep`.

2. **Falta de Indicador Visual de Foco e Bug de Foco no Upload de Arquivo (`ContributionForm.tsx`):**
   - Em `src/components/home/ContributionForm.tsx` (linhas 554–565), o `<input id="arquivo" type="file" className="sr-only">` recebe o foco real quando o usuário navega com a tecla `Tab`. No entanto, a `<div>` visual da *dropzone* (linhas 624–662) não possui classes `peer-focus-visible:...` ou `focus-within:...` vinculadas ao input. Assim, **quando o usuário foca o campo de anexo via teclado, não há nenhum indicador visual de foco na tela** (violação direta da WCAG 2.4.7 *Focus Visible*).
   - Adicionalmente, em `focusFirstError` (`src/components/home/ContributionForm.tsx`, linhas 237–245), quando o primeiro campo inválido é `'arquivo'`, o código executa `dropzoneRef.current?.focus()` (uma `<div>` com `tabIndex={-1}`) em vez de `fileInputRef.current?.focus()`. Como a `<div>` não é um controle nativo nem tem handler de teclado `onKeyDown` para `Enter`/`Space`, o usuário fica com o foco preso em um elemento inerte que não abre o seletor de arquivos pelo teclado.

3. **Invisibilidade de Conteúdo com `prefers-reduced-motion: reduce` e Impressão (`Reveal.tsx`):**
   - `src/components/ui/Reveal.tsx` (linhas 12, 41–43) inicializa `visible = false`, aplicando `translate-y-5 opacity-0` até que o `IntersectionObserver` dispare na rolagem. Mesmo quando o usuário ativa `prefers-reduced-motion: reduce` (ou tenta imprimir a página com `Ctrl+P`), os blocos abaixo da dobra inicial permanecem com `opacity: 0` até serem rolados. `Reveal.tsx` deveria iniciar `visible = true` caso `window.matchMedia('(prefers-reduced-motion: reduce)').matches` seja verdadeiro.

4. **Isolamento Modal Incompleto no Menu Mobile (`Header.tsx`):**
   - Em `src/components/layout/Header.tsx` (linhas 158–243), quando `#menu-mobile` (`role="dialog" aria-modal="true"`) está aberto, o `<header>` superior continua visível e interativo, mas fora do `panelRef` controlado pelo `useFocusTrap` (linha 23), e os elementos `<main id="conteudo">` e `<footer>` não recebem atributo `inert` ou `aria-hidden="true"`.

---

## 4.6. Segurança e Confiabilidade

1. **Bug Crítico de Rejeição por Diferença de Relógio (*Clock Skew*) no Anti-Bot (`ContributionForm.tsx` & Edge Function):**
   - `src/components/home/ContributionForm.tsx` (linha 102) captura `const formStartedAt = useRef(Date.now())` usando o **relógio local do navegador do usuário** e o envia no campo `form_started_at` (`src/lib/contribuicao.ts`, linha 64).
   - `supabase/functions/enviar-contribuicao/index.ts` (linhas 358–367) calcula `const elapsed = Date.now() - formStartedAt` usando o **relógio UTC do servidor Deno** e bloqueia o envio se `elapsed < 2500` (2,5 segundos).
   - **Impacto:** Se o relógio do computador ou celular do cidadão estiver apenas **1 minuto adiantado** em relação ao relógio do servidor (situação comum em dispositivos domésticos), `Date.now() [servidor] - formStartedAt [cliente]` resultará em um valor negativo (ex.: `-25000 < 2500`), fazendo com que o servidor rejeite 100% das tentativas daquele usuário com a mensagem enganosa `"Não foi possível validar o envio. Recarregue a página e tente novamente."`.

2. **Leitura de Payload Completo Antes do Rate Limit e Spoofing de IP na Edge Function (`supabase/functions/enviar-contribuicao/index.ts`):**
   - **Ordem de Execução Vulnerável a DoS (linhas 460–490):** A função executa `const form = await request.formData()` (carregando até 17 MB em RAM) na linha 460 e `await validateFile(fields.arquivo)` na linha 462 **antes** de consultar o *rate limit* por IP no banco de dados (linhas 471–489). Além disso, na linha 491 (`new Uint8Array(await fields.arquivo.arrayBuffer())`), duplica o buffer do arquivo em memória. A verificação de *rate limit* por IP deve ocorrer **no início de `handleRequest`**, antes de ler o corpo `multipart/form-data`.
   - **Spoofing de `X-Forwarded-For` (linhas 405–413):** `getClientIp()` prioriza `request.headers.get('x-forwarded-for')?.split(',')[0].trim()` antes de `cf-connecting-ip`. O primeiro IP de `X-Forwarded-For` pode ser forjado pelo cliente caso o proxy intermediário apenas concatene o IP real ao final da lista, permitindo burlar o limite de 5 envios por 10 minutos. Deve-se priorizar `cf-connecting-ip` (cabeçalho imutável da infraestrutura Cloudflare/Supabase) ou o último IP confiável.
   - **Bypass de `ALLOWED_ORIGINS` sem cabeçalho `Origin` (linhas 103–107):** `if (!origin) return true` permite que requisições automatizadas via scripts/cURL (que não enviam header `Origin`) ignorem completamente a restrição `ALLOWED_ORIGINS`.

3. **Falha Silenciosa na Detecção de `service_role` em `src/lib/supabase.ts` (linhas 6–20):**
   - `readJwtRole(key)` decodifica o payload base64url do JWT fazendo `atob(payload)` (linha 12) após substituir `-` e `_`, mas **sem restaurar o padding `=`** quando `payload.length % 4 !== 0`.
   - Em navegadores onde `atob()` exige comprimento múltiplo de 4, `atob(payload)` lança exceção, o bloco `catch` retorna `null` (linha 15), e `usesSecretKey` (linha 20) avalia como `false` para um JWT `service_role` que não comece com `sb_secret_`, desativando silenciosamente a trava de segurança que impede o vazamento da chave secreta no frontend.

4. **Ausência de Headers de Segurança e CSP:**
   - Não há política de `Content-Security-Policy` (CSP), `Referrer-Policy` ou configurações de headers HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`) em `index.html` ou em arquivos de deploy.

---

# 5. Matriz de Problemas Encontrados (Bugs, Gargalos e Más Práticas)

| ID | Severidade | Categoria | Arquivo e Linhas | Descrição Técnica do Problema | Impacto no Usuário / Negócio |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **AUD-01** | **Alta** | Segurança / Confiabilidade | `src/components/home/ContributionForm.tsx` (L102, L283)<br>`supabase/functions/enviar-contribuicao/index.ts` (L8, L318, L358–367) | O cálculo de tempo mínimo de preenchimento (`elapsed = Date.now() - formStartedAt`) subtrai um timestamp gerado pelo relógio do cliente do timestamp do servidor. | Usuários com o relógio do dispositivo adiantado em poucos segundos/minutos têm seus envios permanentemente bloqueados com erro 400. |
| **AUD-02** | **Alta** | Segurança / DoS | `supabase/functions/enviar-contribuicao/index.ts` (L405–413, L460–492) | O *rate limit* por IP só é verificado **após** fazer o parse completo de `request.formData()` (até 17 MB) e validar o arquivo; além disso, `getClientIp` prioriza `x-forwarded-for[0]` (falsificável) sobre `cf-connecting-ip`. | Atacantes podem esgotar a memória da Edge Function enviando arquivos grandes repetidamente ou burlar o *rate limit* forjando `X-Forwarded-For`. |
| **AUD-03** | **Alta** | Arquitetura / Bug de Validação | `src/lib/file-validation.ts` (L92–120)<br>`supabase/functions/enviar-contribuicao/index.ts` (L171–203) | Duplicação de 200+ linhas de validação de arquivo com lógica divergente: o cliente valida imagens via `createImageBitmap`, enquanto o servidor exige bytes finais estritos (`IEND` nos últimos 12 bytes para PNG e `riffSize` exato para WEBP). | Uma imagem PNG/WEBP com metadados extras passa na validação instantânea do formulário, mas falha no servidor após o upload completo. |
| **AUD-04** | **Alta** | Acessibilidade (WCAG AA) | `src/components/home/ContributionForm.tsx` (L237–245, L554–565, L624–662) | O `<input id="arquivo" className="sr-only">` não projeta estilo `focus-visible` na *dropzone* visual; e `focusFirstError('arquivo')` foca `dropzoneRef` (`<div tabIndex={-1}>`) em vez de `fileInputRef`. | Usuários de teclado não enxergam onde está o foco ao tabular pelo campo de anexo e não conseguem abrir o seletor de arquivos após erro de validação. |
| **AUD-05** | **Alta** | Acessibilidade (WCAG AA) | `src/index.css` (L20)<br>`src/components/home/Collection.tsx` (L116, L145, L201)<br>`src/components/home/Gallery.tsx` (L66, L76, L251, L330)<br>`src/components/home/Hero.tsx` (L73, L107)<br>`src/components/layout/Footer.tsx` (L37, L61, L86, L121) | Uso generalizado de opacidades baixas (`text-parchment/25` a `/40` sobre `#102119` e `text-stone/45` a `/70` sobre `#f7f1e7`), gerando contrastes entre 1,8:1 e 2,6:1 (mínimo WCAG AA: 4,5:1). | Textos secundários, datas, contadores e créditos fotográficos ficam ilegíveis para pessoas com baixa visão ou em telas com brilho reduzido. |
| **AUD-06** | **Média** | Segurança | `src/lib/supabase.ts` (L6–20) | `readJwtRole` chama `atob(payload)` sem normalizar o padding `=` da string base64url. Se `atob` lançar erro, retorna `null` e ignora a verificação `keyRole === 'service_role'`. | Uma chave `service_role` formato JWT cujo payload não tenha tamanho múltiplo de 4 não será detectada pela trava de segurança do cliente. |
| **AUD-07** | **Média** | SEO / Social | `index.html` (L16–45)<br>`public/` | `og:image` usa URL relativa (`/images/museu/museu-01.jpg`); faltam `canonical`, `og:url`, `robots.txt`, `sitemap.xml` e `openingHoursSpecification` no JSON-LD. | Links compartilhados no WhatsApp/redes sociais podem não exibir miniatura e buscadores carecem de sitemap e metadados canônicos. |
| **AUD-08** | **Média** | Performance (Fontes & CSS) | `src/main.tsx` (L4–5)<br>`src/index.css` (L84–92) | Importa `fraunces/full.css` e `full-italic.css` (266 KB latin woff2) por causa da classe `.display-soft`, que é código morto; o site usa apenas o eixo `opsz` (146 KB). | Download desnecessário de **120 KB** de fontes bloqueantes/críticas no carregamento inicial. |
| **AUD-09** | **Média** | Performance (LCP & CLS) | `index.html` (L3–8)<br>`src/components/home/Hero.tsx` (L12–17)<br>`src/components/home/Gallery.tsx` (L33–39, L322)<br>`public/images/museu/*.jpg` | Ausência de `<link rel="preload">` para a imagem do Hero; imagens apenas em `.jpg` sem WebP/AVIF; ausência de atributos `width`/`height` em todas as tags `<img>`, causando CLS no layout multi-colunas da Galeria. | Piora direta nas métricas Core Web Vitals (LCP mais lento em conexões móveis e CLS elevado ao carregar a galeria). |
| **AUD-10** | **Média** | Performance / Escalabilidade | `src/hooks/useGaleria.ts` (L39–43, L87–126) | Consulta à tabela `galeria` sem `.limit()` e execução simultânea de WebSocket Realtime + `setInterval` de 60s + refetch em `visibilitychange`. | Tráfego redundante no Supabase e degradação de renderização conforme o número de fotos publicadas crescer. |
| **AUD-11** | **Média** | Acessibilidade / Print | `src/components/ui/Reveal.tsx` (L10–49) | Elementos iniciam com `opacity-0` mesmo quando `prefers-reduced-motion: reduce` está ativo ou ao imprimir a página, dependendo exclusivamente do scroll para disparar o `IntersectionObserver`. | Seções abaixo da dobra saem em branco na impressão e piscam/ocultam conteúdo para usuários com redução de movimento. |
| **AUD-12** | **Baixa** | UI/UX & Navegação | `src/data/content.ts` (L15–25)<br>`src/hooks/useActiveSection.ts` (L3–58) | A seção `#contribua` (e `#hilmar`) não está incluída no rastreamento de `useActiveSection`, mantendo `#educacao` marcada como ativa enquanto o usuário preenche o formulário de contribuição. | Indicador visual de localização (`aria-current="location"`) impreciso no cabeçalho durante o uso do formulário. |
| **AUD-13** | **Baixa** | SEO / Semântica | `src/components/home/Exhibitions.tsx` (L19, L164)<br>`src/components/home/Education.tsx` (L27) | Três cabeçalhos de seção/subseção (`<h2>` e `<h3>`) possuem exatamente o mesmo texto `"Conhecer para preservar"`. | Ambiguidade para leitores de tela que listam cabeçalhos da página. |
| **AUD-14** | **Baixa** | Manutenibilidade / Código Morto | `src/index.css` (L89–92, L148–154, L174–183)<br>`src/lib/utils.ts` (L23–29)<br>`src/lib/galeria.ts` (L17–20)<br>`src/hooks/useGaleria.ts` (L26)<br>`src/components/ui/Button.tsx` (L7–10) | Presença de classes CSS, funções utilitárias, tipos TypeScript, estados de hook e variantes de botão declarados mas nunca utilizados. | Ruído cognitivo e aumento desnecessário da superfície de manutenção. |
| **AUD-15** | **Baixa** | DX / Ambiente & QA | `package.json` (L1–32)<br>`scripts/qa.mjs` (L12) | Falta de `"engines": { "node": ">=20.12.0" }` no `package.json`, ausência de script de lint/typecheck isolado e `channel: 'msedge'` fixo no Playwright. | Falha imediata ao rodar em Node 18 e impossibilidade de rodar `npm run qa` em máquinas Linux sem Microsoft Edge instalado. |

---

# 6. Plano Diretor de Melhorias (Roadmap Priorizado para as Próximas Etapas)

## Fase 1 — Correções Críticas e Quick Wins (Impacto Imediato)

1. **Corrigir Validação Anti-Bot sem Dependência de Sincronia de Relógio (`AUD-01`):**
   - **Arquivos afetados:** `src/components/home/ContributionForm.tsx`, `src/lib/contribuicao.ts`, `supabase/functions/enviar-contribuicao/index.ts`.
   - **Ação:** Substituir o envio do timestamp absoluto `form_started_at` pelo envio da duração decorrida medida no cliente via relógio monotônico (`Math.round(performance.now() - formOpenedPerfNow)`) ou aplicar tolerância a *clock skew* no servidor, eliminando falsos positivos causados por relógios desajustados.

2. **Blindar a Edge Function `enviar-contribuicao` (`AUD-02`):**
   - **Arquivo afetado:** `supabase/functions/enviar-contribuicao/index.ts`.
   - **Ação:** Mover a verificação de *rate limit* por IP para **antes** de `await request.formData()`; alterar `getClientIp()` para priorizar `cf-connecting-ip` em vez de `x-forwarded-for`; e exigir `Origin` válido quando `ALLOWED_ORIGINS` estiver configurado.

3. **Corrigir `readJwtRole` com Padding Base64url (`AUD-06`):**
   - **Arquivo afetado:** `src/lib/supabase.ts`.
   - **Ação:** Normalizar o padding `=` da string base64url antes de chamar `atob()`, garantindo que qualquer JWT `service_role` seja sempre detectado e bloqueado no navegador.

4. **Otimizar Carregamento das Fontes Variáveis e Limpar Código Morto (`AUD-08`, `AUD-14`):**
   - **Arquivos afetados:** `src/main.tsx`, `src/index.css`, `src/lib/utils.ts`, `src/lib/galeria.ts`, `src/hooks/useGaleria.ts`.
   - **Ação:** Trocar `@fontsource-variable/fraunces/full.css` e `full-italic.css` por `opsz.css` e `opsz-italic.css` (economia imediata de 120 KB) e remover `.display-soft`, `.balance`, `.animate-fade-up`, `normalizeText`, `GaleriaRow` e `lastUpdated`.

5. **Corrigir Foco de Teclado na Dropzone de Arquivos (`AUD-04`):**
   - **Arquivo afetado:** `src/components/home/ContributionForm.tsx`.
   - **Ação:** Adicionar classe `peer` ao `<input id="arquivo" type="file" className="peer sr-only">` e estilizar o container da *dropzone* com `peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-copper`; ajustar `focusFirstError('arquivo')` para focar `fileInputRef.current?.focus()`.

---

## Fase 2 — Refatoração Estrutural, UI/UX e Performance

1. **Elevar Contraste de Cores e Escala Tipográfica Mínima para Conformidade WCAG AA (`AUD-05`):**
   - **Arquivos afetados:** `src/index.css`, `src/components/home/*.tsx`, `src/components/layout/Footer.tsx`.
   - **Ação:** Ajustar `--color-stone` e substituir opacidades críticas (`text-parchment/25`, `/28`, `/30`, `/35` e `text-stone/45`, `/55`) por valores com contraste mínimo de **4,5:1** (`text-parchment/70` sobre `#102119` e `text-stone` ajustado sobre `#f7f1e7`), além de estabelecer `10.5px`–`11px` como piso tipográfico do design system.

2. **Eliminar CLS na Galeria e Otimizar Imagens e LCP (`AUD-09`):**
   - **Arquivos afetados:** `index.html`, `public/images/museu/*`, `src/components/home/Hero.tsx`, `src/components/home/Gallery.tsx`, `src/components/home/AboutMuseum.tsx`, `src/components/home/Collection.tsx`, `src/components/home/Exhibitions.tsx`, `src/components/home/Education.tsx`, `src/components/home/Visit.tsx`.
   - **Ação:** Adicionar `<link rel="preload" as="image" href="/images/museu/museu-01.jpg" fetchpriority="high" />` em `index.html`; adicionar `width="1280" height="720"` em todas as imagens locais; definir proporção mínima/placeholder nos cards de `Gallery.tsx`; e gerar versões `.webp` otimizadas.

3. **Unificar Validação de Arquivos e Otimizar Hook `useGaleria` (`AUD-03`, `AUD-10`):**
   - **Arquivos afetados:** `src/lib/file-validation.ts`, `supabase/functions/enviar-contribuicao/index.ts`, `src/hooks/useGaleria.ts`.
   - **Ação:** Alinhar as regras de validação de final de arquivo entre cliente e Edge Function; adicionar paginação/limite (`.limit(50)`) na query de `useGaleria.ts`; e desativar o `setInterval` de 60s enquanto o canal Realtime estiver com status `'live'`.

4. **Aprimorar `Reveal.tsx`, `Header.tsx` e Rastreamento de Seção Ativa (`AUD-11`, `AUD-12`):**
   - **Arquivos afetados:** `src/components/ui/Reveal.tsx`, `src/components/layout/Header.tsx`, `src/data/content.ts`, `src/hooks/useActiveSection.ts`.
   - **Ação:** Inicializar `Reveal` como visível se `prefers-reduced-motion: reduce` estiver ativo; incluir `contribua` no mapeamento de seções ativas para destacar o botão `"Contribua"` no cabeçalho quando a seção estiver visível; e corrigir o espaçamento inferior do `<figcaption>` em `Education.tsx`.

---

## Fase 3 — Evolução, SEO Avançado e Escalabilidade

1. **SEO Técnico Completo e Metadados Sociais (`AUD-07`, `AUD-13`):**
   - **Arquivos afetados:** `index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/components/home/Education.tsx`.
   - **Ação:** Criar `public/robots.txt` e `public/sitemap.xml`; configurar URL absoluta para `og:image`, `og:url` e `<link rel="canonical">`; enriquecer o JSON-LD com `openingHoursSpecification`, `image`, `isAccessibleForFree` e coordenadas `geo`; e diferenciar os títulos `<h2>` entre `Exhibitions.tsx` e `Education.tsx`.

2. **Sincronização de Estado na URL (Deep Linking para Acervo e Galeria):**
   - **Arquivos afetados:** `src/components/home/Collection.tsx`, `src/components/home/Gallery.tsx`.
   - **Ação:** Sincronizar a aba selecionada do acervo (`?acervo=xikrin`) e o filtro/foto aberta da galeria (`?categoria=...&foto=...`) com `URLSearchParams` (`window.history.replaceState`), permitindo que visitantes, pesquisadores e professores compartilhem links diretos para categorias específicas ou fotografias do acervo.

3. **Padronização de Engenharia, CI e Testes E2E (`AUD-15`):**
   - **Arquivos afetados:** `package.json`, `scripts/qa.mjs`.
   - **Ação:** Adicionar `"engines": { "node": ">=20.12.0" }` e script `"typecheck": "tsc -b"` em `package.json`; configurar fallback automático para o Chromium padrão no `scripts/qa.mjs` quando o canal `'msedge'` não estiver disponível no sistema operacional.

