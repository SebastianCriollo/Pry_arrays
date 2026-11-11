import { useCallback, useEffect, useMemo, useState } from 'react'

// Carrito del cliente. Se guarda en el celular (localStorage), separado por
// negocio, para que no se pierda si recarga la página.
// Forma: { [idProducto]: cantidad }
export function useCart(slug, products) {
  const clave = `menuqr-carrito-${slug}`

  const [cantidades, setCantidades] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(clave)) ?? {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(cantidades))
    } catch {
      /* navegación privada: el carrito vive solo en memoria */
    }
  }, [clave, cantidades])

  // Suma (o resta) unidades; al llegar a 0 el producto sale del carrito.
  const cambiar = useCallback((id, delta) => {
    setCantidades((actual) => {
      const cantidad = Math.min(99, (actual[id] ?? 0) + delta)
      const siguiente = { ...actual }
      if (cantidad <= 0) delete siguiente[id]
      else siguiente[id] = cantidad
      return siguiente
    })
  }, [])

  const vaciar = useCallback(() => setCantidades({}), [])

  // Solo cuentan productos que siguen existiendo y disponibles: si algo se
  // agotó mientras el cliente miraba, desaparece del pedido.
  const { items, total, unidades } = useMemo(() => {
    const items = (products ?? [])
      .filter((p) => p.is_available && cantidades[p.id] > 0)
      .map((product) => ({ product, cantidad: cantidades[product.id] }))
    return {
      items,
      total: items.reduce((suma, i) => suma + Number(i.product.price) * i.cantidad, 0),
      unidades: items.reduce((suma, i) => suma + i.cantidad, 0),
    }
  }, [products, cantidades])

  return { cantidades, items, total, unidades, cambiar, vaciar }
}
