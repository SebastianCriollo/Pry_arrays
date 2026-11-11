import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../hooks/useCart'
import { themeVars } from '../lib/theme'
import { normalizar } from '../lib/format'
import { registrarPedido, registrarVisita } from '../lib/stats'
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
  // También se registra la visita para las estadísticas del dueño.
  useEffect(() => {
    if (!business) return
    registrarVisita(business)
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
  // Una lista con al menos una foto se muestra en cuadrícula de 2 columnas;
  // si no tiene ninguna, como filas compactas (se ve mejor sin huecos vacíos).
  const listaDeProductos = (productos) => {
    const variante = productos.some((p) => p.image_url) ? 'grid' : 'lista'
    return (
      <div className={variante === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        {productos.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            variante={variante}
            cantidad={cart.cantidades[p.id] ?? 0}
            onCambiar={(d) => cart.cambiar(p.id, d)}
            puedePedir={puedePedir}
          />
        ))}
      </div>
    )
  }

  return (
    <div style={themeVars(business.primary_color, business.background_color)} className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto max-w-xl">
        <BusinessHeader business={business} />
        <ContactButtons business={business} />

        {/* Barra fija: buscador + categorías */}
        <div className="sticky top-0 z-20 space-y-3 bg-bg/95 px-4 pb-3 pt-3 shadow-[0_8px_16px_-14px_rgb(0_0_0/0.25)] backdrop-blur">
          <SearchBar value={busqueda} onChange={setBusqueda} />
          {!resultados && grupos.length > 1 && (
            <CategoryChips categories={grupos.map((g) => g.categoria)} activa={activa} onSelect={irACategoria} />
          )}
        </div>

        <main className={`px-4 pt-5 ${cart.unidades ? 'pb-28' : 'pb-10'}`}>
          {resultados ? (
            resultados.length ? (
              <>
                <p className="mb-3 text-sm text-ink/60">
                  {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} para “{busqueda.trim()}”
                </p>
                {listaDeProductos(resultados)}
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-xl font-bold">Sin resultados</p>
                <p className="mt-1 text-sm text-ink/60">No encontramos “{busqueda.trim()}”. Prueba con otra palabra.</p>
              </div>
            )
          ) : grupos.length ? (
            grupos.map(({ categoria, productos }) => (
              <section
                key={categoria.id}
                data-categoria={categoria.id}
                ref={(el) => (secciones.current[categoria.id] = el)}
                className="scroll-mt-[136px] pb-8"
              >
                <h2 className="mb-4 text-xl">
                  {categoria.name} <span className="text-ink/45">({productos.length})</span>
                </h2>
                {listaDeProductos(productos)}
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
      {verPedido && <CartSheet business={business} cart={cart} mesa={mesa} onPedir={() => registrarPedido(business)} onClose={() => setVerPedido(false)} />}
    </div>
  )
}

// Pantalla de carga con la forma del menú (se siente más rápido que un spinner).
function Esqueleto() {
  return (
    <div className="mx-auto max-w-xl animate-pulse px-4 pt-4" aria-busy="true" aria-label="Cargando menú">
      <div className="flex items-center gap-4">
        <div className="h-44 w-full rounded-[28px] bg-ink/10" />
      </div>
      <div className="mt-12 h-7 w-2/3 rounded-lg bg-ink/10" />
      <div className="mt-3 h-4 w-1/2 rounded bg-ink/10" />
      <div className="mt-6 h-[52px] rounded-xl bg-ink/10" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-3xl bg-ink/10" />
        ))}
      </div>
    </div>
  )
}

export function Mensaje({ titulo, texto, children }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-extrabold">{titulo}</h1>
        <p className="mt-2 text-ink/60">{texto}</p>
        {children}
      </div>
    </div>
  )
}
