import Icon from '../ui/Icon'
import { soloDigitos } from '../../lib/format'

// Botones de contacto: llamar, abrir Google Maps e Instagram.
// Solo aparece el botón si el negocio llenó ese dato.
export default function ContactButtons({ business }) {
  const botones = [
    business.phone && { icono: 'phone', texto: 'Llamar', href: `tel:+${soloDigitos(business.phone)}` },
    business.maps_url && { icono: 'pin', texto: 'Ver mapa', href: business.maps_url, externo: true },
    business.instagram && {
      icono: 'instagram',
      texto: 'Instagram',
      href: `https://instagram.com/${business.instagram.replace(/^@/, '')}`,
      externo: true,
    },
  ].filter(Boolean)

  if (!botones.length) return null

  return (
    <nav aria-label="Contacto" className="flex gap-2 px-4 pb-1 pt-4">
      {botones.map((b) => (
        <a
          key={b.texto}
          href={b.href}
          {...(b.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-ink/[0.07] px-2 text-sm font-bold transition active:scale-[0.97]"
        >
          <Icon name={b.icono} className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
          {b.texto}
        </a>
      ))}
    </nav>
  )
}
