import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../hooks/useAuth'
import { ToastProvider } from '../../components/ui/Toast'
import Login from './Login'
import AdminLayout from './AdminLayout'
import ProductsPage from './ProductsPage'
import BusinessPage from './BusinessPage'
import QrPage from './QrPage'
import StatsPage from './StatsPage'

// Raíz del panel de administración (/admin/*).
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          {/* AdminLayout protege estas rutas: sin sesión redirige al login */}
          <Route element={<AdminLayout />}>
            <Route index element={<ProductsPage />} />
            <Route path="negocio" element={<BusinessPage />} />
            <Route path="qr" element={<QrPage />} />
            <Route path="estadisticas" element={<StatsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
