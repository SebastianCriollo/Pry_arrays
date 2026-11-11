import Icon from '../ui/Icon'
import { formatPrice } from '../../lib/format'

// Barra flotante inferior: aparece cuando hay algo en el pedido.
export default function CartBar({ unidades, total, onAbrir }) {
  if (!unidades) return null
  return (
    <div className="pb-seguro pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl animate-sheet-up px-4">
      <button
        type="button"
        onClick={onAbrir}
        className="pointer-events-auto flex h-14 w-full items-center gap-3 rounded-2xl bg-primary px-4 text-on-primary shadow-float transition active:scale-[0.98]"
      >
        <span className="relative">
          <Icon name="bag" className="h-6 w-6" />
          <span key={unidades} className="absolute -right-2 -top-2 grid h-5 min-w-[1.25rem] animate-pop place-items-center rounded-full bg-on-primary px-1 text-[11px] font-bold text-primary">
            {unidades}
          </span>
        </span>
        <span className="flex-1 text-left font-semibold">Ver mi pedido</span>
        <span className="font-display text-lg font-semibold tabular-nums">{formatPrice(total)}</span>
      </button>
    </div>
  )
}
