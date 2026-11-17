import { ArrowUp, ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { museum, navItems, photoCredit, sourceUrl, visit } from '../../data/content'
import { Logo } from '../ui/Logo'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-forest-deep text-parchment">
      <div className="site-container pb-10 pt-20 lg:pt-28">
        <div className="grid gap-14 border-b border-parchment/15 pb-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <a href="#inicio" aria-label="Voltar ao início" className="inline-block">
              <Logo tone="light" />
            </a>
            <p className="mt-7 max-w-sm text-[14.5px] leading-relaxed text-parchment/75">
              Um espaço dedicado à memória, à arqueologia e à riqueza cultural de Parauapebas e da
              região de Carajás.
            </p>
            <a
              href="#visite"
              className="group mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-copper-light transition hover:text-parchment"
            >
              Planeje sua visita
              <ArrowUpRight
                size={14}
                strokeWidth={1.8}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="lg:col-span-3">
            <h3 className="eyebrow text-parchment/70">Navegação</h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13.5px] lg:grid-cols-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="text-parchment/80 transition hover:text-copper-light"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contribua"
                  className="text-parchment/80 transition hover:text-copper-light"
                >
                  Contribua com o Museu
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="eyebrow text-parchment/70">Contato e localização</h3>
            <address className="mt-5 space-y-4 text-[13.5px] not-italic leading-relaxed text-parchment/80">
              <p className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-copper-light" aria-hidden="true" />
                <span>
                  {visit.addressLine1}
                  <br />
                  {visit.addressLine2}
                </span>
              </p>
              {visit.emails.map((email) => (
                <p key={email} className="flex items-start gap-3">
                  <Mail size={15} className="mt-0.5 shrink-0 text-copper-light" aria-hidden="true" />
                  <a
                    href={`mailto:${email}`}
                    className="break-all transition hover:text-copper-light"
                  >
                    {email}
                  </a>
                </p>
              ))}
            </address>
          </div>
        </div>

        <div className="grid gap-6 border-b border-parchment/10 py-8 text-[12px] leading-relaxed text-parchment/70 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p>
              Fotografias: {photoCredit} (2023). Conteúdo institucional baseado na{' '}
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-parchment/85 underline decoration-parchment/35 underline-offset-4 transition hover:text-copper-light"
              >
                publicação oficial da Prefeitura de Parauapebas
              </a>
              . Horários e informações de visitação devem ser confirmados com o museu.
            </p>
            <p className="mt-2">
              Protótipo institucional. As legendas e categorias do acervo são demonstrativas e
              devem passar por validação curatorial antes da publicação oficial.
            </p>
          </div>
          <div className="flex items-start lg:col-span-4 lg:justify-end">
            <a
              href="#inicio"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-parchment/75 transition hover:text-parchment"
            >
              Voltar ao topo
              <ArrowUp
                size={14}
                strokeWidth={1.8}
                className="transition group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-7 text-xs text-parchment/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {museum.name} · {museum.city} – {museum.stateCode}
          </p>
          <p>Memória, território e patrimônio.</p>
        </div>
      </div>
    </footer>
  )
}
