import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-6xl font-semibold text-primary">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Este menú no existe</h1>
        <p className="mt-2 text-ink/60">Revisa el enlace o vuelve a escanear el código QR.</p>
        <Link to="/" className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-ink/5 px-5 font-semibold hover:bg-ink/10">
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
