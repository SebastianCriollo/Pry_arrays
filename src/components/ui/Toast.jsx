import { createContext, useCallback, useContext, useState } from 'react'

// Avisos breves en la parte inferior ("Guardado", "No se pudo guardar"…).
const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  // toast('Guardado')  ·  toast('Algo falló', 'error')
  const toast = useCallback((mensaje, tipo = 'ok') => {
    const id = Date.now() + Math.random()
    setAvisos((lista) => [...lista, { id, mensaje, tipo }])
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {avisos.map((a) => (
          <div
            key={a.id}
            className={`animate-fade-in rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-float ${
              a.tipo === 'error' ? 'bg-red-600' : 'bg-stone-900'
            }`}
          >
            {a.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
