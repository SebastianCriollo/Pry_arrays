import { useState } from 'react'
import Icon from '../ui/Icon'
import { DIAS, estadoHorario, indiceHoy } from '../../lib/format'

// Logo del negocio; si no subió uno, un monograma con su inicial.
export function Logo({ business, className = 'h-16 w-16 text-2xl' }) {
  if (business.logo_url) {
    return <img src={business.logo_url} alt="" className={`${className} rounded-full bg-surface object-cover`} />
  }
  return (
    <div className={`${className} grid place-items-center rounded-full bg-primary font-display font-extrabold text-on-primary`}>
      {business.name.trim().charAt(0).toUpperCase()}
    </div>
  )
}

// Portada: la foto del negocio o, si no tiene, un fondo con su color de marca.
function Portada({ business }) {
  if (business.cover_url) {
    return <img src={business.cover_url} alt="" fetchpriority="high" className="h-full w-full object-cover" />
  }
  return (
    <div className="relative h-full w-full overflow-hidden bg-primary">
      {/* Círculos decorativos: dan textura sin cargar ninguna imagen */}
      <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15" />
      <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute left-6 top-6 h-16 w-16 rounded-full border-[10px] border-white/10" />
    </div>
  )
}

// Encabezado del menú: portada, logo, nombre, estado (abierto/cerrado), horario y dirección.
export default function BusinessHeader({ business }) {
  const [verHorario, setVerHorario] = useState(false)
  const estado = estadoHorario(business.hours)
  const hoy = indiceHoy()

  return (
    <header className="px-4 pt-4">
      <div className="relative">
        <div className="h-44 overflow-hidden rounded-[28px] sm:h-52">
          <Portada business={business} />
        </div>
        {/* Logo montado sobre el borde inferior de la portada */}
        <div className="absolute -bottom-8 left-5 rounded-full bg-bg p-1 shadow-card">
          <Logo business={business} className="h-[72px] w-[72px] text-3xl" />
        </div>
      </div>

      <div className="px-1 pt-11">
        <h1 className="font-display text-[1.6rem] font-extrabold leading-tight tracking-tight">{business.name}</h1>
        {business.tagline && <p className="mt-1.5 leading-relaxed text-ink/50">{business.tagline}</p>}

        {/* Fila de datos con íconos de línea en el color de marca */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {estado && (
            <button
              type="button"
              onClick={() => setVerHorario((v) => !v)}
              aria-expanded={verHorario}
              className="flex min-h-[32px] items-center gap-2 font-bold"
            >
              <Icon name="clock" className="h-5 w-5 text-primary" strokeWidth={2} />
              <span className={estado.abierto ? 'text-emerald-600' : 'text-red-600'}>{estado.texto.split(' · ')[0]}</span>
              <span className="font-normal text-ink/60">{estado.texto.split(' · ')[1]}</span>
              <Icon name="chevron" className={`h-4 w-4 text-ink/40 transition-transform ${verHorario ? 'rotate-180' : ''}`} />
            </button>
          )}
          {business.address && (
            <p className="flex min-h-[32px] items-center gap-2 text-ink/70">
              <Icon name="pin" className="h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
              {business.address}
            </p>
          )}
        </div>

        {verHorario && (
          <dl className="mt-3 animate-fade-in rounded-2xl bg-ink/[0.04] p-2 text-sm">
            {DIAS.map((dia, i) => {
              const turno = business.hours?.[dia.clave]
              return (
                <div key={dia.clave} className={`flex justify-between rounded-xl px-3 py-1.5 ${i === hoy ? 'bg-surface font-bold shadow-card' : ''}`}>
                  <dt>{dia.nombre}</dt>
                  <dd className={turno ? 'tabular-nums' : 'text-ink/45'}>{turno ? `${turno.abre} – ${turno.cierra}` : 'Cerrado'}</dd>
                </div>
              )
            })}
          </dl>
        )}
      </div>
    </header>
  )
}
