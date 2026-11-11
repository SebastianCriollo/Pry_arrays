import Icon from '../ui/Icon'
import { formatPrice } from '../../lib/format'

// Etiquetas opcionales de un producto. La clave es el valor guardado en la base.
export const TAGS = {
  nuevo: { texto: 'Nuevo', icono: 'sparkle', clase: 'text-emerald-600' },
  mas_pedido: { texto: 'Más pedido', icono: 'star', clase: 'text-amber-500' },
  picante: { texto: 'Picante', icono: 'flame', clase: 'text-red-600' },
}

// Botón "+" redondo que se convierte en una píldora oscura − cantidad +
// cuando el producto ya está en el pedido.
export function Stepper({ cantidad, onCambiar, nombre, oscuro = true }) {
  if (!cantidad) {
    return (
      <button
        type="button"
        onClick={() => onCambiar(1)}
        aria-label={`Agregar ${nombre}`}
        className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary transition active:scale-90"
      >
        <Icon name="plus" className="h-[18px] w-[18px]" strokeWidth={2.6} />
      </button>
    )
  }
  const pildora = oscuro ? 'bg-[#121223] text-white' : 'bg-white/10 text-white'
  return (
    <div className={`flex h-9 items-center gap-0.5 rounded-full px-0.5 ${pildora}`}>
      <button type="button" onClick={() => onCambiar(-1)} aria-label={`Quitar uno de ${nombre}`} className="grid h-8 w-8 place-items-center rounded-full bg-white/20 active:scale-90">
        <Icon name="minus" className="h-4 w-4" strokeWidth={2.6} />
      </button>
      <span key={cantidad} className="min-w-[1.25rem] animate-pop text-center text-sm font-bold tabular-nums" aria-live="polite">
        {cantidad}
      </span>
      <button type="button" onClick={() => onCambiar(1)} aria-label={`Agregar otro ${nombre}`} className="grid h-8 w-8 place-items-center rounded-full bg-white/20 active:scale-90">
        <Icon name="plus" className="h-4 w-4" strokeWidth={2.6} />
      </button>
    </div>
  )
}

// Pastilla de etiqueta ("Más pedido", "AGOTADO"…).
function Etiqueta({ product, sobreFoto }) {
  if (!product.is_available) {
    return <span className="rounded-full bg-[#121223] px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white">AGOTADO</span>
  }
  const tag = TAGS[product.tag]
  if (!tag) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        sobreFoto ? 'bg-white/95 text-[#181C2E] shadow-sm backdrop-blur' : 'bg-ink/[0.05] text-ink/80'
      }`}
    >
      <Icon name={tag.icono} className={`h-3.5 w-3.5 ${tag.clase}`} strokeWidth={2.4} />
      {tag.texto}
    </span>
  )
}

// Tarjeta del producto. variante:
//  'grid'  → tarjeta vertical con foto arriba (cuando la categoría tiene fotos)
//  'lista' → fila horizontal compacta (categorías sin fotos)
export default function ProductCard({ product, cantidad, onCambiar, puedePedir, variante = 'lista' }) {
  const agotado = !product.is_available
  const mostrarBoton = !agotado && puedePedir
  const precio = (
    <span className={`text-[17px] font-extrabold tabular-nums ${agotado ? 'text-ink/50 line-through decoration-2' : ''}`}>
      {formatPrice(product.price)}
    </span>
  )
  const boton = mostrarBoton && <Stepper cantidad={cantidad} onCambiar={onCambiar} nombre={product.name} />

  if (variante === 'grid') {
    return (
      <article className={`flex flex-col rounded-3xl bg-surface p-2 shadow-card ${agotado ? 'opacity-70' : ''}`}>
        <div className="relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`aspect-square w-full rounded-[18px] bg-ink/5 object-cover ${agotado ? 'grayscale' : ''}`}
            />
          ) : (
            // Producto sin foto dentro de una categoría con fotos: un fondo suave con su inicial.
            <div className="grid aspect-square w-full place-items-center rounded-[18px] bg-primary/10 text-4xl font-extrabold text-primary/50">
              {product.name.charAt(0)}
            </div>
          )}
          <div className="absolute left-2 top-2">
            <Etiqueta product={product} sobreFoto />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2.5">
          <h3 className="font-bold leading-snug">{product.name}</h3>
          {product.description && <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink/50">{product.description}</p>}
          <div className="mt-auto flex min-h-[44px] flex-wrap items-end justify-between gap-x-1 gap-y-1.5 pt-2">
            {precio}
            {boton}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`flex gap-3 rounded-3xl bg-surface p-4 shadow-card ${agotado ? 'opacity-70' : ''}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1.5 empty:hidden">
          <Etiqueta product={product} />
        </div>
        <h3 className="font-bold leading-snug">{product.name}</h3>
        {product.description && <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink/50">{product.description}</p>}
        <div className="mt-auto pt-2">{precio}</div>
      </div>
      {boton && <div className="shrink-0 self-end">{boton}</div>}
    </article>
  )
}
