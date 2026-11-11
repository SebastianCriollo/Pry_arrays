// Implementación real de la capa de datos, contra Supabase.
// Todas las funciones lanzan un Error si algo falla; la interfaz lo muestra en un aviso.
import { supabase, BUCKET } from '../supabase'

// Devuelve data o lanza el error de Supabase.
const unwrap = ({ data, error }) => {
  if (error) throw error
  return data
}

const byPosition = (a, b) => a.position - b.position

// ---------- Vista pública ----------

// Trae negocio + categorías + productos en UNA sola petición (carga rápida).
export async function getMenu(slug) {
  const row = unwrap(
    await supabase
      .from('businesses')
      .select('*, categories(*), products(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(),
  )
  if (!row) return null
  const { categories, products, ...business } = row
  // Filtramos también aquí: si el dueño tiene sesión abierta, RLS le deja ver
  // sus categorías ocultas, y en la vista pública no deben aparecer.
  const visibles = categories.filter((c) => c.is_visible).sort(byPosition)
  const ids = new Set(visibles.map((c) => c.id))
  return {
    business,
    categories: visibles,
    products: products.filter((p) => ids.has(p.category_id)).sort(byPosition),
  }
}

// Suma una visita ('view') o un pedido ('order') a las estadísticas del día.
// Nunca lanza error: si falla, el menú sigue funcionando igual.
export async function trackEvent(slug, kind) {
  try {
    await supabase.rpc('track_event', { p_slug: slug, p_kind: kind })
  } catch {
    /* sin conexión o migración 002 sin ejecutar: se ignora */
  }
}

// ---------- Sesión ----------

export async function getUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => callback(session?.user ?? null))
  return () => data.subscription.unsubscribe()
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(
      error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error.message,
    )
  }
}

export const signOut = () => supabase.auth.signOut()

// ---------- Panel: negocio ----------

// El negocio del usuario con sesión (RLS + owner_id garantizan que sea el suyo).
export async function getMyBusiness(userId) {
  return unwrap(
    await supabase.from('businesses').select('*').eq('owner_id', userId).order('created_at').limit(1).maybeSingle(),
  )
}

export async function updateBusiness(id, cambios) {
  return unwrap(await supabase.from('businesses').update(cambios).eq('id', id).select().single())
}

// ---------- Panel: categorías ----------

export async function listCategories(businessId) {
  return unwrap(await supabase.from('categories').select('*').eq('business_id', businessId).order('position'))
}

export async function createCategory(businessId, name, position) {
  return unwrap(
    await supabase.from('categories').insert({ business_id: businessId, name, position }).select().single(),
  )
}

export async function updateCategory(id, cambios) {
  return unwrap(await supabase.from('categories').update(cambios).eq('id', id).select().single())
}

export async function deleteCategory(id) {
  unwrap(await supabase.from('categories').delete().eq('id', id))
}

export async function reorderCategories(ids) {
  unwrap(await supabase.rpc('reorder_categories', { p_ids: ids }))
}

// ---------- Panel: productos ----------

export async function listProducts(businessId) {
  return unwrap(await supabase.from('products').select('*').eq('business_id', businessId).order('position'))
}

export async function createProduct(businessId, producto) {
  return unwrap(
    await supabase.from('products').insert({ ...producto, business_id: businessId }).select().single(),
  )
}

export async function updateProduct(id, cambios) {
  return unwrap(await supabase.from('products').update(cambios).eq('id', id).select().single())
}

export async function deleteProduct(id) {
  unwrap(await supabase.from('products').delete().eq('id', id))
}

export async function reorderProducts(ids) {
  unwrap(await supabase.rpc('reorder_products', { p_ids: ids }))
}

// ---------- Panel: estadísticas ----------

// Filas { day: 'AAAA-MM-DD', views, orders } desde la fecha indicada.
export async function getStats(businessId, desde) {
  return unwrap(
    await supabase.from('menu_stats').select('day, views, orders').eq('business_id', businessId).gte('day', desde).order('day'),
  )
}

// ---------- Storage ----------

// Sube una imagen YA comprimida y devuelve su URL pública.
// carpeta: '' para el logo, 'productos' para fotos de productos.
export async function uploadImage(businessId, file, carpeta) {
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp'
  const nombre = `${crypto.randomUUID()}.${ext}`
  const path = [businessId, carpeta, nombre].filter(Boolean).join('/')
  unwrap(
    await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1 año: el nombre es único, nunca cambia
    }),
  )
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Borra una imagen del bucket a partir de su URL pública (si es nuestra).
// No lanza error: si falla solo queda un archivo huérfano.
export async function deleteImage(url) {
  const marca = `/object/public/${BUCKET}/`
  const i = url?.indexOf(marca) ?? -1
  if (i === -1) return
  await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marca.length))])
}
