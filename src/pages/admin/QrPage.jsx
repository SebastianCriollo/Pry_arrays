import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { descargar, generarPdf, qrDataUrl } from '../../lib/qr'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

const FORMATOS = [
  { valor: 4, texto: '4 tarjetas por hoja (mesas)' },
  { valor: 2, texto: '2 tarjetas por hoja' },
  { valor: 1, texto: '1 cartel por hoja (entrada o caja)' },
]

// Código QR del menú: vista previa y descarga en PNG y PDF.
export default function QrPage() {
  const { business } = useOutletContext()
  const toast = useToast()
  const [mesa, setMesa] = useState('')
  const [porHoja, setPorHoja] = useState(4)
  const [imagen, setImagen] = useState('')
  const [generando, setGenerando] = useState(false)

  // Con número de mesa, el QR lleva ?mesa=N y el pedido indica la mesa.
  const numeroMesa = mesa.trim()
  const url = `${location.origin}/${business.slug}${numeroMesa ? `?mesa=${encodeURIComponent(numeroMesa)}` : ''}`

  useEffect(() => {
    qrDataUrl(url, 640).then(setImagen)
  }, [url])

  const sufijo = numeroMesa ? `-mesa-${numeroMesa}` : ''

  const bajarPng = async () => descargar(await qrDataUrl(url, 1024), `qr-${business.slug}${sufijo}.png`)

  const bajarPdf = async () => {
    setGenerando(true)
    try {
      await generarPdf({ url, business, porHoja, mesa: numeroMesa })
    } catch {
      toast('No se pudo generar el PDF', 'error')
    } finally {
      setGenerando(false)
    }
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast('Enlace copiado')
    } catch {
      toast('No se pudo copiar', 'error')
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-start">
      <div className="rounded-3xl bg-white p-4 shadow-card">
        {imagen ? (
          <img src={imagen} alt={`Código QR de ${business.name}`} className="aspect-square w-full" />
        ) : (
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-stone-100" />
        )}
        <p className="mt-1 break-all text-center text-xs text-stone-500">{url.replace(/^https?:\/\//, '')}</p>
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Tu código QR</h1>
          <p className="mt-1 text-sm text-ink/60">
            Imprímelo y ponlo en las mesas. El código no cambia aunque edites el menú: tus clientes siempre ven la versión más reciente.
          </p>
        </div>

        <div>
          <label htmlFor="q-mesa" className="etiqueta">Número de mesa <span className="font-normal text-ink/45">(opcional)</span></label>
          <input id="q-mesa" inputMode="numeric" maxLength={10} className="campo max-w-[9rem]" placeholder="Ej.: 5" value={mesa} onChange={(e) => setMesa(e.target.value)} />
          <p className="mt-1 text-xs text-ink/50">Si lo pones, el pedido por WhatsApp te llega con “Mesa {numeroMesa || '5'}”. Genera un QR por cada mesa.</p>
        </div>

        <div>
          <label htmlFor="q-formato" className="etiqueta">Formato del PDF (hoja A4)</label>
          <select id="q-formato" className="campo" value={porHoja} onChange={(e) => setPorHoja(Number(e.target.value))}>
            {FORMATOS.map((f) => (
              <option key={f.valor} value={f.valor}>{f.texto}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={bajarPdf} cargando={generando}>
            <Icon name="download" className="h-4 w-4" /> PDF para imprimir
          </Button>
          <Button variante="suave" onClick={bajarPng}>
            <Icon name="download" className="h-4 w-4" /> Imagen PNG
          </Button>
          <Button variante="suave" onClick={copiar}>
            Copiar enlace
          </Button>
        </div>
      </div>
    </div>
  )
}
