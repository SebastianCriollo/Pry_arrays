import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../ui/Icon'

// Lista vertical reordenable con arrastrar y soltar (ratón, táctil y teclado).
// items: objetos con "id" · onReorder(nuevaLista) se llama al soltar.
export function SortableList({ items, onReorder, children }) {
  const sensores = useSensors(
    // Mover 6 px antes de arrastrar: así un toque normal no dispara el arrastre.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const alSoltar = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const desde = items.findIndex((i) => i.id === active.id)
    const hasta = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, desde, hasta))
  }

  return (
    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

// Envuelve un elemento de la lista. "children" es una función que recibe el
// agarrador (handle): solo desde ahí se arrastra, el resto se toca normal.
export function SortableItem({ id, className = '', children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Arrastrar para ordenar"
      className="grid h-10 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-ink/35 hover:bg-ink/5 hover:text-ink/70 active:cursor-grabbing"
    >
      <Icon name="grip" strokeWidth={2.6} />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`${className} ${isDragging ? 'relative z-10 shadow-float' : ''}`}
    >
      {children(handle)}
    </div>
  )
}
