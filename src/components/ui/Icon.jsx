// Íconos propios en SVG (trazo de 24×24). Sin librería: pesan casi nada.
const TRAZOS = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  x: 'M18 6 6 18M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  phone:
    'M5 4h3.5l1.7 4.3-2.1 1.5a12 12 0 0 0 6.1 6.1l1.5-2.1L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z',
  pin: 'M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  instagram:
    'M7.5 3h9A4.5 4.5 0 0 1 21 7.500v9a4.5 4.5 0 0 1-4.5 4.500h-9A4.5 4.5 0 0 1 3 16.500v-9A4.5 4.5 0 0 1 7.5 3Zm4.5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5.2-9.200h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  chevron: 'm6 9 6 6 6-6',
  bag: 'M5 8h14l-1 12H6L5 8Zm4 0V6.500a3 3 0 0 1 6 0V8',
  flame: 'M12 21c3.6 0 6-2.5 6-6 0-3.5-2.5-5-3.5-8-2 1.2-2.5 3-2.5 4.500C10.5 10 10 8 10 6c-2.5 2-4 5-4 9 0 3.5 2.4 6 6 6Z',
  star: 'm12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.900L12 16.900l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.800L12 3.500Z',
  sparkle: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.500m7 7L18 18M18 6l-2.5 2.500m-7 7L6 18',
  grip: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4Zm9.5-13.5 4 4',
  trash: 'M4 7h16M9 7V4.500h6V7m-8.5 0 .8 12.500h9.400L17.5 7M10 11v5m4-5v5',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M4 4l16 16M9.9 5.800A8.7 8.7 0 0 1 12 5.500c6 0 9.5 6.5 9.5 6.500a17 17 0 0 1-3 3.700M6.3 7.700A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.500c1.5 0 2.8-.4 4-1',
  image: 'M4 5h16v14H4V5Zm0 11 4.5-4.5 3.5 3.5 3-3 5 5M9 9.500h.01',
  logout: 'M14 4h5v16h-5M10 8l-4 4 4 4m-4-4h10',
  external: 'M14 4h6v6m0-6-9 9M18 14v6H4V6h6',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 20h14',
  qr: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h2.500v2.500H14V14Zm3.5 3.500H20V20h-2.500v-2.500Z',
  store: 'M4 10v10h16V10M3 6l1.5-2h15L21 6v1.500a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V6Zm7 14v-5h4v5',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  chart: 'M4 4v16h16M8 16v-4m4 4V8m4 8v-6',
}

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={TRAZOS[name]} />
    </svg>
  )
}

// El logo de WhatsApp es relleno, por eso va aparte.
export function IconWhatsApp({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.100L2 22l5-1.300A10 10 0 1 0 12 2Zm0 1.800a8.2 8.2 0 1 1-4.2 15.300l-.3-.2-2.9.8.8-2.9-.2-.300A8.2 8.2 0 0 1 12 3.800Zm-3.3 4c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.2.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5 0 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.300l-1.9-.900c-.3-.1-.5-.2-.7.100l-.9 1.100c-.1.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.600l.4-.5.3-.500v-.500L9.8 8.300c-.2-.5-.4-.5-.6-.500h-.500Z" />
    </svg>
  )
}
