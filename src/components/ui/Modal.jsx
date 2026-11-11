import { useEffect } from 'react'
import Icon from './Icon'

// Ventana modal: en celular sube desde abajo (hoja), en pantallas grandes va centrada.
export default function Modal({ titulo, onClose, children }) {
  // Cierra con Escape y bloquea el scroll del fondo mientras está abierta.
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-3xl bg-bg shadow-float sm:max-w-lg sm:rounded-3xl"
      >
        <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <h2 className="font-display text-xl font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink/5 hover:bg-ink/10"
          >
            <Icon name="x" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 pb-5 pt-2">{children}</div>
      </div>
    </div>
  )
}
