import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../../lib/api'
import { soloDigitos } from '../../lib/format'
import { themeVars } from '../../lib/theme'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import ImageUploader from '../../components/admin/ImageUploader'
import HoursEditor from '../../components/admin/HoursEditor'
import ColorPicker from '../../components/admin/ColorPicker'
import { Logo } from '../../components/menu/BusinessHeader'

const PRIMARIOS = ['#A64B2A', '#B91C1C', '#C2410C', '#B45309', '#15803D', '#0F766E', '#1D4ED8', '#6D28D9', '#BE185D', '#1C1917']
const FONDOS = ['#FAF5EE', '#FFFFFF', '#F5F5F4', '#FEF9E7', '#F0F7F2', '#EFF6FB', '#1C1917', '#14213D']

// Convierte lo que escriba el dueño al formato de wa.me (593 + número sin 0 inicial).
// '099 000 0000' → '593990000000' · '+593 99 000 0000' → '593990000000'
function normalizarWhatsApp(texto) {
  const d = soloDigitos(texto)
  if (d.length === 10 && d.startsWith('0')) return `593${d.slice(1)}`
  return d
}

// Datos del negocio: nombre, logo, contacto, horario y colores.
export default function BusinessPage() {
  const { business, setBusiness } = useOutletContext()
  const toast = useToast()
  const [form, setForm] = useState(business)
  const [guardando, setGuardando] = useState(false)
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e?.target ? e.target.value : e }))

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const limpio = (v) => v?.trim() || null
    try {
      const actualizado = await api.updateBusiness(business.id, {
        name: form.name.trim(),
        tagline: limpio(form.tagline),
        logo_url: form.logo_url,
        address: limpio(form.address),
        maps_url: limpio(form.maps_url),
        phone: limpio(form.phone),
        whatsapp: normalizarWhatsApp(form.whatsapp) || null,
        instagram: limpio(form.instagram)?.replace(/^@/, '') ?? null,
        hours: form.hours,
        primary_color: form.primary_color,
        background_color: form.background_color,
      })
      if (business.logo_url && business.logo_url !== actualizado.logo_url) api.deleteImage(business.logo_url)
      setBusiness(actualizado)
      setForm(actualizado)
      toast('Datos guardados')
    } catch {
      toast('No se pudieron guardar los datos', 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-8">
      <Seccion titulo="Datos del negocio">
        <ImageUploader value={form.logo_url} onChange={set('logo_url')} businessId={business.id} tipo="logo" />
        <Campo id="n-nombre" label="Nombre">
          <input id="n-nombre" required className="campo" maxLength={50} value={form.name} onChange={set('name')} />
        </Campo>
        <Campo id="n-frase" label="Frase corta" opcional>
          <input id="n-frase" className="campo" maxLength={80} placeholder="Ej.: Café de altura y cocina de casa" value={form.tagline ?? ''} onChange={set('tagline')} />
        </Campo>
        <Campo id="n-dir" label="Dirección" opcional>
          <input id="n-dir" className="campo" maxLength={100} placeholder="Calle principal y secundaria, Machachi" value={form.address ?? ''} onChange={set('address')} />
        </Campo>
        <Campo id="n-maps" label="Enlace de Google Maps" opcional ayuda="En Google Maps: busca tu local → Compartir → Copiar vínculo.">
          <input id="n-maps" type="url" className="campo" placeholder="https://maps.app.goo.gl/…" value={form.maps_url ?? ''} onChange={set('maps_url')} />
        </Campo>
      </Seccion>

      <Seccion titulo="Contacto y redes">
        <Campo id="n-wa" label="WhatsApp para pedidos" ayuda="A este número llegan los pedidos. Si lo dejas vacío, el menú no muestra el carrito.">
          <input id="n-wa" inputMode="tel" className="campo" placeholder="099 000 0000" value={form.whatsapp ?? ''} onChange={set('whatsapp')} />
        </Campo>
        <Campo id="n-tel" label="Teléfono para llamadas" opcional>
          <input id="n-tel" inputMode="tel" className="campo" placeholder="+593 99 000 0000" value={form.phone ?? ''} onChange={set('phone')} />
        </Campo>
        <Campo id="n-ig" label="Instagram" opcional>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/45">@</span>
            <input id="n-ig" className="campo pl-8" autoCapitalize="none" placeholder="tu.negocio" value={form.instagram ?? ''} onChange={set('instagram')} />
          </div>
        </Campo>
      </Seccion>

      <Seccion titulo="Horario de atención">
        <HoursEditor value={form.hours} onChange={set('hours')} />
      </Seccion>

      <Seccion titulo="Colores de tu menú">
        <ColorPicker id="n-primario" label="Color principal (botones y detalles)" value={form.primary_color} onChange={set('primary_color')} sugeridos={PRIMARIOS} />
        <ColorPicker id="n-fondo" label="Color de fondo" value={form.background_color} onChange={set('background_color')} sugeridos={FONDOS} />

        {/* Vista previa en vivo con los colores elegidos */}
        <div>
          <p className="etiqueta">Así se verá</p>
          <div style={themeVars(form.primary_color, form.background_color)} className="rounded-2xl border border-ink/10 bg-bg p-4 text-ink">
            <div className="flex items-center gap-3">
              <Logo business={form.name ? form : { ...form, name: '?' }} className="h-12 w-12 text-xl" />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold">{form.name || 'Tu negocio'}</p>
                <p className="truncate text-sm text-ink/60">{form.tagline || 'Tu frase corta'}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-on-primary">Bebidas</span>
              <span className="rounded-full bg-ink/[0.06] px-3.5 py-1.5 text-sm font-semibold text-ink/75">Postres</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface p-3 shadow-card">
              <div>
                <p className="font-semibold">Capuchino</p>
                <p className="font-display font-semibold">$2.50</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xl font-bold leading-none text-on-primary">+</span>
            </div>
          </div>
        </div>
      </Seccion>

      {/* Botón de guardar siempre a la vista */}
      <div className="sticky bottom-3 z-20">
        <Button type="submit" cargando={guardando} className="w-full shadow-float">
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

function Seccion({ titulo, children }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">{titulo}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Campo({ id, label, opcional, ayuda, children }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {label} {opcional && <span className="font-normal text-ink/45">(opcional)</span>}
      </label>
      {children}
      {ayuda && <p className="mt-1 text-xs text-ink/50">{ayuda}</p>}
    </div>
  )
}
