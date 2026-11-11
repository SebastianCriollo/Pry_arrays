import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicMenu from './pages/PublicMenu'
import Landing from './pages/Landing'

// El panel se descarga aparte (lazy): quien escanea el QR solo baja el
// código del menú público, que es mucho más liviano.
const AdminApp = lazy(() => import('./pages/admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="grid min-h-dvh place-items-center text-ink/50">Cargando…</div>}>
            <AdminApp />
          </Suspense>
        }
      />
      {/* Cada negocio vive en /su-slug */}
      <Route path="/:slug" element={<PublicMenu />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
