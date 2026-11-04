import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, MapPin, Menu, X } from 'lucide-react'
import { navItems, sectionIds, visit } from '../../data/content'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useScrolled } from '../../hooks/useScrolled'
import { cn } from '../../lib/utils'
import { Logo } from '../ui/Logo'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(28)
  const activeSection = useActiveSection(sectionIds)
  const isDesktop = useMediaQuery('(min-width: 1280px)')
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const onDark = menuOpen || !scrolled

  useBodyScrollLock(menuOpen)
  useFocusTrap(menuOpen, panelRef)

  useEffect(() => {
    if (isDesktop) setMenuOpen(false)
  }, [isDesktop])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    window.setTimeout(() => toggleRef.current?.focus(), 0)
  }

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-parchment focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Pular para o conteúdo
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color,box-shadow] duration-500',
          onDark ? 'text-parchment' : 'text-ink',
          menuOpen
            ? 'border-b border-parchment/10 bg-forest-deep'
            : scrolled
              ? 'border-b border-line/70 bg-parchment/95 shadow-[0_10px_30px_-24px_rgba(16,33,25,0.5)] backdrop-blur-md'
              : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="site-container flex h-[84px] items-center justify-between gap-6">
          <a
            href="#inicio"
            aria-label="Museu Municipal Hilmar Harry Kluck — ir para o início"
            onClick={() => setMenuOpen(false)}
            className="shrink-0"
          >
            <Logo tone={onDark ? 'light' : 'dark'} compact />
          </a>

          <nav aria-label="Navegação principal" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {navItems.map((item) => {
              const isActive = activeSection === item.id

              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'relative py-2 text-[10.5px] font-semibold uppercase tracking-[0.13em] transition-colors duration-300',
                    onDark
                      ? 'text-parchment/70 hover:text-parchment'
                      : 'text-ink/65 hover:text-clay',
                    isActive && (onDark ? 'text-parchment' : 'text-clay'),
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px bg-current transition-all duration-300',
                      isActive ? 'w-full' : 'w-0',
                    )}
                  />
                </a>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#contribua"
              className={cn(
                'hidden items-center gap-2 rounded-sm border px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] transition duration-300 xl:inline-flex',
                onDark
                  ? 'border-parchment/35 text-parchment hover:bg-parchment hover:text-forest-deep'
                  : 'border-ink/25 text-ink hover:bg-ink hover:text-parchment',
              )}
            >
              Contribua
              <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-sm border transition duration-300 xl:hidden',
                menuOpen && 'invisible',
                onDark
                  ? 'border-parchment/30 text-parchment hover:bg-parchment/10'
                  : 'border-ink/20 text-ink hover:bg-ink/5',
              )}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 xl:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fechar menu"
          onClick={closeMenu}
          className={cn(
            'absolute inset-0 bg-forest-deep/55 backdrop-blur-[2px] transition-opacity duration-500',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          id="menu-mobile"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          tabIndex={-1}
          inert={!menuOpen}
          className={cn(
            'absolute inset-x-0 bottom-0 top-[84px] flex flex-col border-t border-parchment/10 bg-forest-deep text-parchment shadow-2xl transition-transform duration-500 ease-museum',
            menuOpen ? 'translate-y-0' : '-translate-y-4 opacity-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-parchment/10 px-5 py-4 sm:px-8">
            <p className="eyebrow text-copper-light">Navegação</p>
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex items-center gap-2 rounded-sm border border-parchment/25 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-parchment/80 transition hover:border-parchment/60 hover:text-parchment"
            >
              Fechar
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Navegação mobile" className="flex-1 overflow-y-auto px-5 pb-8 pt-2 sm:px-8">
            <ul>
              {navItems.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-4 border-b border-parchment/10 py-4"
                  >
                    <span className="w-6 text-[10px] font-medium tabular-nums tracking-wider text-parchment/30">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="display text-[clamp(1.5rem,6vw,1.9rem)] font-medium leading-tight text-parchment transition-colors group-hover:text-copper-light">
                      {item.label}
                    </span>
                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.5}
                      className="ml-auto shrink-0 text-parchment/25 transition group-hover:text-copper-light"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contribua"
                  onClick={() => setMenuOpen(false)}
                  className="group mt-5 flex items-center justify-between gap-4 rounded-sm bg-clay px-5 py-4 text-parchment transition hover:bg-clay-dark"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                    Contribua com o Museu
                  </span>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.7}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>

            <div className="mt-8 border-t border-parchment/10 pt-6 text-[13px] leading-relaxed text-parchment/60">
              <p className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-copper-light" aria-hidden="true" />
                <span>
                  {visit.addressLine1}
                  <br />
                  {visit.addressLine2}
                </span>
              </p>
              <a
                href={`mailto:${visit.emails[0]}`}
                className="mt-4 inline-block break-all text-parchment/80 underline decoration-parchment/25 underline-offset-4 transition hover:text-copper-light"
              >
                {visit.emails[0]}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
