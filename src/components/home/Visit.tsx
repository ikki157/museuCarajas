import { Accessibility, ArrowUpRight, Clock, Mail, MapPin, Users } from 'lucide-react'
import { buildMailto } from '../../lib/utils'
import { photoCredit, sourceUrl, visit } from '../../data/content'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function Visit() {
  return (
    <section
      id="visite"
      aria-labelledby="visite-title"
      className="relative overflow-hidden bg-parchment py-24 lg:py-32"
    >
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading
                eyebrow="Visite-nos"
                title="Planeje sua visita."
                titleId="visite-title"
              />
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={80}>
              <p className="max-w-md text-[14.5px] leading-relaxed text-stone">
                O museu está no bairro Cidade Nova, ao lado da Praça de Eventos. Confira as
                orientações abaixo e confirme os horários com a equipe antes de sair de casa.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <Reveal>
              <div className="border-t border-line">
                <div className="grid gap-4 border-b border-line py-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <div className="flex items-center gap-2.5 text-forest">
                    <MapPin size={17} strokeWidth={1.6} aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Endereço
                    </h3>
                  </div>
                  <div>
                    <p className="text-[14px] leading-relaxed text-ink/80">
                      {visit.addressLine1}
                      <br />
                      {visit.addressLine2}
                    </p>
                    <a
                      href={visit.mapUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-clay transition hover:text-clay-dark"
                    >
                      Abrir no mapa
                      <ArrowUpRight
                        size={12}
                        strokeWidth={1.9}
                        className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-line py-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <div className="flex items-center gap-2.5 text-forest">
                    <Clock size={17} strokeWidth={1.6} aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Horários
                    </h3>
                  </div>
                  <div>
                    <p className="text-[14px] leading-relaxed text-ink/80">{visit.weekdays}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{visit.weekends}</p>
                    <p className="mt-3 border-l border-copper/60 pl-3 text-xs leading-relaxed text-stone">
                      {visit.hoursNote}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-line py-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <div className="flex items-center gap-2.5 text-forest">
                    <Users size={17} strokeWidth={1.6} aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Visitas em grupo
                    </h3>
                  </div>
                  <div>
                    <p className="text-[14px] leading-relaxed text-ink/80">{visit.groupInfo}</p>
                    <a
                      href={buildMailto(
                        'Solicitação de visita em grupo — Museu Municipal Hilmar Harry Kluck',
                        'Olá, gostaria de solicitar uma visita em grupo ao Museu Municipal Hilmar Harry Kluck. Instituição: \nQuantidade de pessoas: \nData desejada: \nResponsável: ',
                      )}
                      className="group mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-clay transition hover:text-clay-dark"
                    >
                      Enviar solicitação
                      <ArrowUpRight
                        size={12}
                        strokeWidth={1.9}
                        className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-line py-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <div className="flex items-center gap-2.5 text-forest">
                    <Mail size={17} strokeWidth={1.6} aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Contatos
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    {visit.emails.map((email) => (
                      <p key={email}>
                        <a
                          href={`mailto:${email}`}
                          className="break-all text-[13.5px] text-ink/80 underline decoration-ink/25 underline-offset-4 transition hover:text-clay"
                        >
                          {email}
                        </a>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 py-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <div className="flex items-center gap-2.5 text-forest">
                    <Accessibility size={17} strokeWidth={1.6} aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Acessibilidade
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone">
                    Para necessidades específicas de acessibilidade, entre em contato previamente
                    com a equipe do museu para receber orientações.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <p className="mt-6 text-xs leading-relaxed text-stone">
                Informações de visitação baseadas em publicação oficial de 2023. Podem sofrer
                alterações. Consulte também a{' '}
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-stone/40 underline-offset-4 transition hover:text-clay"
                >
                  fonte oficial
                </a>
                .
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={120}>
              <figure>
                <div className="img-zoom relative overflow-hidden rounded-[36px] bg-sand-deep">
                  <img
                    src="/images/museu/museu-02.jpg"
                    alt="Fachada da sede administrativa do Museu de Parauapebas Hilmar Harry Kluck, com placa institucional."
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/30 to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-6 text-parchment sm:p-7">
                    <p className="eyebrow text-copper-light">Como chegar</p>
                    <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-parchment/85">
                      {visit.addressLine1} · {visit.addressLine2}
                    </p>
                    <a
                      href={visit.mapUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group mt-4 inline-flex items-center gap-2 rounded-full bg-parchment px-6 py-2.5 text-[12px] font-medium tracking-[0.06em] text-forest-deep transition hover:bg-cream"
                    >
                      Abrir no Google Maps
                      <ArrowUpRight
                        size={13}
                        strokeWidth={1.8}
                        className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </figcaption>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone">
                  Fotografia: {photoCredit} (2023). Confirme horários e disponibilidade antes da
                  visita.
                </p>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
