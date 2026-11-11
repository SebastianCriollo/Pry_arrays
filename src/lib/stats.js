// Registro de visitas al menú público.
import { api } from './api'
import { fechaEcuador } from './format'

// Cuenta UNA visita por celular y por día (recargar la página no suma),
// y no cuenta al propio dueño cuando revisa su menú con la sesión abierta.
export async function registrarVisita(business) {
  const clave = `menuqr-visto-${business.slug}-${fechaEcuador()}`
  try {
    if (localStorage.getItem(clave)) return
    localStorage.setItem(clave, '1')
  } catch {
    /* navegación privada: se cuenta igual */
  }
  const user = await api.getUser().catch(() => null)
  if (user && user.id === business.owner_id) return
  api.trackEvent(business.slug, 'view')
}

// Cada toque en "Pedir por WhatsApp" cuenta como un pedido enviado.
export const registrarPedido = (business) => api.trackEvent(business.slug, 'order')
