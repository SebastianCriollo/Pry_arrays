import { useRef, useState } from 'react'
import { api } from '../../lib/api'
import { comprimirImagen } from '../../lib/images'
import Icon from '../ui/Icon'
import { useToast } from '../ui/Toast'

const enKb = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

// Selector de foto: comprime en el navegador, sube y devuelve la URL.
// tipo: 'producto' | 'logo' | 'portada' (la portada se previsualiza apaisada)
export default function ImageUploader({ value, onChange, businessId, tipo = 'producto' }) {
  const input = useRef(null)
  const toast = useToast()
  const [subiendo, setSubiendo] = useState(false)
  const [ahorro, setAhorro] = useState('')

  const elegir = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo
    if (!archivo) return
    setSubiendo(true)
    try {
      const comprimida = await comprimirImagen(archivo, tipo)
      const url = await api.uploadImage(businessId, comprimida, tipo === 'producto' ? 'productos' : '')
      setAhorro(`Optimizada: ${enKb(archivo.size)} → ${enKb(comprimida.size)}`)
      onChange(url)
    } catch (err) {
      toast(err.message || 'No se pudo subir la imagen', 'error')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => input.current.click()}
        disabled={subiendo}
        className={`relative grid ${tipo === 'portada' ? 'h-24 w-40' : 'h-24 w-24'} shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/20 bg-surface text-ink/40 hover:border-primary hover:text-primary`}
        aria-label={value ? 'Cambiar foto' : 'Subir foto'}
      >
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <Icon name="image" className="h-7 w-7" />}
        {subiendo && (
          <span className="absolute inset-0 grid place-items-center bg-white/75">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </span>
        )}
      </button>
      <div className="min-w-0 text-sm">
        <button type="button" onClick={() => input.current.click()} disabled={subiendo} className="min-h-[36px] font-semibold text-primary">
          {subiendo ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {value && !subiendo && (
          <button type="button" onClick={() => { onChange(null); setAhorro('') }} className="ml-4 min-h-[36px] font-semibold text-ink/55">
            Quitar
          </button>
        )}
        <p className="text-xs text-ink/50">{ahorro || 'JPG, PNG o WebP. Se optimiza sola antes de subir.'}</p>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={elegir} />
    </div>
  )
}
