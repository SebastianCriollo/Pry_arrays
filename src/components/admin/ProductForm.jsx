import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Switch from '../ui/Switch'
import ImageUploader from './ImageUploader'
import { TAGS } from '../menu/ProductCard'

// Formulario para crear o editar un producto.
// product = null → nuevo (en la categoría "categoriaInicial").
export default function ProductForm({ product, categoriaInicial, categories, businessId, onGuardar, onEliminar, onClose }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? Number(product.price).toFixed(2) : '',
    category_id: product?.category_id ?? categoriaInicial,
    tag: product?.tag ?? '',
    image_url: product?.image_url ?? null,
    is_available: product?.is_available ?? true,
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e?.target ? e.target.value : e }))

  const guardar = async (e) => {
    e.preventDefault()
    // Acepta coma decimal ("2,50"), muy común al escribir precios.
    const precio = Number(String(form.price).replace(',', '.'))
    if (!form.name.trim()) return setError('Escribe el nombre del producto')
    if (!Number.isFinite(precio) || precio < 0 || form.price === '') return setError('Escribe un precio válido, por ejemplo 2.50')
    setError('')
    setGuardando(true)
    const ok = await onGuardar({
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Math.round(precio * 100) / 100,
      category_id: form.category_id,
      tag: form.tag || null,
      image_url: form.image_url,
      is_available: form.is_available,
    })
    if (!ok) setGuardando(false)
  }

  return (
    <Modal titulo={product ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <form onSubmit={guardar} className="space-y-4">
        <ImageUploader value={form.image_url} onChange={set('image_url')} businessId={businessId} />

        <div>
          <label htmlFor="p-nombre" className="etiqueta">Nombre</label>
          <input id="p-nombre" className="campo" value={form.name} onChange={set('name')} maxLength={60} placeholder="Ej.: Capuchino" />
        </div>

        <div>
          <label htmlFor="p-desc" className="etiqueta">Descripción corta <span className="font-normal normal-case tracking-normal text-ink/45">(opcional)</span></label>
          <textarea id="p-desc" rows={2} className="campo resize-none" value={form.description} onChange={set('description')} maxLength={140} placeholder="Ingredientes o cómo se sirve" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="p-precio" className="etiqueta">Precio (USD)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50">$</span>
              <input id="p-precio" inputMode="decimal" className="campo pl-7 tabular-nums" value={form.price} onChange={set('price')} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label htmlFor="p-tag" className="etiqueta">Etiqueta</label>
            <select id="p-tag" className="campo" value={form.tag} onChange={set('tag')}>
              <option value="">Ninguna</option>
              {Object.entries(TAGS).map(([valor, t]) => (
                <option key={valor} value={valor}>{t.texto}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="p-cat" className="etiqueta">Categoría</label>
          <select id="p-cat" className="campo" value={form.category_id} onChange={set('category_id')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-ink/5 px-3.5 py-2.5">
          <div>
            <p className="text-sm font-semibold">Disponible</p>
            <p className="text-xs text-ink/55">Apágalo para mostrarlo como AGOTADO.</p>
          </div>
          <Switch checked={form.is_available} onChange={set('is_available')} label="Disponible" />
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-600/10 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}

        <div className="flex gap-2 pt-1">
          {product && (
            <Button variante="suave" className="!text-red-700" onClick={onEliminar}>
              Eliminar
            </Button>
          )}
          <Button type="submit" cargando={guardando} className="flex-1">
            {product ? 'Guardar cambios' : 'Agregar producto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
