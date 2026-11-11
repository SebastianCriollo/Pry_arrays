import { useEffect, useState } from 'react'
import Icon, { IconWhatsApp } from '../ui/Icon'
import { Stepper } from './ProductCard'
import { formatPrice } from '../../lib/format'
import { enlaceWhatsApp, mensajePedido } from '../../lib/whatsapp'

// Pantalla del pedido: lista de productos sobre fondo oscuro y, abajo,
// un panel claro con los datos opcionales, el total y el botón de WhatsApp.
export default function CartSheet({ business, cart, mesa, onPedir, onClose }) {
  const [nombre, setNombre] = useState('')
  const [nota, setNota] = useState('')
  const { items, total, cambiar, vaciar } = cart

  // Cierra con Escape y bloquea el scroll del menú mientras está abierta.
  useEffect(() => {
    const alPulsar = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', alPulsar)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.style.overflow = previo
    }
  }, [onClose])

  // Es un <a> real (no window.open) para que el celular abra WhatsApp
  // directamente sin que el navegador lo bloquee como ventana emergente.
  const href = enlaceWhatsApp(
    business.whatsapp,
    mensajePedido({ business, items, total, nombre: nombre.trim(), nota: nota.trim(), mesa }),
  )

  return (
    <div role="dialog" aria-modal="true" aria-label="Tu pedido" className="fixed inset-0 z-50 flex animate-fade-in justify-center bg-black/50">
      <div className="flex h-full w-full max-w-xl animate-sheet-up flex-col bg-[#121223] text-white">
        {/* Encabezado */}
        <header className="flex items-center gap-3 px-5 pb-3 pt-5">
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 active:scale-95">
            <Icon name="x" strokeWidth={2.2} />
          </button>
          <h2 className="flex-1 text-[17px] font-bold">Tu pedido</h2>
          {items.length > 0 && (
            <button type="button" onClick={vaciar} className="min-h-[40px] px-1 text-sm font-bold uppercase tracking-wide text-primary underline underline-offset-4">
              Vaciar
            </button>
          )}
        </header>

        {/* Productos */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {mesa && <p className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-sm font-bold text-on-primary">Mesa {mesa}</p>}
          {items.length === 0 ? (
            <p className="py-16 text-center text-white/60">Tu pedido está vacío.</p>
          ) : (
            <ul className="space-y-5 pt-3">
              {items.map(({ product, cantidad }) => (
                <li key={product.id} className="flex items-center gap-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="h-[84px] w-[84px] shrink-0 rounded-[22px] bg-white/10 object-cover" />
                  ) : (
                    <span className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-[22px] bg-white/[0.08] text-2xl font-extrabold text-white/40">
                      {product.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] leading-snug">{product.name}</p>
                    <p className="mt-1 text-lg font-extrabold tabular-nums">{formatPrice(product.price * cantidad)}</p>
                    {cantidad > 1 && <p className="text-xs text-white/45">{formatPrice(product.price)} c/u</p>}
                  </div>
                  <Stepper cantidad={cantidad} onCambiar={(d) => cambiar(product.id, d)} nombre={product.name} oscuro={false} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel inferior claro */}
        {items.length > 0 && (
          <div className="pb-seguro rounded-t-[28px] bg-bg px-5 pt-6 text-ink">
            <div className="space-y-3">
              <input className="campo" placeholder="Tu nombre (opcional)" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} autoComplete="given-name" />
              <textarea className="campo resize-none" rows={2} placeholder="¿Alguna indicación? Ej.: sin cebolla, para llevar…" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={200} />
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-sm font-bold uppercase tracking-wider text-ink/45">Total:</span>
              <span className="text-[30px] font-bold leading-none tabular-nums">{formatPrice(total)}</span>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onPedir}
              className="mt-5 flex h-[62px] items-center justify-center gap-2.5 rounded-xl bg-[#1FAF5A] text-sm font-extrabold uppercase tracking-wider text-white transition active:scale-[0.98]"
            >
              <IconWhatsApp className="h-6 w-6" />
              Pedir por WhatsApp
            </a>
            <p className="mb-1 mt-2.5 text-center text-xs text-ink/45">Se abrirá WhatsApp con tu pedido listo para enviar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
