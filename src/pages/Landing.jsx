import { Link } from 'react-router-dom'
import Icon, { IconWhatsApp } from '../components/ui/Icon'
import { demoBusiness } from '../demo/demoData'
import { enlaceWhatsApp } from '../lib/whatsapp'

// Página de inicio "/": presentación breve del servicio para negocios.
const VENTAS = import.meta.env.VITE_VENTAS_WHATSAPP

const BENEFICIOS = [
  { icono: 'qr', titulo: 'Un QR en cada mesa', texto: 'Tus clientes escanean y ven el menú al instante. Sin descargar nada.' },
  { icono: 'pencil', titulo: 'Tú lo actualizas', texto: 'Cambia precios, fotos o marca un plato como agotado desde tu celular.' },
  { icono: 'bag', titulo: 'Pedidos por WhatsApp', texto: 'El cliente arma su pedido y te llega listo, con el total calculado.' },
]

export default function Landing() {
  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 py-10 sm:py-16">
      <p className="flex items-center gap-2 font-display text-xl font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary">
          <Icon name="qr" />
        </span>
        MenúQR
      </p>

      <h1 className="mt-10 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        El menú de tu local, <em className="text-primary">siempre al día</em>.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink/70">
        Menú digital con código QR para restaurantes y cafeterías de Machachi. Sin reimprimir cartas cada vez que cambia un precio.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link to={`/${demoBusiness.slug}`} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-on-primary shadow-card">
          Ver menú de ejemplo
        </Link>
        {VENTAS && (
          <a
            href={enlaceWhatsApp(VENTAS, 'Hola, quiero un menú digital con QR para mi negocio.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-ink/5 px-5 font-semibold"
          >
            <IconWhatsApp /> Quiero el mío
          </a>
        )}
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-3">
        {BENEFICIOS.map((b) => (
          <li key={b.titulo} className="rounded-2xl bg-surface p-5 shadow-card">
            <Icon name={b.icono} className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-semibold">{b.titulo}</h2>
            <p className="mt-1 text-sm text-ink/65">{b.texto}</p>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm text-ink/50">
        ¿Ya eres cliente?{' '}
        <Link to="/admin" className="font-semibold text-ink/80 underline underline-offset-2">
          Entrar a mi panel
        </Link>
      </p>
    </div>
  )
}
