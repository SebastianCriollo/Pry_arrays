import Icon from '../ui/Icon'
import { formatPrice } from '../../lib/format'

// Etiquetas opcionales de un producto. La clave es el valor guardado en la base.
export const TAGS = {
  nuevo: { texto: 'Nuevo', icono: 'sparkle', clase: 'bg-emerald-600/10 text-emerald-700' },
  mas_pedido: { texto: 'Más pedido', icono: 'star', clase: 'bg-amber-500/15 text-amber-700' },
  picante: { texto: 'Picante', icono: 'flame', clase: 'bg-red-600/10 text-red-700' },
}

// Botón "+" que se convierte en − cantidad + cuando el producto ya está en el pedido.
export function Stepper({ cantidad, onCambiar, nombre }) {
  if (!cantidad) {
    return (
      <button
        type="button"
        onClick={() => onCambiar(1)}
        aria-label={`Agregar ${nombre}`}
        className="grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary shadow-card transition active:scale-90"
      >
        <Icon name="plus" strokeWidth={2.4} />
      </button>
    )
  }
  return (
    <div className="flex h-10 items-center rounded-full bg-primary text-on-primary shadow-card">
      <button type="button" onClick={() => onCambiar(-1)} aria-label={`Quitar uno de ${nombre}`} className="grid h-10 w-10 place-items-center rounded-full active:scale-90">
        <Icon name="minus" strokeWidth={2.4} />
      </button>
      <span key={cantidad} className="min-w-[1.25rem] animate-pop text-center text-sm font-bold tabular-nums" aria-live="polite">
        {cantidad}
      </span>
      <button type="button" onClick={() => onCambiar(1)} aria-label={`Agregar otro ${nombre}`} className="grid h-10 w-10 place-items-center rounded-full active:scale-90">
        <Icon name="plus" strokeWidth={2.4} />
      </button>
    </div>
  )
}

export default function ProductCard({ product, cantidad, onCambiar, puedePedir }) {
  const agotado = !product.is_available
  const tag = TAGS[product.tag]
  const mostrarBoton = !agotado && puedePedir

  return (
    <article className={`relative flex gap-3 rounded-2xl bg-surface p-3 shadow-card ${agotado ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        {tag && !agotado && (
          <span className={`mb-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tag.clase}`}>
            <Icon name={tag.icono} className="h-3 w-3" strokeWidth={2.2} />
            {tag.texto}
          </span>
        )}
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        {product.description && <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink/60">{product.description}</p>}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className={`font-display text-lg font-semibold tabular-nums ${agotado ? 'line-through decoration-1' : ''}`}>
            {formatPrice(product.price)}
          </span>
          {agotado && (
            <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold tracking-wider text-bg">AGOTADO</span>
          )}
        </div>
      </div>

      {/* Con foto: el botón va montado en su esquina. Sin foto: ocupa su propio espacio. */}
      {product.image_url ? (
        <div className="relative shrink-0 self-center">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="104"
            height="104"
            className="h-[104px] w-[104px] rounded-xl bg-ink/5 object-cover"
          />
          {mostrarBoton && (
            <div className="absolute -bottom-2 -right-1">
              <Stepper cantidad={cantidad} onCambiar={onCambiar} nombre={product.name} />
            </div>
          )}
        </div>
      ) : (
        mostrarBoton && (
          <div className="shrink-0 self-center">
            <Stepper cantidad={cantidad} onCambiar={onCambiar} nombre={product.name} />
          </div>
        )
      )}
    </article>
  )
}
