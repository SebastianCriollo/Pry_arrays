// MODO DEMO: misma interfaz que supabaseApi.js, pero los datos viven en
// localStorage. Sirve para probar la app sin backend y para enseñarle el
// panel a un posible cliente sin crearle una cuenta.
import { demoBusiness, demoMenu } from '../../demo/demoData'
import { fechaEcuador } from '../format'

const KEY = 'menuqr-demo-v1'
const KEY_SESION = 'menuqr-demo-sesion'
export const DEMO_EMAIL = 'demo@menuqr.app'
export const DEMO_PASSWORD = 'demo1234'
const DEMO_USER = { id: 'demo-user', email: DEMO_EMAIL }

const uid = () => crypto.randomUUID()
const esperar = (ms = 120) => new Promise((r) => setTimeout(r, ms)) // simula la red
const byPosition = (a, b) => a.position - b.position

// Construye la base inicial a partir de demoData.js
function crearBase() {
  const business = { id: 'demo-negocio', owner_id: DEMO_USER.id, ...demoBusiness }
  const categories = []
  const products = []
  demoMenu.forEach((cat, i) => {
    const categoria = { id: uid(), business_id: business.id, name: cat.name, position: i + 1, is_visible: true }
    categories.push(categoria)
    cat.products.forEach((p, j) =>
      products.push({
        id: uid(),
        business_id: business.id,
        category_id: categoria.id,
        description: '',
        image_url: null,
        tag: null,
        is_available: true,
        ...p,
        position: j + 1,
      }),
    )
  })
  return { business, categories, products }
}

function leer() {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY))
    if (guardado?.business) return guardado
  } catch {
    /* localStorage bloqueado o dañado: usamos la base inicial */
  }
  const base = crearBase()
  guardar(base)
  return base
}

function guardar(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    throw new Error('El modo demo se quedó sin espacio en el navegador (demasiadas fotos).')
  }
}

// Aplica un cambio a la base y lo guarda.
function mutar(fn) {
  const db = leer()
  const resultado = fn(db)
  guardar(db)
  return resultado
}

// ---------- Vista pública ----------
export async function getMenu(slug) {
  await esperar()
  const db = leer()
  if (slug !== db.business.slug) return null
  const categories = db.categories.filter((c) => c.is_visible).sort(byPosition)
  const ids = new Set(categories.map((c) => c.id))
  return {
    business: db.business,
    categories,
    products: db.products.filter((p) => ids.has(p.category_id)).sort(byPosition),
  }
}

// Estadísticas de la demo: lo que pase en este navegador se suma encima de un
// historial inventado de 30 días, para que el panel no se vea vacío al enseñarlo.
const KEY_STATS = 'menuqr-demo-stats'

function historialDemo() {
  const filas = []
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(Date.now() - i * 86400000)
    const finDeSemana = [0, 6].includes(fecha.getDay())
    // Números pseudoaleatorios pero estables (siempre los mismos para cada día).
    const ruido = Math.abs(Math.sin(fecha.getDate() * 12.9898 + fecha.getMonth() * 78.233)) % 1
    const views = Math.round((finDeSemana ? 46 : 24) + ruido * 18 + (29 - i) * 0.6)
    filas.push({ day: fechaEcuador(fecha), views, orders: Math.round(views * (0.07 + ruido * 0.06)) })
  }
  return filas
}

export async function trackEvent(_slug, kind) {
  try {
    const stats = JSON.parse(localStorage.getItem(KEY_STATS)) ?? {}
    const hoy = fechaEcuador()
    stats[hoy] ??= { views: 0, orders: 0 }
    stats[hoy][kind === 'order' ? 'orders' : 'views'] += 1
    localStorage.setItem(KEY_STATS, JSON.stringify(stats))
  } catch {
    /* ignorar */
  }
}

export async function getStats(_businessId, desde) {
  await esperar()
  let locales = {}
  try {
    locales = JSON.parse(localStorage.getItem(KEY_STATS)) ?? {}
  } catch {
    /* ignorar */
  }
  return historialDemo()
    .filter((f) => f.day >= desde)
    .map((f) => ({ ...f, views: f.views + (locales[f.day]?.views ?? 0), orders: f.orders + (locales[f.day]?.orders ?? 0) }))
}

// ---------- Sesión ----------
const oyentes = new Set()
const haySesion = () => {
  try {
    return localStorage.getItem(KEY_SESION) === '1'
  } catch {
    return false
  }
}

export const getUser = async () => (haySesion() ? DEMO_USER : null)

export function onAuthChange(callback) {
  oyentes.add(callback)
  return () => oyentes.delete(callback)
}

export async function signIn(email, password) {
  await esperar(300)
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error('Correo o contraseña incorrectos')
  }
  localStorage.setItem(KEY_SESION, '1')
  oyentes.forEach((fn) => fn(DEMO_USER))
}

export async function signOut() {
  localStorage.removeItem(KEY_SESION)
  oyentes.forEach((fn) => fn(null))
}

// ---------- Panel ----------
export const getMyBusiness = async () => leer().business

export async function updateBusiness(_id, cambios) {
  await esperar()
  return mutar((db) => Object.assign(db.business, cambios))
}

export const listCategories = async () => leer().categories.sort(byPosition)

export async function createCategory(businessId, name, position) {
  return mutar((db) => {
    const categoria = { id: uid(), business_id: businessId, name, position, is_visible: true }
    db.categories.push(categoria)
    return categoria
  })
}

export async function updateCategory(id, cambios) {
  return mutar((db) => Object.assign(db.categories.find((c) => c.id === id), cambios))
}

export async function deleteCategory(id) {
  mutar((db) => {
    db.categories = db.categories.filter((c) => c.id !== id)
    db.products = db.products.filter((p) => p.category_id !== id)
  })
}

export async function reorderCategories(ids) {
  mutar((db) => db.categories.forEach((c) => (c.position = ids.indexOf(c.id) + 1)))
}

export const listProducts = async () => leer().products.sort(byPosition)

export async function createProduct(businessId, producto) {
  await esperar()
  return mutar((db) => {
    const nuevo = { id: uid(), business_id: businessId, ...producto }
    db.products.push(nuevo)
    return nuevo
  })
}

export async function updateProduct(id, cambios) {
  return mutar((db) => Object.assign(db.products.find((p) => p.id === id), cambios))
}

export async function deleteProduct(id) {
  mutar((db) => {
    db.products = db.products.filter((p) => p.id !== id)
  })
}

export async function reorderProducts(ids) {
  mutar((db) =>
    db.products.forEach((p) => {
      const i = ids.indexOf(p.id)
      if (i !== -1) p.position = i + 1
    }),
  )
}

// En la demo la "subida" guarda la imagen como data URL dentro de localStorage.
export function uploadImage(_businessId, file) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.onerror = () => reject(new Error('No se pudo leer la imagen'))
    lector.readAsDataURL(file)
  })
}

export async function deleteImage() {}
