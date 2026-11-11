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
        className="pointer-events-auto flex h-[62px] w-full items-center gap-3 rounded-2xl bg-[#121223] pl-4 pr-2 text-white shadow-float transition active:scale-[0.98]"
      >
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <Icon name="bag" className="h-5 w-5" strokeWidth={2} />
          <span key={unidades} className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[1.25rem] animate-pop place-items-center rounded-full bg-primary px-1 text-[11px] font-extrabold text-on-primary">
            {unidades}
          </span>
        </span>
        <span className="flex-1 text-left text-sm font-extrabold uppercase tracking-wider">Ver mi pedido</span>
        <span className="rounded-xl bg-primary px-3.5 py-2.5 text-[17px] font-extrabold tabular-nums text-on-primary">{formatPrice(total)}</span>
      </button>
    </div>
  )
}
