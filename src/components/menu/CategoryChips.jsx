import { useEffect, useRef } from 'react'

// Chips de categorías con scroll horizontal. El chip activo se resalta y
// se desliza solo hasta quedar visible cuando el cliente baja por el menú.
export default function CategoryChips({ categories, activa, onSelect }) {
  const contenedor = useRef(null)

  useEffect(() => {
    const cinta = contenedor.current
    const chip = cinta?.querySelector('[aria-current="true"]')
    if (!chip) return
    // Movemos solo la cinta (no la página) para centrar el chip activo.
    cinta.scrollTo({ left: chip.offsetLeft - (cinta.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' })
  }, [activa])

  return (
    <div ref={contenedor} className="sin-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4" role="navigation" aria-label="Categorías">
      {categories.map((c) => {
        const esActiva = c.id === activa
        return (
          <button
            key={c.id}
            type="button"
            aria-current={esActiva}
            onClick={() => onSelect(c.id)}
            className={`h-[46px] shrink-0 whitespace-nowrap rounded-full border-2 px-5 font-bold transition-colors ${
              esActiva ? 'border-primary bg-primary text-on-primary' : 'border-ink/[0.07] bg-bg text-ink/80'
            }`}
          >
            {c.name}
          </button>
        )
      })}
    </div>
  )
}
