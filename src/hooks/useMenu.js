import { useEffect, useState } from 'react'
import { api } from '../lib/api'

// Carga el menú público de un negocio por su slug.
// estado: 'cargando' | 'listo' | 'no-existe' | 'error'
export function useMenu(slug) {
  const [menu, setMenu] = useState(null)
  const [estado, setEstado] = useState('cargando')

  useEffect(() => {
    let vigente = true // evita guardar la respuesta de un slug anterior
    setEstado('cargando')
    api
      .getMenu(slug)
      .then((datos) => {
        if (!vigente) return
        setMenu(datos)
        setEstado(datos ? 'listo' : 'no-existe')
      })
      .catch(() => vigente && setEstado('error'))
    return () => {
      vigente = false
    }
  }, [slug])

  return { menu, estado }
}
