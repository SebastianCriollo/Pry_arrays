import { useState } from 'react'
import Icon from '../ui/Icon'
import { DIAS, estadoHorario, indiceHoy } from '../../lib/format'

// Logo del negocio; si no subió uno, un monograma con su inicial.
export function Logo({ business, className = 'h-16 w-16 text-2xl' }) {
  if (business.logo_url) {
    return <img src={business.logo_url} alt="" className={`${className} rounded-2xl object-cover`} />
  }
  return (
    <div className={`${className} grid place-items-center rounded-2xl bg-primary font-display font-semibold text-on-primary`}>
      {business.name.trim().charAt(0).toUpperCase()}
    </div>
  )
}

// Encabezado del menú: logo, nombre, estado (abierto/cerrado), horario y dirección.
export default function BusinessHeader({ business }) {
  const [verHorario, setVerHorario] = useState(false)
  const estado = estadoHorario(business.hours)
  const hoy = indiceHoy()

  return (
    <header className="relative overflow-hidden px-4 pb-5 pt-7">
      {/* Mancha suave del color de marca: da identidad sin usar una foto pesada */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <Logo business={business} className="h-[72px] w-[72px] shrink-0 text-3xl shadow-card" />
        <div className="min-w-0">
          <h1 className="font-display text-[1.75rem] font-semibold leading-[1.1] tracking-tight">{business.name}</h1>
          {business.tagline && <p className="mt-1 text-sm leading-snug text-ink/65">{business.tagline}</p>}
        </div>
      </div>

      <div className="relative mt-4 space-y-2 text-sm">
        {estado && (
          <button
            type="button"
            onClick={() => setVerHorario((v) => !v)}
            aria-expanded={verHorario}
            className="flex items-center gap-2 rounded-full bg-surface py-1.5 pl-2.5 pr-2 font-medium shadow-card"
          >
            <span className={`h-2 w-2 rounded-full ${estado.abierto ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span>{estado.texto}</span>
            <Icon name="chevron" className={`h-4 w-4 text-ink/50 transition-transform ${verHorario ? 'rotate-180' : ''}`} />
          </button>
        )}

        {verHorario && (
          <dl className="animate-fade-in rounded-2xl bg-surface p-3 shadow-card">
            {DIAS.map((dia, i) => {
              const turno = business.hours?.[dia.clave]
              return (
                <div key={dia.clave} className={`flex justify-between rounded-lg px-2 py-1 ${i === hoy ? 'bg-primary/10 font-semibold' : ''}`}>
                  <dt>{dia.nombre}</dt>
                  <dd className={turno ? 'tabular-nums' : 'text-ink/50'}>
                    {turno ? `${turno.abre} – ${turno.cierra}` : 'Cerrado'}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}

        {business.address && (
          <p className="flex items-start gap-1.5 px-1 text-ink/70">
            <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" />
            {business.address}
          </p>
        )}
      </div>
    </header>
  )
}
