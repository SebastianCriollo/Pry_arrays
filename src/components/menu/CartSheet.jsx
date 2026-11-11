import { useState } from 'react'
import Modal from '../ui/Modal'
import { IconWhatsApp } from '../ui/Icon'
import { Stepper } from './ProductCard'
import { formatPrice } from '../../lib/format'
import { enlaceWhatsApp, mensajePedido } from '../../lib/whatsapp'

// Hoja del pedido: lista, cantidades, datos opcionales y botón de WhatsApp.
export default function CartSheet({ business, cart, mesa, onClose }) {
  const [nombre, setNombre] = useState('')
  const [nota, setNota] = useState('')
  const { items, total, cambiar, vaciar } = cart

  // Es un <a> real (no window.open) para que el celular abra WhatsApp
  // directamente sin que el navegador lo bloquee como ventana emergente.
  const href = enlaceWhatsApp(
    business.whatsapp,
    mensajePedido({ business, items, total, nombre: nombre.trim(), nota: nota.trim(), mesa }),
  )

  return (
    <Modal titulo="Tu pedido" onClose={onClose}>
      {items.length === 0 ? (
        <p className="py-10 text-center text-ink/60">Tu pedido está vacío.</p>
      ) : (
        <>
          {mesa && <p className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">Mesa {mesa}</p>}

          <ul className="divide-y divide-ink/10">
            {items.map(({ product, cantidad }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{product.name}</p>
                  <p className="text-sm tabular-nums text-ink/60">{formatPrice(product.price * cantidad)}</p>
                </div>
                <Stepper cantidad={cantidad} onCambiar={(d) => cambiar(product.id, d)} nombre={product.name} />
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-baseline justify-between border-t border-ink/15 pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-semibold tabular-nums">{formatPrice(total)}</span>
          </div>

          <div className="mt-4 space-y-3">
            <input className="campo" placeholder="Tu nombre (opcional)" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} autoComplete="given-name" />
            <textarea className="campo resize-none" rows={2} placeholder="¿Alguna indicación? Ej.: sin cebolla, para llevar…" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={200} />
          </div>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1FAF5A] text-base font-bold text-white shadow-float transition active:scale-[0.98]"
          >
            <IconWhatsApp className="h-6 w-6" />
            Pedir por WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-ink/50">Se abrirá WhatsApp con tu pedido listo para enviar.</p>

          <button type="button" onClick={vaciar} className="mx-auto mt-3 block min-h-[40px] px-3 text-sm font-semibold text-ink/55 underline-offset-2 hover:underline">
            Vaciar pedido
          </button>
        </>
      )}
    </Modal>
  )
}
