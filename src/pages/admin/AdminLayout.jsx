import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { api, isDemo } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import Icon from '../../components/ui/Icon'

const PESTANAS = [
  { to: '/admin', end: true, icono: 'list', texto: 'Menú' },
  { to: '/admin/negocio', icono: 'store', texto: 'Negocio' },
  { to: '/admin/qr', icono: 'qr', texto: 'QR' },
  { to: '/admin/estadisticas', icono: 'chart', texto: 'Visitas' },
]

// Marco del panel: exige sesión, carga el negocio del dueño y lo comparte
// con las páginas hijas mediante el contexto de <Outlet>.
export default function AdminLayout() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(undefined) // undefined = cargando · null = sin negocio

  useEffect(() => {
    if (!user) return
    api.getMyBusiness(user.id).then(setBusiness).catch(() => setBusiness(null))
  }, [user])

  if (user === undefined) return <Centro>Cargando…</Centro>
  if (user === null) return <Navigate to="/admin/login" replace />
  if (business === undefined) return <Centro>Cargando tu negocio…</Centro>
  if (business === null) {
    return (
      <Centro>
        <p className="font-display text-xl font-semibold text-ink">Tu cuenta aún no tiene un negocio</p>
        <p className="mt-1">Pídele a quien te instaló MenúQR que lo active.</p>
        <button type="button" onClick={api.signOut} className="mt-4 font-semibold underline">Cerrar sesión</button>
      </Centro>
    )
  }

  return (
    <div className="min-h-dvh pb-16">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Panel{isDemo && ' · demo'}</p>
            <p className="truncate font-display text-lg font-semibold leading-tight">{business.name}</p>
          </div>
          <a
            href={`/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-ink/5 px-3 text-sm font-semibold hover:bg-ink/10"
          >
            Ver menú <Icon name="external" className="h-4 w-4" />
          </a>
          <button type="button" onClick={api.signOut} aria-label="Cerrar sesión" title="Cerrar sesión" className="grid h-10 w-10 place-items-center rounded-xl text-ink/60 hover:bg-ink/5">
            <Icon name="logout" />
          </button>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-2 pt-1">
          {PESTANAS.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end={p.end}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-1 text-sm font-semibold transition-colors sm:flex-none sm:px-4 ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-ink/55 hover:text-ink'
                }`
              }
            >
              <Icon name={p.icono} className="h-[18px] w-[18px]" />
              {p.texto}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5">
        <Outlet context={{ business, setBusiness }} />
      </main>
    </div>
  )
}

function Centro({ children }) {
  return <div className="grid min-h-dvh place-items-center px-6 text-center text-ink/60"><div>{children}</div></div>
}
