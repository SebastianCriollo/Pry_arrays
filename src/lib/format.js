// Formato de precios, texto y horarios.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const formatPrice = (valor) => usd.format(Number(valor) || 0)

// Para el buscador: sin tildes ni mayúsculas ("Café" → "cafe").
export const normalizar = (texto) =>
  (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

// Solo dígitos: '+593 99 000 0000' → '593990000000'
export const soloDigitos = (texto) => (texto ?? '').replace(/\D/g, '')

// ---------- Horario ----------

// Orden de la semana empezando en lunes; las claves son las del JSON "hours".
export const DIAS = [
  { clave: 'lun', nombre: 'Lunes' },
  { clave: 'mar', nombre: 'Martes' },
  { clave: 'mie', nombre: 'Miércoles' },
  { clave: 'jue', nombre: 'Jueves' },
  { clave: 'vie', nombre: 'Viernes' },
  { clave: 'sab', nombre: 'Sábado' },
  { clave: 'dom', nombre: 'Domingo' },
]

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Día y hora actuales EN ECUADOR, sin importar la zona del teléfono.
function ahoraEnEcuador(fecha) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha)
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]))
  const indice = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday)
  return { indice, minutos: Number(p.hour) * 60 + Number(p.minute) }
}

const turno = (hours, indice) => {
  const t = hours?.[DIAS[(indice + 7) % 7].clave]
  return t?.abre && t?.cierra ? t : null
}

// Calcula si el negocio está abierto ahora.
// Devuelve { abierto, texto } o null si el negocio no configuró horario.
// Soporta turnos que cruzan la medianoche (ej. 18:00 → 02:00).
export function estadoHorario(hours, fecha = new Date()) {
  if (!hours || !DIAS.some((d) => turno(hours, DIAS.indexOf(d)))) return null
  const { indice, minutos } = ahoraEnEcuador(fecha)

  // ¿Sigue abierto el turno de AYER que pasa de medianoche?
  const ayer = turno(hours, indice - 1)
  if (ayer && aMinutos(ayer.cierra) <= aMinutos(ayer.abre) && minutos < aMinutos(ayer.cierra)) {
    return { abierto: true, texto: `Abierto · cierra ${ayer.cierra}` }
  }

  const hoy = turno(hours, indice)
  if (hoy) {
    const abre = aMinutos(hoy.abre)
    const cierra = aMinutos(hoy.cierra)
    const cruza = cierra <= abre
    if (minutos >= abre && (cruza || minutos < cierra)) {
      return { abierto: true, texto: `Abierto · cierra ${hoy.cierra}` }
    }
    if (minutos < abre) return { abierto: false, texto: `Cerrado · abre hoy ${hoy.abre}` }
  }

  // Busca el próximo día con atención.
  for (let i = 1; i <= 7; i++) {
    const siguiente = turno(hours, indice + i)
    if (siguiente) {
      const cuando = i === 1 ? 'mañana' : `el ${DIAS[(indice + i) % 7].nombre.toLowerCase()}`
      return { abierto: false, texto: `Cerrado · abre ${cuando} ${siguiente.abre}` }
    }
  }
  return { abierto: false, texto: 'Cerrado' }
}

// Fecha 'AAAA-MM-DD' en Ecuador (la misma que usa la base para las estadísticas).
export const fechaEcuador = (fecha = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(fecha)

// Índice (0 = lunes) del día actual en Ecuador, para resaltarlo en la tabla.
export const indiceHoy = () => ahoraEnEcuador(new Date()).indice
