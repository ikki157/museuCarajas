import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { visit } from '../../data/content'
import { ContributionForm } from './ContributionForm'

export function Contribute() {
  const contactEmail = visit.emails[0]

  return (
    <section
      id="contribua"
      aria-labelledby="contribua-title"
      className="pb-24 pt-28 sm:pt-32 lg:pb-32"
    >
      <div className="mx-auto max-w-2xl px-5 sm:px-6">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-sm text-stone transition-colors hover:text-ink"
        >
          <ArrowLeft
            size={15}
            strokeWidth={1.75}
            className="transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Voltar ao acervo
        </Link>

        <header className="mt-6">
          <h1
            id="contribua-title"
            className="font-serif text-4xl font-normal leading-[1.1] tracking-[-0.02em] text-ink sm:text-[2.75rem]"
          >
            Enviar um registro
          </h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-stone sm:text-base">
            Compartilhe fotografias, vídeos ou documentos históricos de Carajás
            para análise da curadoria.
          </p>
        </header>

        <div className="mt-10">
          <ContributionForm />
        </div>

        <p className="mt-8 text-center text-sm text-stone">
          Dúvidas? Fale com a curadoria em{' '}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-forest underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-forest"
          >
            {contactEmail}
          </a>
        </p>
      </div>
    </section>
  )
}
