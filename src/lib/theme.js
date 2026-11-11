// Tema por negocio: convierte los dos colores configurados (primario y fondo)
// en las variables CSS que usa Tailwind (ver tailwind.config.js).

// '#A64B2A' → [166, 75, 42]
export function hexToRgb(hex) {
  const limpio = /^#[0-9a-f]{6}$/i.test(hex ?? '') ? hex.slice(1) : '000000'
  return [0, 2, 4].map((i) => parseInt(limpio.slice(i, i + 2), 16))
}

// Luminancia relativa (WCAG): 0 = negro, 1 = blanco.
function luminancia([r, g, b]) {
  const canal = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

// Mezcla dos colores: t = 0 → a, t = 1 → b.
const mezclar = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

const TINTA_OSCURA = [24, 28, 46] // #181C2E, azul casi negro
const TINTA_CLARA = [250, 247, 243]

// Devuelve un objeto listo para pasar a style={...} en el contenedor del menú.
// El texto se elige solo (oscuro o claro) según el contraste con cada color.
export function themeVars(primaryHex, backgroundHex) {
  const primary = hexToRgb(primaryHex || '#FF7622')
  const bg = hexToRgb(backgroundHex || '#FFFFFF')
  const fondoClaro = luminancia(bg) > 0.4
  const vars = {
    primary,
    'on-primary': luminancia(primary) > 0.45 ? TINTA_OSCURA : [255, 255, 255],
    bg,
    // Las tarjetas se separan un poco del fondo: blancas sobre fondo claro,
    // algo más claras que el fondo si este es oscuro.
    surface: fondoClaro ? mezclar(bg, [255, 255, 255], 0.8) : mezclar(bg, [255, 255, 255], 0.08),
    ink: fondoClaro ? TINTA_OSCURA : TINTA_CLARA,
  }
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--c-${k}`, v.join(' ')]))
}
