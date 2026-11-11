import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../hooks/useCart'
import { themeVars } from '../lib/theme'
import { normalizar } from '../lib/format'
import BusinessHeader from '../components/menu/BusinessHeader'
import ContactButtons from '../components/menu/ContactButtons'
import SearchBar from '../components/menu/SearchBar'
import CategoryChips from '../components/menu/CategoryChips'
import ProductCard from '../components/menu/ProductCard'
import CartBar from '../components/menu/CartBar'
import CartSheet from '../components/menu/CartSheet'
import NotFound from './NotFound'

// Vista pública: lo que ve el cliente al escanear el QR →  /:slug
// Si el QR trae ?mesa=5, el número de mesa se incluye en el pedido.
export default function PublicMenu() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const mesa = (params.get('mesa') ?? '').slice(0, 10)

  const { menu, estado } = useMenu(slug)
  const cart = useCart(slug, menu?.products)
  const [busqueda, setBusqueda] = useState('')
  const [activa, setActiva] = useState(null)
  const [verPedido, setVerPedido] = useState(false)
  const secciones = useRef({}) // id de categoría → elemento <section>

  const business = menu?.business

  // Título de la pestaña y color de la barra del navegador con la marca del negocio.
  useEffect(() => {
    if (!business) return
    document.title = `${business.name} · Menú`
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', business.background_color)
  }, [business])

  // Productos agrupados por categoría (se omiten las categorías vacías).
  const grupos = useMemo(() => {
    if (!menu) return []
    return menu.categories
      .map((categoria) => ({ categoria, productos: menu.products.filter((p) => p.category_id === categoria.id) }))
      .filter((g) => g.productos.length)
  }, [menu])

  // Buscador: ignora tildes y mayúsculas; busca en nombre y descripción.
  const texto = normalizar(busqueda.trim())
  const resultados = useMemo(() => {
    if (!texto || !menu) return null
    // Recorremos los grupos para que los resultados salgan en el orden del menú.
    return grupos.flatMap((g) => g.productos).filter((p) => normalizar(`${p.name} ${p.description ?? ''}`).includes(texto))
  }, [texto, menu, grupos])

  // Resalta el chip de la categoría que se está viendo al hacer scroll.
  useEffect(() => {
    if (!grupos.length || resultados) return
    setActiva((actual) => actual ?? grupos[0].categoria.id)
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.find((e) => e.isIntersecting)
        if (visible) setActiva(visible.target.dataset.categoria)
      },
      // Franja horizontal bajo la barra fija: la sección que la cruza es la activa.
      { rootMargin: '-130px 0px -65% 0px' },
    )
    Object.values(secciones.current).forEach((el) => el && observador.observe(el))
    return () => observador.disconnect()
  }, [grupos, resultados])

  const irACategoria = (id) => {
    setActiva(id)
    secciones.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (estado === 'cargando') return <Esqueleto />
  if (estado === 'no-existe') return <NotFound />
  if (estado === 'error') {
    return (
      <Mensaje titulo="No pudimos cargar el menú" texto="Revisa tu conexión a internet e inténtalo otra vez.">
        <button type="button" onClick={() => location.reload()} className="mt-5 min-h-[44px] rounded-xl bg-primary px-5 font-semibold text-on-primary">
          Reintentar
        </button>
      </Mensaje>
    )
  }

  const puedePedir = Boolean(business.whatsapp)
  const tarjeta = (p) => (
    <ProductCard key={p.id} product={p} cantidad={cart.cantidades[p.id] ?? 0} onCambiar={(d) => cart.cambiar(p.id, d)} puedePedir={puedePedir} />
  )

  return (
    <div style={themeVars(business.primary_color, business.background_color)} className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto max-w-xl">
        <BusinessHeader business={business} />
        <ContactButtons business={business} />

        {/* Barra fija: buscador + categorías */}
        <div className="sticky top-0 z-20 space-y-2.5 border-b border-ink/5 bg-bg/95 px-4 py-2.5 backdrop-blur">
          <SearchBar value={busqueda} onChange={setBusqueda} />
          {!resultados && grupos.length > 1 && (
            <CategoryChips categories={grupos.map((g) => g.categoria)} activa={activa} onSelect={irACategoria} />
          )}
        </div>

        <main className={`px-4 pt-4 ${cart.unidades ? 'pb-28' : 'pb-10'}`}>
          {resultados ? (
            resultados.length ? (
              <>
                <p className="mb-3 text-sm text-ink/60">
                  {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} para “{busqueda.trim()}”
                </p>
                <div className="space-y-3">{resultados.map(tarjeta)}</div>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="font-display text-xl font-semibold">Sin resultados</p>
                <p className="mt-1 text-sm text-ink/60">No encontramos “{busqueda.trim()}”. Prueba con otra palabra.</p>
              </div>
            )
          ) : grupos.length ? (
            grupos.map(({ categoria, productos }) => (
              <section
                key={categoria.id}
                data-categoria={categoria.id}
                ref={(el) => (secciones.current[categoria.id] = el)}
                className="scroll-mt-[124px] pb-7"
              >
                <h2 className="mb-3 flex items-baseline gap-2 font-display text-[1.4rem] font-semibold tracking-tight">
                  {categoria.name}
                  <span className="font-sans text-xs font-medium text-ink/40">{productos.length}</span>
                </h2>
                <div className="space-y-3">{productos.map(tarjeta)}</div>
              </section>
            ))
          ) : (
            <p className="py-16 text-center text-ink/60">Este menú todavía no tiene productos.</p>
          )}

          <footer className="pt-6 text-center text-xs text-ink/40">
            Menú digital hecho con{' '}
            <Link to="/" className="font-semibold underline-offset-2 hover:underline">
              MenúQR
            </Link>
          </footer>
        </main>
      </div>

      {puedePedir && <CartBar unidades={cart.unidades} total={cart.total} onAbrir={() => setVerPedido(true)} />}
      {verPedido && <CartSheet business={business} cart={cart} mesa={mesa} onClose={() => setVerPedido(false)} />}
    </div>
  )
}

// Pantalla de carga con la forma del menú (se siente más rápido que un spinner).
function Esqueleto() {
  return (
    <div className="mx-auto max-w-xl animate-pulse px-4 pt-7" aria-busy="true" aria-label="Cargando menú">
      <div className="flex items-center gap-4">
        <div className="h-[72px] w-[72px] rounded-2xl bg-ink/10" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-2/3 rounded bg-ink/10" />
          <div className="h-4 w-1/2 rounded bg-ink/10" />
        </div>
      </div>
      <div className="mt-6 h-11 rounded-full bg-ink/10" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-ink/10" />
        ))}
      </div>
    </div>
  )
}

export function Mensaje({ titulo, texto, children }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold">{titulo}</h1>
        <p className="mt-2 text-ink/60">{texto}</p>
        {children}
      </div>
    </div>
  )
}
