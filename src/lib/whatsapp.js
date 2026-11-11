// Arma el mensaje del pedido y el enlace wa.me
import { formatPrice, soloDigitos } from './format'

// items: [{ product, cantidad }]
export function mensajePedido({ business, items, total, nombre, nota, mesa }) {
  const lineas = [`*Nuevo pedido — ${business.name}*`]
  if (mesa) lineas.push(`Mesa: ${mesa}`)
  if (nombre) lineas.push(`Nombre: ${nombre}`)
  lineas.push('')
  items.forEach(({ product, cantidad }) => {
    lineas.push(`• ${cantidad} × ${product.name} — ${formatPrice(product.price * cantidad)}`)
  })
  lineas.push('', `*Total: ${formatPrice(total)}*`)
  if (nota) lineas.push('', `Nota: ${nota}`)
  return lineas.join('\n')
}

export const enlaceWhatsApp = (numero, mensaje = '') =>
  `https://wa.me/${soloDigitos(numero)}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
