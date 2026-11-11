import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Modal from '../../components/ui/Modal'
import Switch from '../../components/ui/Switch'
import ProductForm from '../../components/admin/ProductForm'
import { SortableItem, SortableList } from '../../components/admin/Sortable'

// Página principal del panel: categorías y productos.
export default function ProductsPage() {
  const { business } = useOutletContext()
  const toast = useToast()
  const [categories, setCategories] = useState(null)
  const [products, setProducts] = useState([])
  const [editCategoria, setEditCategoria] = useState(null) // {id?, name}
  const [editProducto, setEditProducto] = useState(null) // {product?, categoryId}

  const cargar = () =>
    Promise.all([api.listCategories(business.id), api.listProducts(business.id)])
      .then(([c, p]) => {
        setCategories(c)
        setProducts(p)
      })
      .catch(() => toast('No se pudo cargar el menú', 'error'))

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id])

  // Ejecuta una acción; si falla avisa y recarga para deshacer el cambio optimista.
  const intentar = async (accion, mensajeError = 'No se pudo guardar') => {
    try {
      await accion()
      return true
    } catch {
      toast(mensajeError, 'error')
      cargar()
      return false
    }
  }

  const productosDe = (categoryId) => products.filter((p) => p.category_id === categoryId)

  // ---------- Categorías ----------
  const guardarCategoria = async (e) => {
    e.preventDefault()
    const name = editCategoria.name.trim()
    if (!name) return
    const ok = await intentar(async () => {
      if (editCategoria.id) {
        const actualizada = await api.updateCategory(editCategoria.id, { name })
        setCategories((cs) => cs.map((c) => (c.id === actualizada.id ? actualizada : c)))
      } else {
        const posicion = Math.max(0, ...categories.map((c) => c.position)) + 1
        const nueva = await api.createCategory(business.id, name, posicion)
        setCategories((cs) => [...cs, nueva])
      }
    })
    if (ok) setEditCategoria(null)
  }

  const alternarVisible = (categoria) => {
    const is_visible = !categoria.is_visible
    setCategories((cs) => cs.map((c) => (c.id === categoria.id ? { ...c, is_visible } : c)))
    intentar(() => api.updateCategory(categoria.id, { is_visible }))
  }

  const eliminarCategoria = async (categoria) => {
    const n = productosDe(categoria.id).length
    const aviso = n ? ` y sus ${n} producto${n === 1 ? '' : 's'}` : ''
    if (!confirm(`¿Eliminar la categoría "${categoria.name}"${aviso}? No se puede deshacer.`)) return
    setCategories((cs) => cs.filter((c) => c.id !== categoria.id))
    setProducts((ps) => ps.filter((p) => p.category_id !== categoria.id))
    if (await intentar(() => api.deleteCategory(categoria.id), 'No se pudo eliminar')) toast('Categoría eliminada')
  }

  const reordenarCategorias = (ordenadas) => {
    setCategories(ordenadas.map((c, i) => ({ ...c, position: i + 1 })))
    intentar(() => api.reorderCategories(ordenadas.map((c) => c.id)), 'No se pudo guardar el orden')
  }

  // ---------- Productos ----------
  const reordenarProductos = (categoryId, ordenados) => {
    const posiciones = new Map(ordenados.map((p, i) => [p.id, i + 1]))
    setProducts((ps) =>
      ps.map((p) => (posiciones.has(p.id) ? { ...p, position: posiciones.get(p.id) } : p)).sort((a, b) => a.position - b.position),
    )
    intentar(() => api.reorderProducts(ordenados.map((p) => p.id)), 'No se pudo guardar el orden')
  }

  const alternarDisponible = (producto) => {
    const is_available = !producto.is_available
    setProducts((ps) => ps.map((p) => (p.id === producto.id ? { ...p, is_available } : p)))
    intentar(() => api.updateProduct(producto.id, { is_available }))
  }

  const guardarProducto = async (datos) => {
    const anterior = editProducto.product
    const ok = await intentar(async () => {
      if (anterior) {
        // Si cambió de categoría, va al final de la nueva.
        const cambios =
          datos.category_id !== anterior.category_id
            ? { ...datos, position: Math.max(0, ...productosDe(datos.category_id).map((p) => p.position)) + 1 }
            : datos
        const actualizado = await api.updateProduct(anterior.id, cambios)
        setProducts((ps) => ps.map((p) => (p.id === actualizado.id ? actualizado : p)).sort((a, b) => a.position - b.position))
        // Limpia del storage la foto que fue reemplazada o quitada.
        if (anterior.image_url && anterior.image_url !== datos.image_url) api.deleteImage(anterior.image_url)
      } else {
        const position = Math.max(0, ...productosDe(datos.category_id).map((p) => p.position)) + 1
        const nuevo = await api.createProduct(business.id, { ...datos, position })
        setProducts((ps) => [...ps, nuevo])
      }
    })
    if (ok) {
      setEditProducto(null)
      toast(anterior ? 'Cambios guardados' : 'Producto agregado')
    }
    return ok
  }

  const eliminarProducto = async () => {
    const producto = editProducto.product
    if (!confirm(`¿Eliminar "${producto.name}"?`)) return
    setEditProducto(null)
    setProducts((ps) => ps.filter((p) => p.id !== producto.id))
    if (await intentar(() => api.deleteProduct(producto.id), 'No se pudo eliminar')) {
      if (producto.image_url) api.deleteImage(producto.image_url)
      toast('Producto eliminado')
    }
  }

  if (!categories) return <p className="py-16 text-center text-ink/50">Cargando menú…</p>

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Tu menú</h1>
          <p className="text-sm text-ink/55">Arrastra <Icon name="grip" className="inline h-4 w-4" strokeWidth={2.6} /> para cambiar el orden.</p>
        </div>
        <Button onClick={() => setEditCategoria({ name: '' })}>
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} /> Categoría
        </Button>
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-ink/15 px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">Empieza por una categoría</p>
          <p className="mt-1 text-sm text-ink/60">Por ejemplo: Entradas, Platos fuertes, Bebidas o Postres.</p>
        </div>
      )}

      <SortableList items={categories} onReorder={reordenarCategorias}>
        <div className="space-y-4">
          {categories.map((categoria) => {
            const lista = productosDe(categoria.id)
            return (
              <SortableItem key={categoria.id} id={categoria.id} className="rounded-2xl bg-surface shadow-card">
                {(handle) => (
                  <>
                    <div className="flex items-center gap-1 px-2 py-2">
                      {handle}
                      <h2 className={`min-w-0 flex-1 truncate font-display text-lg font-semibold ${categoria.is_visible ? '' : 'text-ink/40 line-through'}`}>
                        {categoria.name}
                        <span className="ml-2 font-sans text-xs font-medium text-ink/40 no-underline">{lista.length}</span>
                      </h2>
                      <BotonIcono icono={categoria.is_visible ? 'eye' : 'eyeOff'} titulo={categoria.is_visible ? 'Ocultar categoría' : 'Mostrar categoría'} onClick={() => alternarVisible(categoria)} />
                      <BotonIcono icono="pencil" titulo="Cambiar nombre" onClick={() => setEditCategoria({ id: categoria.id, name: categoria.name })} />
                      <BotonIcono icono="trash" titulo="Eliminar categoría" onClick={() => eliminarCategoria(categoria)} />
                    </div>

                    {!categoria.is_visible && <p className="px-4 pb-2 text-xs font-medium text-ink/50">Oculta: tus clientes no ven esta categoría.</p>}

                    <SortableList items={lista} onReorder={(orden) => reordenarProductos(categoria.id, orden)}>
                      <div className="border-t border-ink/10">
                        {lista.map((producto) => (
                          <SortableItem key={producto.id} id={producto.id} className="border-b border-ink/10 bg-surface">
                            {(handleProducto) => (
                              <div className="flex items-center gap-2 py-2 pl-2 pr-3">
                                {handleProducto}
                                <button type="button" onClick={() => setEditProducto({ product: producto })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                  {producto.image_url ? (
                                    <img src={producto.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                                  ) : (
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink/5 text-ink/30">
                                      <Icon name="image" />
                                    </span>
                                  )}
                                  <span className="min-w-0">
                                    <span className={`block truncate font-semibold ${producto.is_available ? '' : 'text-ink/45'}`}>{producto.name}</span>
                                    <span className="block text-sm tabular-nums text-ink/55">
                                      {formatPrice(producto.price)}
                                      {!producto.is_available && <span className="ml-2 font-semibold text-red-700">Agotado</span>}
                                    </span>
                                  </span>
                                </button>
                                <Switch checked={producto.is_available} onChange={() => alternarDisponible(producto)} label={`${producto.name} disponible`} />
                              </div>
                            )}
                          </SortableItem>
                        ))}
                      </div>
                    </SortableList>

                    <button
                      type="button"
                      onClick={() => setEditProducto({ categoryId: categoria.id })}
                      className="flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-b-2xl text-sm font-semibold text-primary hover:bg-primary/5"
                    >
                      <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} /> Agregar producto
                    </button>
                  </>
                )}
              </SortableItem>
            )
          })}
        </div>
      </SortableList>

      {editCategoria && (
        <Modal titulo={editCategoria.id ? 'Cambiar nombre' : 'Nueva categoría'} onClose={() => setEditCategoria(null)}>
          <form onSubmit={guardarCategoria} className="space-y-4">
            <div>
              <label htmlFor="c-nombre" className="etiqueta">Nombre de la categoría</label>
              <input id="c-nombre" autoFocus className="campo" maxLength={40} placeholder="Ej.: Bebidas calientes" value={editCategoria.name} onChange={(e) => setEditCategoria({ ...editCategoria, name: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </Modal>
      )}

      {editProducto && (
        <ProductForm
          product={editProducto.product ?? null}
          categoriaInicial={editProducto.categoryId}
          categories={categories}
          businessId={business.id}
          onGuardar={guardarProducto}
          onEliminar={eliminarProducto}
          onClose={() => setEditProducto(null)}
        />
      )}
    </>
  )
}

function BotonIcono({ icono, titulo, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={titulo} title={titulo} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink">
      <Icon name={icono} className="h-[18px] w-[18px]" />
    </button>
  )
}
