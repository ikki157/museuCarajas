# Auditoria e Mapeamento Exaustivo de Acessibilidade — WCAG 2.1 / 2.2 (Níveis A, AA e AAA), WAI-ARIA 1.2 & eMAG

**Portal Auditado:** Museu Municipal Hilmar Harry Kluck (`museuCarajas`)  
**Data da Auditoria:** 04/11/2026  
**Escopo Técnico:** 100% dos arquivos de código-fonte (`index.html`, `src/index.css`, `src/App.tsx`, `src/data/content.ts`, `src/hooks/useFocusTrap.ts`, `src/lib/contribuicao.ts`, `src/components/layout/*.tsx`, `src/components/ui/*.tsx` e `src/components/home/*.tsx`), cruzados com análise de luminância relativa por pixel nas fotografias do acervo (`public/images/museu/museu-01.jpg` a `museu-10.jpg`).  
**Modo de Execução:** **Somente-Leitura Estrito (`READ-ONLY`)** sobre o código-fonte. Nenhum arquivo `.tsx`, `.ts`, `.css` ou `.html` foi modificado durante este mapeamento.

---

# 1. Resumo Executivo de Conformidade WCAG 2.1 / 2.2

## 1.1. Nível de Conformidade Atual
- **Status Global WCAG 2.1 / 2.2 Nível A:** **Parcialmente Conforme** *(6 desvios remanescentes em restauração de foco, campos obrigatórios sem atributo semântico `required`/`aria-required`, ícone decorativo sem `aria-hidden="true"` e ocultação de status de carregamento por `aria-hidden="true"` ancestral)*.
- **Status Global WCAG 2.1 / 2.2 Nível AA:** **Não Conforme** *(33 desvios ativos distribuídos entre contraste de texto sobre imagem/fundos intermediários — Critério 1.4.3, contraste não-textual de bordas de inputs/botões e anel de foco — Critério 1.4.11, micro-tipografia em `px` fixo / truncamento — Critério 1.4.4/1.4.10, ocultação parcial sob header fixo — Critério 2.4.11, supressão de foco no card de protocolo — Critério 2.4.7 e alvos de toque `< 24×24px` — Critério 2.5.8)*.
- **Status Global WCAG 2.1 / 2.2 Nível AAA:** **Não Conforme** *(o uso estético de `--color-stone` `#635B4F` sobre `--color-parchment` `#F7F1E7` atinge **5,95:1**, aprovando com folga o Nível AA `4,5:1`, mas abaixo do limiar AAA `7,0:1`; além disso, 7 links externos abrem nova aba sem aviso prévio — Critério 3.2.5)*.

> **Nota sobre Evolução Pós-Sprints 1–3:** As intervenções anteriores elevaram `--color-stone` de `#7D7466` (`4,12:1`) para `#635B4F` (`5,95:1` sobre `parchment`), eliminaram todas as fontes `< 11px` (`8px`–`10px`), corrigiram o foco da dropzone (`peer-focus-visible`), sincronizaram `Reveal.tsx` com `prefers-reduced-motion` na montagem inicial e diferenciaram os títulos `<h2>` entre `Exhibitions.tsx` e `Education.tsx`. Este relatório mapeia **100% dos desvios residuais e de borda** que ainda impedem a certificação **100% WCAG 2.2 Nível AA / eMAG**.

## 1.2. Resumo Quantitativo de Desvios por Princípio (POUR)

| Princípio WCAG | Crítica | Alta | Média | Baixa | Total de Desvios |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Perceptível** *(Contraste 1.4.3 / 1.4.11, Imagens 1.1.1, Tipografia/Zoom/Reflow 1.4.4 / 1.4.10)* | 3 | 12 | 9 | 4 | **28** |
| **2. Operável** *(Teclado 2.1.1, Foco 2.4.1 / 2.4.3 / 2.4.7 / 2.4.11, Movimento 2.3.3, Alvos 2.5.8)* | 2 | 5 | 5 | 2 | **14** |
| **3. Compreensível** *(Rótulos/Instruções 3.3.2, Prevenção/Erros 3.3.1 / 3.3.3, Mudança de Contexto 3.2.5)* | 0 | 2 | 3 | 2 | **7** |
| **4. Robusto** *(Nome/Função/Valor 4.1.2, Isolamento `inert` de Modais, Status `aria-busy`/`aria-live` 4.1.3)* | 1 | 3 | 2 | 1 | **7** |
| **TOTAL CONSOLIDADO** | **6** | **22** | **19** | **9** | **56** |

---

# 2. Auditoria Matemática Completa de Cores e Contraste (Critérios 1.4.3, 1.4.6 e 1.4.11)

A luminância relativa $L$ de cada cor foi calculada segundo a fórmula oficial do W3C:
$$L = 0{,}2126 \times R_{lin} + 0{,}7152 \times G_{lin} + 0{,}0722 \times B_{lin}$$
onde $C_{lin} = \frac{C_{sRGB}}{12{,}92}$ se $C_{sRGB} \le 0{,}04045$, ou $\left(\frac{C_{sRGB} + 0{,}055}{1{,}055}\right)^{2{,}4}$ caso contrário, e a razão de contraste é $CR = \frac{L_{maior} + 0{,}05}{L_{menor} + 0{,}05}$. Para cores com canal alfa $\alpha$ sobre fundo sólido, aplicou-se composição alfa exata $C_{out} = \text{round}(\alpha \cdot C_{fg} + (1 - \alpha) \cdot C_{bg})$.

## 2.1. Tabela da Paleta Base (`src/index.css`, linhas 7–21)

| Token (`@theme`) | Hex | Luminância ($L$) | vs `parchment` (`#F7F1E7`, $L=0{,}8845$) | vs `cream` (`#FBF7EF`, $L=0{,}9326$) | vs `sand` (`#EDE2D0`, $L=0{,}7695$) | vs `sand-deep` (`#DDCCB2`, $L=0{,}6177$) | vs `forest` (`#1B3327`, $L=0{,}0275$) | vs `forest-deep` (`#102119`, $L=0{,}0127$) | vs `forest-soft` (`#274534`, $L=0{,}0494$) | vs `ink` (`#17231C`, $L=0{,}0147$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `--color-parchment` | `#F7F1E7` | `0.8845` | 1,00:1 | 1,05:1 | 1,14:1 | 1,40:1 | **12,06:1 (AAA)** | **14,91:1 (AAA)** | **9,41:1 (AAA)** | **14,45:1 (AAA)** |
| `--color-cream` | `#FBF7EF` | `0.9326` | 1,05:1 | 1,00:1 | 1,20:1 | 1,47:1 | **12,68:1 (AAA)** | **15,68:1 (AAA)** | **9,89:1 (AAA)** | **15,19:1 (AAA)** |
| `--color-sand` | `#EDE2D0` | `0.7695` | 1,14:1 | 1,20:1 | 1,00:1 | 1,23:1 | **10,58:1 (AAA)** | **13,07:1 (AAA)** | **8,25:1 (AAA)** | **12,67:1 (AAA)** |
| `--color-sand-deep` | `#DDCCB2` | `0.6177` | 1,40:1 | 1,47:1 | 1,23:1 | 1,00:1 | **8,62:1 (AAA)** | **10,65:1 (AAA)** | **6,72:1 (AA)** | **10,32:1 (AAA)** |
| `--color-ink` | `#17231C` | `0.0147` | **14,45:1 (AAA)** | **15,19:1 (AAA)** | **12,67:1 (AAA)** | **10,32:1 (AAA)** | 1,20:1 | 1,03:1 | 1,54:1 | 1,00:1 |
| `--color-forest` | `#1B3327` | `0.0275` | **12,06:1 (AAA)** | **12,68:1 (AAA)** | **10,58:1 (AAA)** | **8,62:1 (AAA)** | 1,00:1 | 1,24:1 | 1,28:1 | 1,20:1 |
| `--color-forest-deep` | `#102119` | `0.0127` | **14,91:1 (AAA)** | **15,68:1 (AAA)** | **13,07:1 (AAA)** | **10,65:1 (AAA)** | 1,24:1 | 1,00:1 | 1,59:1 | 1,03:1 |
| `--color-forest-soft` | `#274534` | `0.0494` | **9,41:1 (AAA)** | **9,89:1 (AAA)** | **8,25:1 (AAA)** | **6,72:1 (AA)** | 1,28:1 | 1,59:1 | 1,00:1 | 1,54:1 |
| `--color-moss` | `#5D7052` | `0.1452` | **4,79:1 (AA)** | **5,03:1 (AA)** | 4,20:1 (AA Grande) | 3,42:1 (AA Grande) | 2,52:1 (Falha) | 3,11:1 (AA Grande) | 1,97:1 (Falha) | 3,02:1 (AA Grande) |
| `--color-clay` | `#A34D2B` | `0.1327` | **5,12:1 (AA)** | **5,38:1 (AA)** | **4,49:1 (Falha AA Normal)** | 3,66:1 (AA Grande) | 2,36:1 (Falha) | 2,91:1 (Falha) | 1,84:1 (Falha) | 2,82:1 (Falha) |
| `--color-clay-dark` | `#833C21` | `0.0817` | **7,10:1 (AAA)** | **7,46:1 (AAA)** | **6,22:1 (AA)** | **5,07:1 (AA)** | 1,70:1 (Falha) | 2,10:1 (Falha) | 1,33:1 (Falha) | 2,04:1 (Falha) |
| `--color-copper` | `#B87333` | `0.2269` | 3,37:1 (AA Grande) | 3,55:1 (AA Grande) | **2,96:1 (Falha Total)** | 2,41:1 (Falha) | 3,57:1 (AA Grande) | 4,42:1 (AA Grande) | 2,79:1 (Falha) | 4,28:1 (AA Grande) |
| `--color-copper-light`| `#D9A06A` | `0.4093` | 2,03:1 (Falha) | 2,14:1 (Falha) | 1,78:1 (Falha) | 1,45:1 (Falha) | **5,93:1 (AA)** | **7,33:1 (AAA)** | **4,62:1 (AA)** | **7,10:1 (AAA)** |
| `--color-stone` | `#635B4F` | `0.1070` | **5,95:1 (AA)** | **6,26:1 (AA)** | **5,22:1 (AA)** | 4,25:1 (AA Grande) | 2,03:1 (Falha) | 2,50:1 (Falha) | 1,58:1 (Falha) | 2,43:1 (Falha) |
| `--color-line` | `#D8CBB8` | `0.6077` | **1,42:1 (Falha)** | **1,49:1 (Falha)** | **1,25:1 (Falha)** | 1,02:1 (Falha) | **8,49:1 (AAA)** | **10,49:1 (AAA)** | **6,62:1 (AA)** | **10,17:1 (AAA)** |

---

## 2.2. Mapeamento Exaustivo de Todas as Violações de Contraste por Arquivo e Linha

### A. Violações de Contraste de Texto (Critério 1.4.3 — Nível AA: Mínimo `4,5:1` Texto Normal / `3,0:1` Texto Grande)

| ID | Arquivo | Linha(s) | Elemento / Contexto | Classe Atual (Texto + Fundo) | Cor Efetiva Calculada (Hex) | Contraste Atual | Mínimo Exigido (WCAG AA) | Classe Corrigida Sugerida (e Novo Contraste) |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **WCAG-C01** | `src/index.css` *(aplicado em `ContributionForm.tsx` L432, L453, L474, L494, L545)* | **102** | `.input-base` (`::placeholder` dos 5 campos de texto do formulário) | `placeholder:text-stone/80` sobre `bg-cream` (`#FBF7EF`) | `#817A6F` sobre `#FBF7EF` | **3,97:1** | **4,5:1** | `placeholder:text-stone` (`#635B4F` → **6,26:1**, AA) |
| **WCAG-C02** | `src/components/home/Hero.tsx` | **75** | Legenda vertical lateral `<p>` (`"Parauapebas • Pará • Amazônia Oriental • Brasil"`) sobre lateral direita iluminada de `museu-01.jpg` | `text-parchment/70` sobre gradiente `rgba(16,33,25,0.20)` + foto `museu-01.jpg` | `#CDD2C9` sobre fundo médio `#9CA79C` (p10 `#B3BDB2`) | **1,72:1** *(mediana 1,98:1)* | **4,5:1** | `rounded-sm bg-forest-deep/75 px-2 py-3 text-parchment/90 backdrop-blur-xs` (`#E7E3DA` sobre `#2C3B33` → **9,64:1**, AAA) |
| **WCAG-C03** | `src/components/home/Hero.tsx` | **47** | Parágrafo `<p>` de subtítulo do Hero em viewport mobile (`< 640px`), onde o texto se estende sobre a metade direita clara de `museu-01.jpg` | `text-parchment/72` sobre gradiente mobile `rgba(16,33,25,0.35)` + foto `museu-01.jpg` | `#C7CBC3` sobre região clara `#889389` | **2,28:1** *(mínimo local)* | **4,5:1** | Alterar `text-parchment/72` para `text-parchment/90` **e** elevar o ponto intermediário do gradiente em `Hero.tsx` L23 de `rgba(16,33,25,0.68) 55%, rgba(16,33,25,0.2) 100%` para `rgba(16,33,25,0.82) 60%, rgba(16,33,25,0.58) 100%` (**6,85:1**, AA) |
| **WCAG-C04** | `src/components/home/Hero.tsx` | **84, 92, 100** | 3 rótulos `<p>` (`"Localização"`, `"Horário de visitação"`, `"Entrada"`) na barra inferior do Hero sobre `museu-01.jpg` | `text-copper-light` (`#D9A06A`) sobre `bg-forest-deep/35` + foto `museu-01.jpg` | `#D9A06A` sobre pixels médios `#606C63` | **2,88:1** *(mediana 4,67:1)* | **4,5:1** | Na barra `Hero.tsx` L80, substituir `bg-forest-deep/35` por `bg-forest-deep/75` (`#D9A06A` sobre `#25352D` → **5,48:1**, AA) |
| **WCAG-C05** | `src/components/ui/SectionHeading.tsx` *(invocado em `Exhibitions.tsx` L19 e `Contribute.tsx` L18)* | **37** | `<p className="eyebrow">` nas seções com fundo `bg-sand` (`#EDE2D0`): `"Programação Cultural"` e `"Memória Participativa"` | `text-clay` (`#A34D2B`) sobre `bg-sand` (`#EDE2D0`) | `#A34D2B` sobre `#EDE2D0` | **4,49:1** *(exato `4,489:1`)* | **4,5:1** | Em `SectionHeading.tsx` L37, substituir `text-clay` por `text-clay-dark` (`#833C21` sobre `#EDE2D0` → **6,22:1**, AA; sobre `#F7F1E7` → **7,10:1**, AAA) |
| **WCAG-C06** | `src/components/ui/SectionHeading.tsx` *(invocado em `Contribute.tsx` L18)* | **41** | `<span className="text-xs font-medium tracking-[0.2em] text-clay">` (`"Acervo Colaborativo • Envio Digital"`) | `text-clay` (`#A34D2B`) sobre `bg-sand` (`#EDE2D0`) | `#A34D2B` sobre `#EDE2D0` | **4,49:1** | **4,5:1** | Substituir `text-clay` por `text-clay-dark` (`#833C21` → **6,22:1**, AA) |
| **WCAG-C07** | `src/components/home/Exhibitions.tsx` | **51** | Sobretítulo `<p>` (`"Exposição de Longa Duração"`) dentro do `<figcaption>` sobre a foto `museu-05.jpg` | `text-copper-light` (`#D9A06A`) sobre `bg-gradient-to-t from-forest-deep/60 via-transparent` + `museu-05.jpg` | `#D9A06A` sobre painel branco da foto `#B7B3AC` | **1,26:1** *(mediana 3,34:1)* | **4,5:1** | Em `Exhibitions.tsx` L48, substituir `from-forest-deep/60 via-transparent` por `from-forest-deep/95 via-forest-deep/45` e adicionar `bg-forest-deep/85 p-4 backdrop-blur-xs` no `<figcaption>` L50 (**7,12:1**, AAA) |
| **WCAG-C08** | `src/components/home/Exhibitions.tsx` | **54** | Descrição `<p>` do `<figcaption>` sobre a foto `museu-05.jpg` | `text-parchment/80` sobre `from-forest-deep/60 via-transparent` + `museu-05.jpg` | `#DFDCD4` sobre `#8F8D86` | **2,44:1** *(mediana 5,32:1)* | **4,5:1** | Substituir `text-parchment/80` por `text-parchment/95` com fundo `bg-forest-deep/85` no `<figcaption>` L50 (**12,40:1**, AAA) |
| **WCAG-C09** | `src/components/home/Exhibitions.tsx` | **143** | Link `<a>` (`"Contribuir com esta mostra"`) sobre fundo `bg-sand` (`#EDE2D0`) | `text-clay` (`#A34D2B`) sobre `bg-sand` (`#EDE2D0`) | `#A34D2B` sobre `#EDE2D0` | **4,49:1** | **4,5:1** | Substituir `text-clay transition hover:text-clay-dark` por `text-clay-dark transition hover:text-forest` (`#833C21` → **6,22:1**, AA) |
| **WCAG-C10** | `src/components/home/Gallery.tsx` | **249, 273** | Contador numérico `<span className="ml-1.5 opacity-80">` dentro dos botões de filtro inativos (`"Todas"`, categorias) | `opacity-80` herdando `text-stone` (`#635B4F`) sobre `bg-parchment` (`#F7F1E7`, e `hover:bg-cream` `#FBF7EF`) | `#81796D` sobre `#F7F1E7` | **3,82:1** | **4,5:1** | Remover `opacity-80` em L249 e L273: `<span className="ml-1.5">` (`#635B4F` sobre `#F7F1E7` → **5,95:1**, AA; sobre `#1B3327` quando ativo → `#F7F1E7` **12,06:1**, AAA) |
| **WCAG-C11** | `src/components/home/Contribute.tsx` | **62, 72, 110** | 2 subtítulos `<p>` (`"O que você pode enviar"`, `"Categorias do acervo"`) e 1 link `<a>` (`"Dúvidas? Fale com a equipe pelo WhatsApp"`) sobre `bg-sand` | `text-clay` (`#A34D2B`) sobre `bg-sand` (`#EDE2D0`) | `#A34D2B` sobre `#EDE2D0` | **4,49:1** | **4,5:1** | Substituir `text-clay` por `text-clay-dark` nas linhas 62, 72 e 110 (`#833C21` → **6,22:1**, AA) |
| **WCAG-C12** | `src/components/home/ContributionForm.tsx` | **395** | Mensagem de erro `<p>` no banner de falha de envio (`role="alert"`) | `text-clay/90` sobre `bg-clay/5` em `bg-cream` (`#F7EEE5`) | `#AB5D3E` sobre `#F7EEE5` | **4,19:1** | **4,5:1** | Substituir `text-clay/90` por `text-clay-dark` (`#833C21` sobre `#F7EEE5` → **6,95:1**, AA/AAA) |
| **WCAG-C13** | `src/components/home/ContributionForm.tsx` | **400** | Detalhe técnico `<p className="mt-2 font-mono text-[11px] leading-relaxed text-clay/85">` no banner de erro | `text-clay/85` sobre `bg-clay/5` em `bg-cream` (`#F7EEE5`) | `#B06547` sobre `#F7EEE5` | **3,82:1** | **4,5:1** | Substituir `text-clay/85` por `text-clay-dark` (`#833C21` sobre `#F7EEE5` → **6,95:1**, AA) |
| **WCAG-C14** | `src/components/home/ContributionForm.tsx` | **720** | Banner de resumo de erros de validação (`"Verifique os campos destacados..."`) | `text-clay/90` sobre `bg-clay/5` em `bg-cream` (`#F7EEE5`) | `#AB5D3E` sobre `#F7EEE5` | **4,19:1** | **4,5:1** | Substituir `text-clay/90` por `text-clay-dark` (`#833C21` sobre `#F7EEE5` → **6,95:1**, AA) |
| **WCAG-C15** | `src/components/home/Visit.tsx` | **183** | Sobretítulo `<p>` (`"Localização Oficial"`) sobre a foto `museu-02.jpg` | `text-copper-light` (`#D9A06A`) sobre `from-forest-deep/80 via-transparent` + `museu-02.jpg` | `#D9A06A` sobre `#787C73` (região a ~33% da base onde `via-transparent` atua) | **2,29:1** *(mediana 2,54:1)* | **4,5:1** | Em `Visit.tsx` L180, substituir `from-forest-deep/80 via-transparent to-transparent` por `from-forest-deep/95 via-forest-deep/70 to-transparent` (**6,45:1**, AA) |
| **WCAG-C16** | `src/components/home/Visit.tsx` | **184** | Título/endereço `<p>` sobre a foto `museu-02.jpg` | `text-parchment/85` sobre `from-forest-deep/80 via-transparent` + `museu-02.jpg` | `#E3DFD6` sobre `#676C63` | **4,28:1** *(mínimo local)* | **4,5:1** | Com o gradiente corrigido (`from-forest-deep/95 via-forest-deep/70`) e `text-parchment/95`, o contraste sobe para **10,85:1** (AAA) |

---

### B. Violações de Contraste Não-Textual — Bordas de Controles, Indicadores de Foco e Estados (Critério 1.4.11 — Nível AA: Mínimo `3,0:1`)

| ID | Arquivo | Linha(s) | Elemento / Contexto | Classe Atual (Borda/Indicador + Fundo) | Cor Efetiva Calculada (Hex) | Contraste Atual | Mínimo Exigido (WCAG AA) | Classe Corrigida Sugerida (e Novo Contraste) |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **WCAG-C17** | `src/index.css` | **55** | Indicador universal de foco `:focus-visible` (`outline: 2px solid var(--color-copper)`) quando acionado sobre seções `bg-sand` (`Exhibitions.tsx`, `Contribute.tsx`) ou `bg-parchment` | `--color-copper` (`#B87333`) sobre `bg-sand` (`#EDE2D0`) | `#B87333` sobre `#EDE2D0` | **2,96:1** | **3,0:1** | Usar `outline: 2px solid var(--color-clay);` (`#A34D2B` → **4,49:1** em `sand` e **5,12:1** em `parchment`) e adicionar regra para fundos escuros `.bg-forest :focus-visible, .bg-forest-deep :focus-visible { outline-color: var(--color-copper-light); }` (`#D9A06A` → **5,93:1** a **7,33:1**) |
| **WCAG-C18** | `src/index.css` *(aplicado em `ContributionForm.tsx` L432, L453, L474, L494, L510, L545)* | **102** | Borda padrão de campos de formulário `.input-base` (sem sombra ou fundo contrastante que delimite a caixa em relação ao card `bg-cream`) | `border-line` (`#D8CBB8`) em `bg-cream` (`#FBF7EF`) | `#D8CBB8` sobre `#FBF7EF` | **1,49:1** | **3,0:1** | Substituir `border-line` por `border-stone/75` (`#7D7466` sobre `#FBF7EF` → **3,95:1**, AA) ou `border-stone` (`#635B4F` → **6,26:1**) |
| **WCAG-C19** | `src/components/ui/Button.tsx` | **13** | Borda de botão variante `outline` (`"Programar visita"`, `"Acervo digital"`) sobre fundo escuro | `border-parchment/30` sobre `bg-forest-deep` (`#102119`) | `#556057` sobre `#102119` | **2,42:1** | **3,0:1** | Substituir `border-parchment/30` por `border-parchment/50` (`#848980` sobre `#102119` → **4,48:1**, AA; sobre `#1B3327` → **3,96:1**, AA) |
| **WCAG-C20** | `src/components/ui/Button.tsx` | **15** | Borda de botão variante `ghost` sobre fundo claro | `border-ink/20` sobre `bg-parchment` (`#F7F1E7`) | `#CAC8C0` sobre `#F7F1E7` | **1,49:1** | **3,0:1** | Substituir `border-ink/20` por `border-ink/55` (`#7C8079` sobre `#F7F1E7` → **3,34:1**, AA) |
| **WCAG-C21** | `src/components/layout/Header.tsx` | **132, 155, 201** | Borda dos botões `"Agendar visita"`, botão hambúrguer mobile (no topo escuro) e botão `"Fechar"` do modal mobile | `border-parchment/25` (L132, L201) e `border-parchment/20` (L155) sobre `bg-forest-deep` (`#102119`) | `#4A554C` (`25%`) e `#3E4B42` (`20%`) sobre `#102119` | **2,15:1** e **1,90:1** | **3,0:1** | Substituir `border-parchment/25` e `border-parchment/20` por `border-parchment/50` (**4,48:1**, AA) |
| **WCAG-C22** | `src/components/layout/Header.tsx` | **133, 156** | Borda do botão `"Agendar visita"` e botão hambúrguer mobile quando o header está rolado (`scrolled === true`, fundo `bg-parchment/95`) | `border-ink/20` (L133) e `border-ink/25` (L156) sobre `bg-parchment` (`#F7F1E7`) | `#CAC8C0` (`20%`) e `#BFBDBA` (`25%`) sobre `#F7F1E7` | **1,49:1** e **1,66:1** | **3,0:1** | Substituir `border-ink/20` e `border-ink/25` por `border-ink/55` (**3,34:1**, AA) |
| **WCAG-C23** | `src/components/home/Exhibitions.tsx` | **185** | Borda do botão `"Solicitar agendamento"` no card de visitas mediadas | `border-forest/25` sobre `bg-parchment` (`#F7F1E7`) | `#C0C2B9` sobre `#F7F1E7` | **1,59:1** | **3,0:1** | Substituir `border-forest/25` por `border-forest/60` (`#737F74` sobre `#F7F1E7` → **3,39:1**, AA) |
| **WCAG-C24** | `src/components/home/Gallery.tsx` | **17** | Ponto indicador de status (`dot`) no modo `"Catálogo Curatorial"` | `bg-stone/50` sobre `bg-cream` (`#FBF7EF`) | `#AFABA3` sobre `#FBF7EF` | **2,23:1** | **3,0:1** | Substituir `bg-stone/50` por `bg-stone` (`#635B4F` sobre `#FBF7EF` → **6,26:1**, AA) |
| **WCAG-C25** | `src/components/home/Gallery.tsx` | **245, 269** | Borda dos botões de filtro de categoria não selecionados (`aria-pressed="false"`) | `border-line` (`#D8CBB8`) sobre `bg-parchment` (`#F7F1E7`) | `#D8CBB8` sobre `#F7F1E7` | **1,42:1** | **3,0:1** | Substituir `border-line` por `border-stone/75` (`#7D7466` sobre `#F7F1E7` → **3,75:1**, AA) |
| **WCAG-C26** | `src/components/home/Gallery.tsx` | **329** | Borda do botão `"Enviar primeira contribuição"` no estado vazio da galeria | `border-forest/25` sobre `bg-cream` (`#FBF7EF`) | `#C3C5BD` sobre `#FBF7EF` | **1,62:1** | **3,0:1** | Substituir `border-forest/25` por `border-forest/60` (`#758077` sobre `#FBF7EF` → **3,57:1**, AA) |
| **WCAG-C27** | `src/components/home/GalleryLightbox.tsx` | **85, 98, 126** | Borda dos 3 botões do Lightbox (`"Fechar"`, `"Foto anterior"`, `"Próxima foto"`) | `border-parchment/25` sobre `bg-forest-deep/95` (`#102119`) | `#4A554C` sobre `#102119` | **2,15:1** | **3,0:1** | Substituir `border-parchment/25` por `border-parchment/50` (`#848980` → **4,48:1**, AA) |
| **WCAG-C28** | `src/components/home/ContributionForm.tsx` | **356** | Borda do botão `"Enviar outra contribuição"` na tela de protocolo | `border-forest/25` sobre `bg-cream` (`#FBF7EF`) | `#C3C5BD` sobre `#FBF7EF` | **1,62:1** | **3,0:1** | Substituir `border-forest/25` por `border-forest/60` (**3,57:1**, AA) |
| **WCAG-C29** | `src/components/home/ContributionForm.tsx` | **641, 642** | Borda tracejada da dropzone de upload de arquivo (estado normal e estado de erro) | `border-line` (`#D8CBB8`, L642) e `border-clay/50` (`#CD9F89`, L641) sobre `bg-parchment` (`#F7F1E7`) | `#D8CBB8` (`1,42:1`) e `#CD9F89` (`2,10:1`) sobre `#F7F1E7` | **1,42:1** e **2,10:1** | **3,0:1** | Substituir `border-line` por `border-stone/75` (**3,75:1**) e `border-clay/50` por `border-clay` (**5,12:1**) |
| **WCAG-C30** | `src/components/home/Visit.tsx` | **191** | Borda do botão `"Abrir mapa interativo"` sobre `museu-02.jpg` | `border-parchment/35` sobre `bg-forest-deep` (`#102119`) | `#616A61` sobre `#102119` | **2,99:1** | **3,0:1** | Substituir `border-parchment/35` por `border-parchment/55` (`#8F948B` sobre `#102119` → **5,02:1**, AA) |

---

# 3. Mapeamento de Micro-Tipografia, Zoom e Reflow (Critérios 1.4.4, 1.4.10 e 1.4.12)

## 3.1. Diagnóstico de Micro-Tipografia (`text-[11px]` e `text-[11.5px]` em `px` Absoluto)
- **Ocorrências `< 11px` (`8px`, `8.5px`, `9px`, `9.5px`, `10px`):** **0 ocorrências** no estado atual do código (foram convertidas para `text-[11px]` na Sprint 2).
- **Problema Residual de Acessibilidade Tipográfica (WCAG 1.4.4 Resize Text & Legibilidade de Caixa-Alta):** Existem **91 ocorrências** de `text-[11px]` (mais `.eyebrow` em `src/index.css` L98) e **3 ocorrências** de `text-[11.5px]`.
  1. Ao utilizar valores arbitrários em **pixels absolutos (`11px`)** em vez de unidades relativas (`rem`, como `text-xs` = `0.75rem` = `12px`), o texto fica no limite inferior de legibilidade e dificulta a adaptação proporcional às preferências de fonte do navegador.
  2. Em **39 dessas ocorrências**, `text-[11px]` é aplicado a **parágrafos de leitura contínua, legendas descritivas, notas jurídicas (LGPD) e mensagens de ajuda de formulário**, onde o padrão editorial acessível (eMAG / WCAG) recomenda no mínimo `text-xs` (`0.75rem` / `12px`).

### Tabela Completa de Ocorrências de Micro-Tipografia (`11px` / `11.5px`) e Truncamento

| Arquivo | Linha | Contexto / Elemento | Classe Atual | Substituição Recomendada |
| :--- | :---: | :--- | :--- | :--- |
| `src/index.css` | **98** | Classe utilitária `.eyebrow` | `@apply text-[11px] font-semibold uppercase tracking-[0.26em];` | `@apply text-xs font-semibold uppercase tracking-[0.22em];` (`0.75rem`) |
| `src/components/ui/Logo.tsx` | **40** | Título primário da marca | `text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80` | `text-xs font-semibold uppercase tracking-[0.18em] opacity-90` |
| `src/components/ui/Logo.tsx` | **46** | Subtítulo da marca | `mt-1 text-[11px] font-medium uppercase tracking-[0.2em] opacity-75` | `mt-1 text-xs font-medium uppercase tracking-[0.16em] opacity-85` |
| `src/components/ui/Button.tsx` | **7** | Classe `baseClasses` de todos os botões | `... text-[11.5px] font-semibold uppercase tracking-[0.16em] ...` | `... text-xs font-semibold uppercase tracking-[0.14em] ...` |
| `src/components/layout/Header.tsx` | **105** | Links de navegação desktop | `relative py-2 text-[11px] font-semibold uppercase tracking-[0.13em] ...` | `relative py-2 text-xs font-semibold uppercase tracking-[0.12em] ...` |
| `src/components/layout/Header.tsx` | **130** | CTA `"Agendar visita"` no header | `... text-[11px] font-semibold uppercase tracking-[0.14em] ...` | `... text-xs font-semibold uppercase tracking-[0.12em] ...` |
| `src/components/layout/Header.tsx` | **201** | Botão `"Fechar"` do menu mobile | `... text-[11px] font-semibold uppercase tracking-[0.14em] ...` | `... text-xs font-semibold uppercase tracking-[0.12em] ...` |
| `src/components/layout/Header.tsx` | **217** | Índice numérico `01`–`07` do menu mobile | `w-6 text-[11px] font-medium tabular-nums tracking-wider text-parchment/70` | `w-6 text-xs font-medium tabular-nums tracking-wider text-parchment/75` |
| `src/components/layout/Header.tsx` | **238** | Rótulo `"Explorar seção"` no menu mobile | `text-[11px] font-semibold uppercase tracking-[0.16em]` | `text-xs font-semibold uppercase tracking-[0.14em]` |
| `src/components/home/Hero.tsx` | **75** | Assinatura geográfica vertical | `text-[11px] font-semibold uppercase leading-[2.2] tracking-[0.28em] ...` | `text-xs font-semibold uppercase leading-[2.2] tracking-[0.22em] ...` |
| `src/components/home/Hero.tsx` | **84, 92, 100** | 3 rótulos dos cards informativos do Hero | `text-[11px] font-semibold uppercase tracking-[0.2em] text-copper-light` | `text-xs font-semibold uppercase tracking-[0.16em] text-copper-light` |
| `src/components/home/Hero.tsx` | **109** | Barra de crédito institucional inferior do Hero | `flex flex-col gap-2 text-[11px] text-parchment/70 ...` | `flex flex-col gap-2 text-xs text-parchment/80 ...` |
| `src/components/home/AboutMuseum.tsx` | **49** | Legenda `<figcaption>` da foto secundária | `bg-parchment px-3 py-2.5 text-[11px] leading-snug text-stone` | `bg-parchment px-3 py-2.5 text-xs leading-snug text-stone` |
| `src/components/home/AboutMuseum.tsx` | **54** | Assinatura vertical `"Patrimônio Cultural..."` | `... text-[11px] font-semibold uppercase tracking-[0.28em] text-stone sm:block` | `... text-xs font-semibold uppercase tracking-[0.22em] text-stone sm:block` |
| `src/components/home/AboutMuseum.tsx` | **93** | Rodapé `<footer>` da citação | `mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone` | `mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-stone` |
| `src/components/home/AboutMuseum.tsx` | **105, 111, 117** | 3 legendas de marcos históricos (`2001`, `2023`, `4 eixos`) | `mt-2 text-[11px] leading-snug text-stone` | `mt-2 text-xs leading-snug text-stone` |
| `src/components/home/AboutMuseum.tsx` | **126** | Descrição do endereço oficial | `text-[11px] leading-relaxed text-stone` | `text-xs leading-relaxed text-stone` |
| `src/components/home/AboutMuseum.tsx` | **133** | Link `"Abrir no Maps"` | `... text-[11px] font-semibold uppercase tracking-[0.13em] text-clay ...` | `... text-xs font-semibold uppercase tracking-[0.12em] text-clay ...` |
| `src/components/home/AboutMuseum.tsx` | **149** | Link `"Explorar linhas de acervo"` | `... text-[11px] font-semibold uppercase tracking-[0.16em] text-forest ...` | `... text-xs font-semibold uppercase tracking-[0.14em] text-forest ...` |
| `src/components/home/AboutMuseum.tsx` | **185** | Nota de rodapé dos pilares de atuação | `mt-6 border-t border-parchment/15 pt-5 text-[11px] leading-relaxed text-parchment/70` | `mt-6 border-t border-parchment/15 pt-5 text-xs leading-relaxed text-parchment/75` |
| `src/components/home/Collection.tsx` | **88** | Link `"Consultar galeria digital"` | `... text-[11px] font-semibold uppercase tracking-[0.16em] text-copper-light ...` | `... text-xs font-semibold uppercase tracking-[0.14em] text-copper-light ...` |
| `src/components/home/Collection.tsx` | **134** | Numeração `01`–`04` nas abas do acervo | `text-[11px] font-medium tabular-nums tracking-[0.18em] transition-colors` | `text-xs font-medium tabular-nums tracking-[0.14em] transition-colors` |
| `src/components/home/Collection.tsx` | **164** | Instrução de teclado abaixo das abas | `mt-5 max-w-sm text-[11px] leading-relaxed text-parchment/70` | `mt-5 max-w-sm text-xs leading-relaxed text-parchment/75` |
| `src/components/home/Collection.tsx` | **202** | Badge sobre a fotografia da coleção | `... text-[11px] font-semibold uppercase tracking-[0.16em] text-parchment/90 ...` | `... text-xs font-semibold uppercase tracking-[0.14em] text-parchment/90 ...` |
| `src/components/home/Collection.tsx` | **218** | Contador `01 / 04` do painel de coleção | `... text-[11px] tabular-nums tracking-[0.16em] text-parchment/70 sm:block` | `... text-xs tabular-nums tracking-[0.14em] text-parchment/75 sm:block` |
| `src/components/home/Collection.tsx` | **223** | Nota de salvaguarda no rodapé do painel | `mt-5 text-[11px] leading-relaxed text-parchment/70` | `mt-5 text-xs leading-relaxed text-parchment/75` |
| `src/components/home/Exhibitions.tsx` | **51** | Sobretítulo na legenda da foto principal | `text-[11px] font-semibold uppercase tracking-[0.2em] text-copper-light` | `text-xs font-semibold uppercase tracking-[0.16em] text-copper-light` |
| `src/components/home/Exhibitions.tsx` | **86** | Link `"Agendar visita em grupo"` | `... text-[11px] font-semibold uppercase tracking-[0.16em] text-forest ...` | `... text-xs font-semibold uppercase tracking-[0.14em] text-forest ...` |
| `src/components/home/Exhibitions.tsx` | **107, 162** | Datas/períodos das mostras temporárias | `text-[11px] font-medium tabular-nums tracking-[0.2em] text-stone` | `text-xs font-medium tabular-nums tracking-[0.16em] text-stone` |
| `src/components/home/Exhibitions.tsx` | **136** | Nota de chamada pública de fotografias | `mt-6 border-l border-clay/40 pl-4 text-[11px] leading-relaxed text-stone` | `mt-6 border-l border-clay/40 pl-4 text-xs leading-relaxed text-stone` |
| `src/components/home/Exhibitions.tsx` | **143** | Link `"Contribuir com esta mostra"` | `... text-[11px] font-semibold uppercase tracking-[0.16em] text-clay-dark ...` | `... text-xs font-semibold uppercase tracking-[0.14em] text-clay-dark ...` |
| `src/components/home/Exhibitions.tsx` | **185, 192** | Botões `"Solicitar agendamento"` e `"Conhecer programa educativo"` | `... text-[11px] font-semibold uppercase tracking-[0.14em] ...` | `... text-xs font-semibold uppercase tracking-[0.12em] ...` |
| `src/components/home/Gallery.tsx` | **45** | Fallback `"Imagem indisponível"` | `text-[11px] uppercase tracking-[0.16em]` | `text-xs uppercase tracking-[0.14em]` |
| `src/components/home/Gallery.tsx` | **49** | Badge `"Curadoria"` sobre o card | `... text-[11px] font-semibold uppercase tracking-[0.14em] text-parchment/90 ...` | `... text-xs font-semibold uppercase tracking-[0.12em] text-parchment/90 ...` |
| `src/components/home/Gallery.tsx` | **65, 68, 78** | Categoria, data e crédito de autoria do card | `text-[11px] ...` | `text-xs ...` |
| `src/components/home/Gallery.tsx` | **197, 242, 266, 279** | Badge de status, botões de filtro e contador de registros | `text-[11px] ...` | `text-xs ...` |
| `src/components/home/Gallery.tsx` | **303, 306, 329, 365** | `<summary>`, diagnóstico técnico, CTA vazio e rodapé da galeria | `text-[11px] ...` | `text-xs ...` |
| `src/components/home/GalleryLightbox.tsx` | **63, 76, 117, 141, 146** | Categoria, contador, erro de imagem, autoria e dica de teclado no Lightbox | `text-[11px] ...` | `text-xs ...` |
| `src/components/home/Education.tsx` | **52, 65, 103, 130** | Rodapé da citação, índice `01`–`04`, nota de acessibilidade e nota de agendamento | `text-[11px] ...` | `text-xs ...` |
| `src/components/home/Contribute.tsx` | **62, 72, 85, 110** | Subtítulos, nota legal de curadoria/LGPD e link de WhatsApp | `text-[11px] ...` | `text-xs ...` |
| `src/components/home/ContributionForm.tsx` | **331, 339, 356, 379, 400, 528, 547, 587, 593, 600, 609, 617, 661, 690, 735, 763** | Textos auxiliares, protocolo, ajuda de campos, ações de arquivo, consentimento LGPD (`11.5px` em L356 e L690) e status | `text-[11px]` / `text-[11.5px]` | `text-xs` (`0.75rem`) |
| `src/components/home/Visit.tsx` | **42, 56, 72, 79, 88, 99, 115, 136, 149, 191, 203** | Títulos `<h3>` dos cards de serviço, links, notas de agendamento e legenda do mapa | `text-[11px] ...` | `text-xs ...` |
| `src/components/layout/Footer.tsx` | **24, 108, 121** | Links `"Planejar visita"`, `"Voltar ao topo"` e barra de direitos autorais | `text-[11px] ...` | `text-xs ...` |

---

## 3.2. Problemas de Truncamento de Texto e Reflow em `320px` / `200% Zoom` (Critérios 1.4.4 e 1.4.10)

- **[WCAG-T01 | Critério 1.4.4 Resize Text & 1.4.10 Reflow — Nível AA | Severidade: Média]**
  - **Arquivo e Linha:** `src/components/home/GalleryLightbox.tsx` (linha 68)
  - **Trecho de Código Atual:** `<h2 id="lightbox-title" className="display mt-1 truncate text-lg font-medium text-parchment sm:text-xl">`
  - **Diagnóstico:** A classe `truncate` (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) corta títulos longos de obras ou contribuições em telas estreitas (`320px`–`375px`) ou com zoom de `200%`, **mesmo dentro do modal de visualização detalhada (Lightbox)**, impedindo que o usuário leia o título completo da fotografia em qualquer lugar da interface.
  - **Correção Exata Recomendada:** Remover `truncate` para permitir quebra de linha natural até 2 linhas (`line-clamp-2 sm:line-clamp-none` ou quebra livre):
    ```tsx
    <h2 id="lightbox-title" className="display mt-1 text-lg font-medium leading-snug text-parchment sm:text-xl">
    ```

- **[WCAG-T02 | Critério 1.4.4 Resize Text — Nível AA | Severidade: Baixa]**
  - **Arquivo e Linha:** `src/components/home/Gallery.tsx` (linha 74)
  - **Trecho de Código Atual:** `<p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-stone">`
  - **Diagnóstico:** Em cartões cujo registro é um documento PDF (`isPdf === true` em `Gallery.tsx` L29), o botão de abrir o Lightbox não é renderizado (apenas o link direto para o PDF). Assim, se a descrição do documento tiver mais de 2 linhas, o trecho truncado por `line-clamp-2` nunca pode ser lido integralmente pelo usuário visual.
  - **Correção Exata Recomendada:** Adicionar `title={item.descricao}` ao `<p>` na linha 74 ou remover `line-clamp-2` quando `isPdf` for verdadeiro (`className={`mt-1.5 text-[12.5px] leading-relaxed text-stone ${isPdf ? '' : 'line-clamp-2'}`}`).

- **Verificação de `Education.tsx` (linha 65 e linha 69):**
  - Na versão atual pós-Sprint 2, o container na linha 61 utiliza `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`, separando o número `<span className="text-[11px] ...">` (linha 65) do título `<h3>` (linha 69) sem posicionamento `absolute` conflitante. Portanto, não há colisão física entre o número `01`–`04` e o `<h3>` em `320px`.

---

# 4. Navegação por Teclado, Gestão de Foco, Movimento e Alvos de Toque (Princípio 2 — Operável)

## 4.1. Critérios 2.4.1 (Bypass Blocks — Nível A) & 2.4.11 (Focus Not Obscured Minimum — WCAG 2.2 Nível AA)

- **[WCAG-K01 | Critério 2.4.1 Bypass Blocks — Nível A | Severidade: Alta]**
  - **Arquivo e Linha:** `src/App.tsx` (linha 16) e `src/components/layout/Header.tsx` (linhas 67–72)
  - **Trecho de Código Atual:**
    - `Header.tsx` L67: `<a href="#conteudo" className="sr-only focus:not-sr-only ...">Pular para o conteúdo principal</a>`
    - `App.tsx` L16: `<main id="conteudo">`
  - **Diagnóstico:** O elemento `<main id="conteudo">` não possui `tabIndex={-1}` nem `className="outline-none"`. Em navegadores baseados em WebKit/Safari e em combinações com leitores de tela quando o usuário aciona o link `"Pular para o conteúdo principal"`, o rolamento visual pode ocorrer, mas o foco programático (`document.activeElement`) permanece no próprio link ou falha em transferir o ponto de partida de tabulação de forma consistente sem `tabIndex={-1}`.
  - **Correção Exata Recomendada:** Em `src/App.tsx` (linha 16), alterar para:
    ```tsx
    <main id="conteudo" tabIndex={-1} className="outline-none">
    ```

- **[WCAG-K02 | Critério 2.4.11 Focus Not Obscured (Minimum) — WCAG 2.2 Nível AA | Severidade: Média]**
  - **Arquivo e Linha:** `src/index.css` (linhas 31–33 e 68–75) e seções com ID de ancoragem (`Hero.tsx` L11, `AboutMuseum.tsx` L12, `Collection.tsx` L75, `Exhibitions.tsx` L16, `Gallery.tsx` L184, `Education.tsx` L11, `Contribute.tsx` L15, `Visit.tsx` L18)
  - **Trecho de Código Atual:**
    ```css
    html {
      scroll-behavior: smooth;
      scroll-padding-top: 5.25rem;
    }
    ```
  - **Diagnóstico:** Embora `scroll-padding-top: 5.25rem` (`84px`) esteja definido em `html`, quando o usuário navega por `Tab` de baixo para cima (`Shift + Tab`) para elementos interativos próximos ao topo da viewport, alguns navegadores ignoram `scroll-padding-top` do `html` se o próprio elemento focado ou a `<section>` não possuir `scroll-margin-top` explícito, fazendo com que o `<header className="fixed inset-x-0 top-0 z-50">` (`76px`–`84px` de altura) cubra parcialmente o elemento focado.
  - **Correção Exata Recomendada:** Adicionar em `src/index.css` dentro de `@layer base`:
    ```css
    section[id],
    main[id],
    a,
    button,
    input,
    select,
    textarea,
    [tabindex]:not([tabindex='-1']) {
      scroll-margin-top: 5.75rem;
    }
    ```

---

## 4.2. Critérios 2.1.1 (Keyboard — Nível A), 2.4.3 (Focus Order — Nível A) & 2.4.7 (Focus Visible — Nível AA)

- **[WCAG-K03 | Critério 2.4.3 Focus Order & 2.1.1 Keyboard — Nível A | Severidade: Crítica]**
  - **Arquivo e Linha:** `src/components/layout/Header.tsx` (linhas 46–48 e linha 153) em conjunto com `src/hooks/useFocusTrap.ts` (linha 63)
  - **Trecho de Código Atual:**
    - `Header.tsx` L47: `if (event.key === 'Escape') setMenuOpen(false);`
    - `Header.tsx` L153: `menuOpen && 'pointer-events-none invisible'` (aplicado ao `<button ref={toggleRef}>`)
    - `useFocusTrap.ts` L63: `previouslyFocused?.focus?.();` (executado no cleanup do `useEffect`)
  - **Diagnóstico:** Quando o menu mobile está aberto (`menuOpen === true`), o botão de abertura `<button ref={toggleRef}>` na linha 153 recebe a classe `invisible` (`visibility: hidden`). Quando o usuário pressiona a tecla `Escape`:
    1. `setMenuOpen(false)` agenda uma re-renderização onde `useFocusTrap(menuOpen)` executa sua função de cleanup (`return () => { ... previouslyFocused?.focus?.(); }`).
    2. No exato instante em que o cleanup de um `useEffect` roda (ou quando o navegador processa a transição de visibilidade), se `previouslyFocused.focus()` é invocado enquanto a folha de estilos ainda computa `visibility: hidden` ou antes da pintura, ou quando o usuário fecha o menu clicando em um link de seção (linhas 214 e 235), há dois problemas graves:
       - **Bug A (Tecla `Escape`):** Em `closeMenu()` (linhas 60–63), o código usou `window.setTimeout(() => toggleRef.current?.focus(), 0)` justamente porque o botão estava `invisible`, mas o listener de `Escape` na linha 47 chama `setMenuOpen(false)` diretamente sem `closeMenu()`!
       - **Bug B (Clique/Enter em Link de Seção no Menu Mobile — Linhas 214 e 235):** Quando o usuário escolhe uma seção no menu mobile (ex.: `<a href="#visite" onClick={() => setMenuOpen(false)}>`), o cleanup do `useFocusTrap` chama `previouslyFocused.focus()`, **puxando o foco de volta para o botão do menu no topo da página** em vez de deixar o foco seguir para a seção `#visite`!
  - **Correção Exata Recomendada:**
    1. Em `src/components/layout/Header.tsx` (linha 153), substituir `invisible` por `opacity-0` (`menuOpen && 'pointer-events-none opacity-0'`) para que o elemento nunca tenha `visibility: hidden` ao receber `.focus()`.
    2. Em `src/hooks/useFocusTrap.ts` (linha 63), só restaurar o foco para `previouslyFocused` se o foco ainda estiver dentro do container da trap ou em `document.body` (evitando roubar o foco quando um link âncora mudou o foco intencionalmente), e envolver em `requestAnimationFrame`:
       ```ts
       if (!document.activeElement || document.activeElement === document.body || container.contains(document.activeElement)) {
         requestAnimationFrame(() => previouslyFocused?.focus?.());
       }
       ```

- **[WCAG-K04 | Critério 2.4.3 Focus Order — Nível A | Severidade: Média]**
  - **Arquivo e Linha:** `src/components/home/GalleryLightbox.tsx` (linhas 19–22) e `src/components/home/Gallery.tsx` (linha 35)
  - **Trecho de Código Atual:**
    - `GalleryLightbox.tsx` L22: `const dialogRef = useFocusTrap<HTMLDivElement>(Boolean(activeItem));`
  - **Diagnóstico:** Se o usuário abre a Foto #1 no Lightbox, navega com a tecla `ArrowRight` até a Foto #4 e pressiona `Escape` para fechar, o `useFocusTrap` restaura o foco para o botão da **Foto #1** (capturado em `previouslyFocused` quando o Lightbox montou), desorientando o usuário de teclado/leitor de tela que estava inspecionando a Foto #4.
  - **Correção Exata Recomendada:** Adicionar `data-gallery-item-id={item.id}` ao `<button>` do card em `Gallery.tsx` (linha 35) e, ao fechar o Lightbox em `Gallery.tsx` (`setActiveIndex(null)`), focar o card correspondente ao `activeItem.id` atual:
    ```tsx
    const closeLightbox = useCallback(() => {
      const currentId = activeItem?.id;
      setActiveIndex(null);
      if (currentId) {
        requestAnimationFrame(() => {
          document.querySelector<HTMLElement>(`[data-gallery-item-id="${currentId}"]`)?.focus();
        });
      }
    }, [activeItem]);
    ```

- **[WCAG-K05 | Critério 2.4.7 Focus Visible — Nível AA | Severidade: Alta]**
  - **Arquivo e Linha:** `src/components/home/ContributionForm.tsx` (linha 315)
  - **Trecho de Código Atual:**
    ```tsx
    <div
      ref={successRef}
      tabIndex={-1}
      role="region"
      aria-labelledby="contribuicao-sucesso-titulo"
      className="border border-line bg-cream p-7 outline-none sm:p-10 lg:p-12"
    >
    ```
  - **Diagnóstico:** Após o envio bem-sucedido do formulário, a linha 121 executa `successRef.current?.focus()`. Como o container possui `outline-none` sem nenhum estilo `focus-visible:ring-2`, o foco de teclado é movido para o card sem qualquer indicação visual de onde o foco está.
  - **Correção Exata Recomendada:** Substituir `outline-none` por `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay`:
    ```tsx
    className="border border-line bg-cream p-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay sm:p-10 lg:p-12"
    ```

- **Verificação do Input `sr-only` da Dropzone e `focusFirstError('arquivo')` (`ContributionForm.tsx` L558–567 e L95–98):**
  - Na versão atual pós-Sprint 1, o `<input id="arquivo" className="peer sr-only">` (linha 566) está pareado com `<label htmlFor="arquivo" className="... peer-focus-visible:border-copper peer-focus-visible:ring-2 peer-focus-visible:ring-copper/30">` (linha 640), e `focusFirstError` (linha 97) foca `fileInputRef.current?.focus()`, acionando corretamente o estilo `peer-focus-visible` na dropzone.

---

## 4.3. Critérios 2.3.3 (Animation from Interactions — Nível AAA) & 2.2.2 (Pause, Stop, Hide — Nível A)

- **[WCAG-M01 | Critério 2.3.3 Animation from Interactions & Preferência Dinâmica de Movimento | Severidade: Baixa]**
  - **Arquivo e Linha:** `src/components/ui/Reveal.tsx` (linhas 12–47)
  - **Trecho de Código Atual:**
    ```tsx
    const [visible, setVisible] = useState(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    ```
  - **Diagnóstico:** O estado inicial verifica `prefers-reduced-motion: reduce` corretamente na montagem (evitando o bug antigo de `opacity-0`), mas o `useEffect` (linhas 20–47) não registra um listener `mediaQuery.addEventListener('change', ...)` caso o usuário ative a redução de movimento no sistema operacional com a página já aberta.
  - **Correção Exata Recomendada:** Adicionar listener de mudança na `MediaQueryList` dentro do `useEffect` de `Reveal.tsx` para chamar `setVisible(true)` imediatamente se `event.matches` passar a ser `true`.

---

## 4.4. Critério 2.5.8 (Target Size Minimum — WCAG 2.2 Nível AA: Mínimo `24×24 CSS px`)

Todos os controles interativos abaixo não são links em blocos de texto corrido (portanto **não estão isentos** pela exceção *Inline* do Critério 2.5.8) e possuem altura ou largura computada inferior a `24×24 CSS px`:

| ID | Arquivo | Linha(s) | Controle Interativo | Dimensão Atual Computada | Correção Exata Recomendada para Atingir `>= 24×24px` |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **WCAG-TS01** | `src/components/home/ContributionForm.tsx` | **688** | `<input id="autorizacao" type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-forest" />` | **16×16 px** | Alterar `h-4 w-4` para `h-6 w-6 cursor-pointer` (**24×24 px**) |
| **WCAG-TS02** | `src/components/home/ContributionForm.tsx` | **599–621** | 3 controles de arquivo anexado: `<label htmlFor="arquivo">` (`"Trocar arquivo"`), `<a>` (`"Visualizar PDF"`) e `<button>` (`"Remover"`) | Altura de **16,5 px** (`text-[11px]` sem padding vertical) | Adicionar `inline-flex min-h-6 items-center py-1` em cada um dos 3 elementos nas linhas 600, 609 e 617 (**>= 24 px** de altura) |
| **WCAG-TS03** | `src/components/home/AboutMuseum.tsx` | **133, 149** | Links isolados `"Abrir no Maps"` (L133) e `"Explorar linhas de acervo"` (L149) | Altura de **16,5 px** | Adicionar `min-h-6 py-1` em ambos os links (**>= 24 px**) |
| **WCAG-TS04** | `src/components/home/Collection.tsx` | **88** | Link isolado `"Consultar galeria digital"` | Altura de **16,5 px** | Adicionar `min-h-6 py-1` na classe do `<a>` (**>= 24 px**) |
| **WCAG-TS05** | `src/components/home/Exhibitions.tsx` | **86, 143** | Links isolados `"Agendar visita em grupo"` (L86) e `"Contribuir com esta mostra"` (L143) | Altura de **16,5 px** | Adicionar `min-h-6 py-1` em ambos os links (**>= 24 px**) |
| **WCAG-TS06** | `src/components/home/Gallery.tsx` | **216, 371** | Links `"Seja o primeiro a contribuir"` (L216, altura `20px`) e `"Enviar fotografia ou relato"` (L371, altura `16,5px`) | **20 px** e **16,5 px** de altura | Adicionar `inline-flex min-h-6 items-center py-1` em ambos os links (**>= 24 px**) |
| **WCAG-TS07** | `src/components/home/Contribute.tsx` | **95, 110** | Links `"comunidade@museuhilmarkluck.org.br"` (L95) e `"Dúvidas? Fale com a equipe pelo WhatsApp"` (L110) | Altura de **16,5 px** | Adicionar `inline-flex min-h-6 items-center py-1` em L95 e `min-h-6 py-1` em L110 (**>= 24 px**) |
| **WCAG-TS08** | `src/components/home/Visit.tsx` | **56, 99, 123, 155** | Links `"Ver no Google Maps"` (L56), `"Agendar atendimento"` (L99), telefone (L123) e WhatsApp (L155) | Altura de **16,5 px** a **19,5 px** | Adicionar `inline-flex min-h-6 items-center py-1` nas linhas 56, 99, 123 e 155 (**>= 24 px**) |
| **WCAG-TS09** | `src/components/layout/Footer.tsx` | **24, 41, 51, 75, 91, 108** | Todos os links de navegação do rodapé, telefone, WhatsApp e `"Voltar ao topo"` | Altura de **16,5 px** a **19,5 px** (com `space-y-2.5` = `10px` de espaçamento) | Adicionar `inline-flex min-h-6 items-center py-1` nos links das linhas 24, 41, 51, 75, 91 e 108 (**>= 24 px**) |

---

# 5. Semântica HTML5, Hierarquia de Títulos, Formulários e WAI-ARIA (Princípios 1, 3 e 4)

## 5.1. Árvore Completa de Cabeçalhos (`<h1>`–`<h6>`) e Landmarks

### Mapeamento Real da Árvore de Títulos no DOM Atual
- **`<h1>`** (`Hero.tsx` L43): `"Memória viva da Serra dos Carajás e de sua gente."`
  - **`<h2>`** (`AboutMuseum.tsx` L21 via `SectionHeading`): `"Um espaço dedicado à identidade e à história de Parauapebas."`
    - **`<h3>`** (`AboutMuseum.tsx` L159): `"Pilares de atuação"`
    - **`<h3>`** (`AboutMuseum.tsx` L176, `×4`): `"Salvaguarda e Conservação"`, `"Pesquisa e Documentação"`, `"Exposição e Comunicação"`, `"Ação Educativa e Cultural"`
  - **`<h2>`** (`Collection.tsx` L81 via `SectionHeading`): `"Quatro olhares sobre a formação do território."`
    - **`<h3>`** (`Collection.tsx` L214, aba ativa): `"Pioneiros e Formação Urbana"` *(ou aba selecionada)*
  - **`<h2>`** (`Exhibitions.tsx` L19 via `SectionHeading`): `"Exposições permanentes, mostras temporárias e ações culturais."`
    - **`<h3>`** (`Exhibitions.tsx` L68): `"Conhecer para Preservar"`
    - **`<h3>`** (`Exhibitions.tsx` L117, `×2`): `"Retratos da Fundação: 1970–1990"`, `"Saberes da Floresta: Cultura Material Indígena"`
    - **`<h3>`** (`Exhibitions.tsx` L169): `"Visitas mediadas para escolas, universidades e grupos"`
  - **`<h2>`** (`Gallery.tsx` L190 via `SectionHeading`): `"Memórias compartilhadas pela comunidade."`
    - **`<h3>`** (`Gallery.tsx` L71, `×N` cards): Título de cada registro fotográfico/documental
    - **`<h2>`** (`GalleryLightbox.tsx` L68, condicional quando aberto): Título do item no modal Lightbox
  - **`<h2>`** (`Education.tsx` L14 via `SectionHeading`): `"Mediação cultural, pesquisa escolar e educação patrimonial."`
    - **`<h3>`** (`Education.tsx` L69, `×4`): `"Visitas Mediadas Escolares"`, `"Oficinas de Educação Patrimonial"`, `"Rodas de Memória com Pioneiros"`, `"Material Pedagógico para Educadores"`
    - **`<h3>`** (`Education.tsx` L94): `"Inclusão e acolhimento de públicos diversos"`
    - **`<h3>`** (`Education.tsx` L118): `"Como agendar sua turma ou instituição"`
  - **`<h2>`** (`Contribute.tsx` L18 via `SectionHeading`): `"Sua história faz parte do acervo do museu."`
    - **`<h3>`** (`Contribute.tsx` L44): `"Como funciona o envio e a curadoria"`
    - **`<h3>`** (`ContributionForm.tsx` L375 / L323): `"Formulário de contribuição ao acervo"` *(ou `"Sua memória foi registrada com sucesso."` após envio)*
  - **`<h2>`** (`Visit.tsx` L21 via `SectionHeading`): `"Planeje sua visita ao Museu Municipal."`
    - **`<h3>`** (`Visit.tsx` L42, L72, L88, L115, L136): `"Endereço"`, `"Horários de Funcionamento"`, `"Entrada e Agendamento"`, `"Acessibilidade"`, `"Contato Institucional"`
  - *(Em `Footer.tsx`, os títulos de coluna `"Navegação"`, `"Linhas de Acervo"`, `"Visitação e Contato"` usam `<p>` nas linhas 34, 68 e 102).*

### Desvios Semânticos de Landmarks e Links Externos

- **[WCAG-S01 | Critério 1.3.1 Info and Relationships & WAI-ARIA Landmarks — Nível A | Severidade: Baixa]**
  - **Arquivo e Linha:** Todas as 8 `<section>` principais (`Hero.tsx` L11, `AboutMuseum.tsx` L12, `Collection.tsx` L75, `Exhibitions.tsx` L16, `Gallery.tsx` L184, `Education.tsx` L11, `Contribute.tsx` L15, `Visit.tsx` L18) e `SectionHeading.tsx` L45.
  - **Diagnóstico:** As tags `<section id="...">` não possuem atributo `aria-labelledby` apontando para o `id` do respectivo `<h1>`/`<h2>`. Pela especificação HTML-AAM, uma `<section>` sem nome acessível (`aria-labelledby` ou `aria-label`) não é exposta como landmark `region` na lista de regiões dos leitores de tela (NVDA/VoiceOver), privando o usuário da navegação rápida por seções nomeadas.
  - **Correção Exata Recomendada:** Adicionar prop opcional `headingId?: string` em `SectionHeading.tsx` (linha 45: `<h2 id={headingId} ...>`) e vincular cada `<section id="museu" aria-labelledby="heading-museu">` ao seu cabeçalho principal.

- **[WCAG-S02 | Critério 3.2.5 Change on Request — Nível AAA / eMAG | Severidade: Baixa]**
  - **Arquivo e Linha:**
    1. `src/components/home/AboutMuseum.tsx` (linha 130–141: link `"Abrir no Maps"`)
    2. `src/components/home/Contribute.tsx` (linha 107–115: link `"Dúvidas? Fale com a equipe pelo WhatsApp"`)
    3. `src/components/home/ContributionForm.tsx` (linha 606–613: link `"Visualizar PDF"`)
    4. `src/components/home/Visit.tsx` (linha 53–61: link `"Ver no Google Maps"`)
    5. `src/components/home/Visit.tsx` (linha 153–161: link `"Atendimento via WhatsApp"`)
    6. `src/components/home/Visit.tsx` (linha 188–196: link `"Abrir mapa interativo"`)
    7. `src/components/layout/Footer.tsx` (linha 91–98: link `"WhatsApp Institucional"`)
  - **Diagnóstico:** Os 7 links possuem `target="_blank" rel="noopener noreferrer"`, abrindo uma nova janela/aba sem informar usuários de leitor de tela (ex.: `<span className="sr-only"> (abre em nova aba)</span>`).
  - **Correção Exata Recomendada:** Adicionar `<span className="sr-only"> (abre em nova aba)</span>` dentro de cada um dos 7 elementos `<a>`.

---

## 5.2. Auditoria de Imagens, SVGs e Ícones (Critério 1.1.1 — Nível A)

- **[WCAG-I01 | Critério 1.1.1 Non-text Content — Nível A | Severidade: Média]**
  - **Arquivo e Linha:** `src/components/home/Gallery.tsx` (linha 58)
  - **Trecho de Código Atual:**
    ```tsx
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-parchment/40 bg-forest-deep/75 text-parchment opacity-0 transition duration-300 group-hover:opacity-100">
      <Maximize2 size={14} strokeWidth={1.7} />
    </span>
    ```
  - **Diagnóstico:** De todas as 59 instâncias de ícones `lucide-react` no projeto, 58 possuem `aria-hidden="true"`, mas o ícone `<Maximize2>` na linha 58 de `Gallery.tsx` **não possui `aria-hidden="true"`** nem no `<svg>` nem no `<span>` pai, podendo ser anunciado como elemento gráfico sem rótulo dentro do botão do card.
  - **Correção Exata Recomendada:** Adicionar `aria-hidden="true"` na linha 58:
    ```tsx
    <Maximize2 size={14} strokeWidth={1.7} aria-hidden="true" />
    ```

---

## 5.3. Auditoria Completa do Formulário de Contribuição (Critérios 1.3.5, 3.3.1, 3.3.2, 3.3.3, 4.1.2)

- **[WCAG-F01 | Critério 3.3.2 Labels or Instructions & 4.1.2 Name, Role, Value — Nível A | Severidade: Alta]**
  - **Arquivo e Linha:** `src/components/home/ContributionForm.tsx` (linhas 418–434 `#nome`, 438–455 `#email`, 480–496 `#titulo`, 500–521 `#categoria`, 525–546 `#descricao`, 554–567 `#arquivo`, 674–696 `#autorizacao`)
  - **Trecho de Código Atual:** O `<form noValidate>` omite `required` e `aria-required="true"` em todos os 7 campos obrigatórios, enquanto exibe um asterisco literal `<span className="text-clay">*</span>` dentro de cada `<label>` (linhas 419, 439, 481, 501, 526, 555, 693 e na legenda da linha 736) sem `aria-hidden="true"`.
  - **Diagnóstico:** Leitores de tela anunciam `"asterisco"` literalmente mas **não anunciam a propriedade semântica `"obrigatório"` (`required`)** ao focar o campo, pois nem `required` nem `aria-required="true"` estão presentes nos elementos `<input>`, `<select>` e `<textarea>`.
  - **Correção Exata Recomendada:**
    1. Adicionar `required aria-required="true"` nos 7 controles: `#nome` (L421), `#email` (L441), `#titulo` (L483), `#categoria` (L503), `#descricao` (L532), `#arquivo` (L558) e `#autorizacao` (L675).
    2. Adicionar `aria-hidden="true"` em todos os `<span className="text-clay">*</span>` (linhas 419, 439, 481, 501, 526, 555, 693 e 736).

- **[WCAG-F02 | Critério 3.3.2 Labels or Instructions & 4.1.3 Status Messages — Nível AA | Severidade: Média]**
  - **Arquivo e Linha:** `src/components/home/ContributionForm.tsx` (linhas 528–530 e 532–546)
  - **Trecho de Código Atual:**
    ```tsx
    <span className="text-[11px] tabular-nums text-stone">
      {values.descricao.length}/2000
    </span>
    ```
  - **Diagnóstico:** O contador de caracteres (`0/2000`) não possui `id` vinculado ao `aria-describedby` do `<textarea id="descricao">`, não permitindo que usuários de leitor de tela saibam quantos caracteres já digitaram.
  - **Correção Exata Recomendada:** Adicionar `id="descricao-counter"` ao `<span>` na linha 528 (`<span id="descricao-counter" className="text-xs tabular-nums text-stone">{values.descricao.length}/2000 caracteres</span>`) e incluí-lo no `aria-describedby` do `<textarea>` na linha 540:
    ```tsx
    aria-describedby={
      touched.descricao && errors.descricao
        ? 'descricao-help descricao-counter descricao-error'
        : 'descricao-help descricao-counter'
    }
    ```

- **[WCAG-F03 | Critério 4.1.2 Name, Role, Value & Regra Fourth Rule of ARIA — Nível A | Severidade: Baixa]**
  - **Arquivo e Linha:** `src/components/home/ContributionForm.tsx` (linhas 699–713)
  - **Trecho de Código Atual:**
    ```tsx
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
    >
      <label htmlFor="website">Website (não preencha este campo)</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" ... />
    </div>
    ```
  - **Diagnóstico:** A Quarta Regra do WAI-ARIA proíbe aplicar `aria-hidden="true"` a um container que contenha um elemento nativamente interativo (`<input>`) sem que o container esteja `inert` ou `hidden`, pois a navegação por objetos de certos leitores de tela ou extensões de preenchimento automático pode interagir com o `<input>` mesmo com `tabIndex={-1}`.
  - **Correção Exata Recomendada:** Adicionar a propriedade HTML5 `inert` ao `<div>` da linha 699 (`<div aria-hidden="true" inert className="...">`).

---

## 5.4. Componentes Interativos e Estados ARIA (Critérios 4.1.2 e 4.1.3)

- **[WCAG-A01 | Critério 4.1.2 Name, Role, Value — Isolamento de Modal (`aria-modal`) — Nível A | Severidade: Crítica]**
  - **Arquivo e Linha:** `src/components/layout/Header.tsx` (linhas 16–32, 74–163 e 184–268) e `src/components/home/GalleryLightbox.tsx` (linhas 45–154)
  - **Trecho de Código Atual:**
    - Em `Header.tsx` L23: `document.querySelector('main')?.toggleAttribute('inert', menuOpen);` e L24: `document.querySelector('footer')?.toggleAttribute('inert', menuOpen);` — **mas `<header>` (L74–163) e o skip-link (L67) NÃO recebem `inert`!**
    - Em `GalleryLightbox.tsx` L45: O Lightbox é renderizado em `document.body` via `createPortal`, mas **`#root` (`<header>`, `<main>`, `<footer>`) NÃO recebe `inert` nem `aria-hidden="true"`** enquanto o Lightbox está aberto!
  - **Diagnóstico:** Embora o `useFocusTrap` intercepte a tecla `Tab`, usuários de leitores de tela (NVDA, JAWS, VoiceOver em iOS/macOS) navegam pelo **cursor virtual** (setas de leitura ou gestos de swipe). Sem `inert` no `<header>` (durante o menu mobile) e sem `inert` em `#root` (durante o Lightbox), o cursor virtual escapa do modal e lê todo o conteúdo de fundo da página.
  - **Correção Exata Recomendada:**
    1. Em `src/components/layout/Header.tsx` (linha 23), adicionar `document.querySelector('header')?.toggleAttribute('inert', menuOpen);` (já que `#menu-mobile` é irmão de `<header>`, fora dele!).
    2. Em `src/components/home/GalleryLightbox.tsx` (dentro do `useEffect` nas linhas 24–41), adicionar:
       ```ts
       const rootEl = document.getElementById('root');
       rootEl?.setAttribute('inert', '');
       rootEl?.setAttribute('aria-hidden', 'true');
       ```
       e remover ambos os atributos no cleanup (`rootEl?.removeAttribute('inert'); rootEl?.removeAttribute('aria-hidden');`).

- **[WCAG-A02 | Critério 4.1.3 Status Messages — Nível AA | Severidade: Alta]**
  - **Arquivo e Linha:** `src/components/home/Gallery.tsx` (linhas 86–102 e linha 285)
  - **Trecho de Código Atual:**
    ```tsx
    function GallerySkeleton() {
      return (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }).map((_, idx) => ( ... ))}
          <span className="sr-only">Carregando galeria</span>
        </div>
      );
    }
    ```
  - **Diagnóstico:** O `<span className="sr-only">Carregando galeria</span>` (linha 98) está **dentro** de uma `<div>` com `aria-hidden="true"` (linha 89)! Como `aria-hidden="true"` oculta toda a subárvore da árvore de acessibilidade, o texto `"Carregando galeria"` **jamais é lido por nenhum leitor de tela**. Além disso, o container `<div className="mt-10">` (linha 285) não possui `aria-busy={loading}`.
  - **Correção Exata Recomendada:**
    1. Em `Gallery.tsx` (linha 88), remover `aria-hidden="true"` do container pai de `GallerySkeleton`, aplicar `aria-hidden="true"` apenas aos cards de esqueleto no `.map` (linha 92) e adicionar `role="status"`:
       ```tsx
       function GallerySkeleton() {
         return (
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">
             {Array.from({ length: 6 }).map((_, idx) => (
               <div key={idx} aria-hidden="true" className="overflow-hidden border border-line bg-cream p-3">
                 ...
               </div>
             ))}
             <span className="sr-only">Carregando galeria...</span>
           </div>
         );
       }
       ```
    2. Em `Gallery.tsx` (linha 285), adicionar `aria-busy={loading}`: `<div className="mt-10" aria-busy={loading}>`.

---

# 6. Checklist Consolidado de Correção (Arquivo por Arquivo)

Abaixo está o plano cirúrgico arquivo por arquivo para elevar o portal a **100% de conformidade WCAG 2.2 Nível AA** (e máxima aderência AAA/eMAG):

### 1. `src/index.css`
- [ ] **Linha 55 (`:focus-visible`):** Substituir `outline: 2px solid var(--color-copper);` por `outline: 2px solid var(--color-clay);` (**4,49:1** em `sand`, **5,12:1** em `parchment`) e adicionar regra para seções escuras `.bg-forest :focus-visible, .bg-forest-deep :focus-visible { outline-color: var(--color-copper-light); }` (**5,93:1**–**7,33:1**).
- [ ] **Linha 66 (Scroll Margin para Header Fixo — WCAG 2.4.11):** Adicionar `section[id], main[id], a, button, input, select, textarea, [tabindex]:not([tabindex='-1']) { scroll-margin-top: 5.75rem; }`.
- [ ] **Linha 98 (`.eyebrow`):** Substituir `@apply text-[11px] font-semibold uppercase tracking-[0.26em];` por `@apply text-xs font-semibold uppercase tracking-[0.22em];`.
- [ ] **Linha 102 (`.input-base`):** Substituir `border-line` por `border-stone/75` (**3,95:1**, WCAG 1.4.11) e `placeholder:text-stone/80` por `placeholder:text-stone` (**6,26:1**, WCAG 1.4.3).

### 2. `src/App.tsx`
- [ ] **Linha 16 (`<main>`):** Alterar `<main id="conteudo">` para `<main id="conteudo" tabIndex={-1} className="outline-none">`.

### 3. `src/hooks/useFocusTrap.ts`
- [ ] **Linha 63 (Restauração de Foco Segura):** No cleanup do `useEffect`, verificar se o foco ainda está dentro do modal ou em `document.body` antes de restaurar `previouslyFocused`, e usar `requestAnimationFrame(() => previouslyFocused?.focus?.())` para evitar falha quando o botão gatilho está saindo de `invisible`/`opacity-0` ou quando o clique em um link âncora já moveu o foco.

### 4. `src/components/ui/Reveal.tsx`
- [ ] **Linhas 20–47 (`useEffect`):** Registrar `mediaQuery.addEventListener('change', handler)` para tornar o elemento imediatamente visível (`setVisible(true)`) caso o usuário ative `prefers-reduced-motion: reduce` dinamicamente.

### 5. `src/components/ui/Logo.tsx`
- [ ] **Linhas 40 e 46:** Substituir `text-[11px]` por `text-xs` (`0.75rem`).

### 6. `src/components/ui/Button.tsx`
- [ ] **Linha 7:** Substituir `text-[11.5px]` por `text-xs`.
- [ ] **Linha 13 (`outline`):** Substituir `border-parchment/30` por `border-parchment/50` (**4,48:1**, WCAG 1.4.11).
- [ ] **Linha 15 (`ghost`):** Substituir `border-ink/20` por `border-ink/55` (**3,34:1**, WCAG 1.4.11).

### 7. `src/components/ui/SectionHeading.tsx`
- [ ] **Linhas 37 e 41:** No modo claro (`align !== 'dark'`), substituir `text-clay` por `text-clay-dark` (`#833C21`, garantindo **6,22:1** sobre `bg-sand` e **7,10:1** sobre `bg-parchment`).
- [ ] **Linha 45:** Aceitar prop opcional `id?: string` no `<h2>` para associação `aria-labelledby` com a `<section>` pai.

### 8. `src/components/layout/Header.tsx`
- [ ] **Linha 23 (`useEffect` do modal mobile):** Adicionar `document.querySelector('header')?.toggleAttribute('inert', menuOpen);` para isolar o `<header>` dos leitores de tela quando `#menu-mobile` estiver aberto.
- [ ] **Linhas 105, 130, 201, 217, 238:** Substituir `text-[11px]` por `text-xs`.
- [ ] **Linhas 132, 155, 201:** Substituir `border-parchment/25` e `border-parchment/20` por `border-parchment/50` (**4,48:1**).
- [ ] **Linhas 133, 156:** Substituir `border-ink/20` e `border-ink/25` por `border-ink/55` (**3,34:1**).
- [ ] **Linha 153:** Substituir `invisible` por `opacity-0` (`menuOpen && 'pointer-events-none opacity-0'`) para que a restauração de foco via tecla `Escape` funcione sem perda de foco para `<body>`.

### 9. `src/components/home/Hero.tsx`
- [ ] **Linha 23 (Gradiente sobre `museu-01.jpg`):** Reforçar o gradiente horizontal para `linear-gradient(95deg, rgba(16,33,25,0.95) 0%, rgba(16,33,25,0.82) 60%, rgba(16,33,25,0.58) 100%)`.
- [ ] **Linha 47:** Substituir `text-parchment/72` por `text-parchment/90`.
- [ ] **Linha 75:** Adicionar pastilha semitransparente `rounded-sm bg-forest-deep/75 px-2 py-3 text-xs ... text-parchment/90 backdrop-blur-xs` na legenda vertical sobre a lateral direita clara da foto (**9,64:1**).
- [ ] **Linha 80:** Na barra de localização/horários, substituir `bg-forest-deep/35` por `bg-forest-deep/75` para que `text-copper-light` nas linhas 84, 92 e 100 atinja **5,48:1**.
- [ ] **Linhas 84, 92, 100, 109:** Substituir `text-[11px]` por `text-xs`.

### 10. `src/components/home/AboutMuseum.tsx`
- [ ] **Linhas 49, 54, 93, 105, 111, 117, 126, 133, 149, 185:** Substituir `text-[11px]` por `text-xs`.
- [ ] **Linhas 133 e 149:** Adicionar `min-h-6 py-1` nos links `"Abrir no Maps"` e `"Explorar linhas de acervo"` (WCAG 2.5.8 `>= 24px`) e `<span className="sr-only"> (abre em nova aba)</span>` no link externo da linha 130.

### 11. `src/components/home/Collection.tsx`
- [ ] **Linha 88:** Substituir `text-[11px]` por `text-xs` e adicionar `min-h-6 py-1` (WCAG 2.5.8).
- [ ] **Linhas 134, 164, 202, 218, 223:** Substituir `text-[11px]` por `text-xs`.

### 12. `src/components/home/Exhibitions.tsx`
- [ ] **Linhas 48–56 (`<figcaption>` sobre `museu-05.jpg`):** Substituir `from-forest-deep/60 via-transparent` (L48) por `from-forest-deep/95 via-forest-deep/55`, adicionar `bg-forest-deep/85 p-4 backdrop-blur-xs` no `<figcaption>` (L50) e usar `text-parchment/95` na linha 54 (**7,12:1** e **12,40:1**).
- [ ] **Linhas 51, 86, 107, 136, 143, 162, 185, 192:** Substituir `text-[11px]` por `text-xs`.
- [ ] **Linhas 86 e 143:** Adicionar `min-h-6 py-1` em ambos os links (WCAG 2.5.8) e substituir `text-clay` por `text-clay-dark` na linha 143 (**6,22:1** sobre `bg-sand`).
- [ ] **Linha 185:** Substituir `border-forest/25` por `border-forest/60` (**3,39:1**, WCAG 1.4.11).

### 13. `src/components/home/Gallery.tsx`
- [ ] **Linha 17:** Substituir `bg-stone/50` por `bg-stone` (**6,26:1**, WCAG 1.4.11).
- [ ] **Linha 35:** Adicionar `data-gallery-item-id={item.id}` ao `<button>` do card para restaurar o foco ao item exato quando o Lightbox for fechado.
- [ ] **Linha 58:** Adicionar `aria-hidden="true"` em `<Maximize2 size={14} strokeWidth={1.7} aria-hidden="true" />` (WCAG 1.1.1).
- [ ] **Linha 74:** Adicionar `title={item.descricao}` ou desativar `line-clamp-2` para itens PDF.
- [ ] **Linhas 88–99 (`GallerySkeleton`):** Remover `aria-hidden="true"` do container externo, adicionar `role="status" aria-live="polite"` no container e aplicar `aria-hidden="true"` apenas aos elementos visuais internos do skeleton (WCAG 4.1.3).
- [ ] **Linhas 216 e 371:** Adicionar `inline-flex min-h-6 items-center py-1` nos links (WCAG 2.5.8).
- [ ] **Linhas 245 e 269:** Substituir `border-line` por `border-stone/75` (**3,75:1**, WCAG 1.4.11).
- [ ] **Linhas 249 e 273:** Remover `opacity-80` dos contadores `<span className="ml-1.5">` (**5,95:1**, WCAG 1.4.3).
- [ ] **Linha 285:** Adicionar `aria-busy={loading}` ao `<div className="mt-10">`.
- [ ] **Linha 329:** Substituir `border-forest/25` por `border-forest/60` (**3,57:1**, WCAG 1.4.11).
- [ ] **Linhas 45, 49, 65, 68, 78, 197, 242, 266, 279, 303, 306, 329, 365:** Substituir `text-[11px]` por `text-xs`.

### 14. `src/components/home/GalleryLightbox.tsx`
- [ ] **Linhas 24–41 (`useEffect`):** Aplicar `inert` e `aria-hidden="true"` em `document.getElementById('root')` enquanto o Lightbox estiver aberto e remover no cleanup (WCAG 4.1.2).
- [ ] **Linha 68 (`#lightbox-title`):** Remover `truncate` para não cortar títulos longos em `320px` / `200% zoom` (WCAG 1.4.4 / 1.4.10).
- [ ] **Linhas 85, 98, 126:** Substituir `border-parchment/25` por `border-parchment/50` (**4,48:1**, WCAG 1.4.11).
- [ ] **Linhas 63, 76, 117, 141, 146:** Substituir `text-[11px]` por `text-xs`.

### 15. `src/components/home/Education.tsx`
- [ ] **Linhas 52, 65, 103, 130:** Substituir `text-[11px]` por `text-xs`.

### 16. `src/components/home/Contribute.tsx`
- [ ] **Linhas 62, 72, 110:** Substituir `text-clay` por `text-clay-dark` (**6,22:1** sobre `bg-sand`) e `text-[11px]` por `text-xs` (também na linha 85).
- [ ] **Linhas 95 e 110:** Adicionar `inline-flex min-h-6 items-center py-1` nos links (WCAG 2.5.8) e `<span className="sr-only"> (abre em nova aba)</span>` na linha 107.

### 17. `src/components/home/ContributionForm.tsx`
- [ ] **Linha 315 (`successRef`):** Substituir `outline-none` por `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay` (WCAG 2.4.7).
- [ ] **Linha 356:** Substituir `border-forest/25` por `border-forest/60` (**3,57:1**, WCAG 1.4.11).
- [ ] **Linhas 395, 400, 720:** Substituir `text-clay/90` e `text-clay/85` por `text-clay-dark` (**6,95:1**, WCAG 1.4.3).
- [ ] **Linhas 419, 439, 481, 501, 526, 555, 693, 736:** Adicionar `aria-hidden="true"` em `<span className="text-clay" aria-hidden="true">*</span>`.
- [ ] **Linhas 421, 441, 483, 503, 532, 558, 675:** Adicionar `required aria-required="true"` nos 7 campos obrigatórios (WCAG 3.3.2 / 4.1.2).
- [ ] **Linhas 528 e 540:** Adicionar `id="descricao-counter"` ao contador de caracteres e vinculá-lo ao `aria-describedby` de `#descricao`.
- [ ] **Linhas 600, 609, 617:** Adicionar `inline-flex min-h-6 items-center py-1` nos 3 botões/links de ação de arquivo (WCAG 2.5.8) e `<span className="sr-only"> (abre em nova aba)</span>` no link de PDF da linha 606.
- [ ] **Linhas 641, 642:** Substituir `border-clay/50` por `border-clay` (**5,12:1**) e `border-line` por `border-stone/75` (**3,75:1**, WCAG 1.4.11).
- [ ] **Linha 688 (`#autorizacao`):** Substituir `h-4 w-4` por `h-6 w-6 cursor-pointer` (**24×24 px**, WCAG 2.5.8).
- [ ] **Linha 699 (Honeypot):** Adicionar atributo `inert` na `<div>` oculta.
- [ ] **Linhas 331, 339, 356, 379, 400, 528, 547, 587, 593, 600, 609, 617, 661, 690, 735, 763:** Substituir `text-[11px]` e `text-[11.5px]` por `text-xs`.

### 18. `src/components/home/Visit.tsx`
- [ ] **Linhas 56, 99, 123, 155:** Adicionar `inline-flex min-h-6 items-center py-1` nos links (WCAG 2.5.8) e `<span className="sr-only"> (abre em nova aba)</span>` nos links externos das linhas 53, 153 e 188.
- [ ] **Linhas 180–185 (Sobre `museu-02.jpg`):** Substituir `from-forest-deep/80 via-transparent to-transparent` por `from-forest-deep/95 via-forest-deep/70 to-transparent` e `text-parchment/85` por `text-parchment/95` (**6,45:1** e **10,85:1**, WCAG 1.4.3).
- [ ] **Linha 191:** Substituir `border-parchment/35` por `border-parchment/55` (**5,02:1**, WCAG 1.4.11).
- [ ] **Linhas 42, 56, 72, 79, 88, 99, 115, 136, 149, 191, 203:** Substituir `text-[11px]` por `text-xs`.

### 19. `src/components/layout/Footer.tsx`
- [ ] **Linhas 24, 41, 51, 75, 91, 108:** Adicionar `inline-flex min-h-6 items-center py-1` em todos os links (WCAG 2.5.8) e `<span className="sr-only"> (abre em nova aba)</span>` na linha 91.
- [ ] **Linhas 24, 108, 121:** Substituir `text-[11px]` por `text-xs`.

