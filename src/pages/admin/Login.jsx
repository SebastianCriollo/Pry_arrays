import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api, isDemo } from '../../lib/api'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../lib/api/demoApi'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

export default function Login() {
  const { user } = useAuth()
  // En modo demo dejamos las credenciales puestas para entrar de un toque.
  const [email, setEmail] = useState(isDemo ? DEMO_EMAIL : '')
  const [password, setPassword] = useState(isDemo ? DEMO_PASSWORD : '')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  const entrar = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await api.signIn(email, password)
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary">
            <Icon name="qr" />
          </span>
          MenúQR
        </Link>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">Entra a tu panel</h1>
        <p className="mt-1 text-ink/60">Administra el menú de tu negocio.</p>

        {isDemo && (
          <p className="mt-5 rounded-xl bg-amber-500/15 px-3.5 py-2.5 text-sm text-amber-900">
            <strong>Modo demo.</strong> Los cambios se guardan solo en este navegador.
          </p>
        )}

        <form onSubmit={entrar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="etiqueta">Correo</label>
            <input id="email" type="email" required autoComplete="email" className="campo" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="etiqueta">Contraseña</label>
            <input id="password" type="password" required autoComplete="current-password" className="campo" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-600/10 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
          <Button type="submit" cargando={cargando} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink/50">¿Olvidaste tu contraseña? Escríbele a quien te instaló MenúQR.</p>
      </div>
    </div>
  )
}
