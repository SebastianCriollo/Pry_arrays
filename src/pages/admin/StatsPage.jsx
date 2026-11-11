import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api, isDemo } from '../../lib/api'
import { fechaEcuador } from '../../lib/format'

const DIAS_GRAFICO = 30

// 'AAAA-MM-DD' de hace n días (en Ecuador).
const haceDias = (n) => fechaEcuador(new Date(Date.now() - n * 86400000))

// "Mié 12 nov"
function fechaCorta(dia) {
  const texto = new Intl.DateTimeFormat('es-EC', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(`${dia}T12:00:00Z`))
    .replace(/[.,]/g, '')
    .toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const numero = (n) => new Intl.NumberFormat('es-EC').format(n)
const plural = (n, uno, varios) => `${numero(n)} ${n === 1 ? uno : varios}`

// Máximo "redondo" para el eje (su mitad también es redonda): 4, 10, 20, 40, 60, 80, 100…
function maximoRedondo(valor) {
  if (valor <= 4) return 4
  const base = 10 ** Math.floor(Math.log10(valor))
  return [1, 2, 4, 6, 8, 10].map((m) => m * base).find((m) => m >= valor)
}

// Estadísticas del menú: visitas y pedidos por WhatsApp.
export default function StatsPage() {
  const { business } = useOutletContext()
  const [filas, setFilas] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Pedimos 60 días: 30 para el gráfico y 30 más para comparar semanas.
    api
      .getStats(business.id, haceDias(59))
      .then(setFilas)
      .catch(() => setError(true))
  }, [business.id])

  // Serie continua de los últimos 60 días (los días sin visitas valen 0).
  const dias = useMemo(() => {
    if (!filas) return []
    const porDia = new Map(filas.map((f) => [f.day, f]))
    return Array.from({ length: 60 }, (_, i) => {
      const day = haceDias(59 - i)
      return { day, views: porDia.get(day)?.views ?? 0, orders: porDia.get(day)?.orders ?? 0 }
    })
  }, [filas])

  if (error) {
    return (
      <Aviso titulo="No se pudieron cargar las estadísticas">
        Si acabas de actualizar MenúQR, falta ejecutar la migración <strong>002-estadisticas.sql</strong> en Supabase.
      </Aviso>
    )
  }
  if (!filas) return <p className="py-16 text-center text-ink/50">Cargando estadísticas…</p>

  const suma = (lista, campo) => lista.reduce((t, d) => t + d[campo], 0)
  const ultimos = (n) => dias.slice(-n)
  const semana = suma(ultimos(7), 'views')
  const semanaAnterior = suma(dias.slice(-14, -7), 'views')
  const mes = ultimos(DIAS_GRAFICO)
  const visitasMes = suma(mes, 'views')
  const pedidosMes = suma(mes, 'orders')

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Visitas a tu menú</h1>
        <p className="mt-1 text-sm text-ink/55">Cada celular cuenta una vez por día. Tus propias visitas con la sesión abierta no cuentan.</p>
      </div>

      {isDemo && (
        <p className="rounded-xl bg-amber-500/15 px-3.5 py-2.5 text-sm text-amber-900">
          <strong>Modo demo:</strong> los números son de ejemplo para mostrar cómo se ve.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Tarjeta titulo="Hoy" valor={numero(ultimos(1)[0].views)} pie="visitas" />
        <Tarjeta titulo="Últimos 7 días" valor={numero(semana)} pie={<Comparacion actual={semana} anterior={semanaAnterior} />} />
        <Tarjeta titulo="Últimos 30 días" valor={numero(visitasMes)} pie="visitas" />
        <Tarjeta titulo="Pedidos por WhatsApp" valor={numero(pedidosMes)} pie="en 30 días" />
      </div>

      {visitasMes === 0 ? (
        <Aviso titulo="Aún no hay visitas">
          Imprime tu código QR y ponlo en las mesas: aquí verás cuántas personas abren tu menú cada día.
        </Aviso>
      ) : (
        <Grafico dias={mes} />
      )}
    </div>
  )
}

function Tarjeta({ titulo, valor, pie }) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider text-ink/50">{titulo}</p>
      <p className="mt-1 text-[2rem] font-extrabold leading-tight tabular-nums">{valor}</p>
      <div className="text-sm text-ink/55">{pie}</div>
    </div>
  )
}

// "↑ 12 % vs. semana anterior" — flecha y texto, no solo color.
function Comparacion({ actual, anterior }) {
  if (!anterior) return <span>visitas</span>
  const cambio = Math.round(((actual - anterior) / anterior) * 100)
  if (cambio === 0) return <span>igual que la semana anterior</span>
  const sube = cambio > 0
  return (
    <span>
      <span className={`font-bold ${sube ? 'text-emerald-700' : 'text-red-700'}`}>
        {sube ? '↑' : '↓'} {Math.abs(cambio)} %
      </span>{' '}
      vs. semana anterior
    </span>
  )
}

// Columnas de visitas por día (una sola serie: el título la nombra, sin leyenda).
// Tocar o pasar el mouse por un día muestra su detalle arriba del gráfico.
function Grafico({ dias }) {
  const [activo, setActivo] = useState(dias.length - 1)
  const tope = maximoRedondo(Math.max(...dias.map((d) => d.views)))
  const marcas = [tope, tope / 2, 0]
  const dia = dias[activo]

  return (
    <section className="rounded-3xl bg-surface p-4 shadow-card">
      <h2 className="font-bold">Visitas por día</h2>
      <p className="text-sm text-ink/50">Últimos {dias.length} días</p>

      {/* Detalle del día seleccionado (hace de tooltip, también en celular) */}
      <p className="mt-3 min-h-[1.5rem] text-sm" aria-live="polite">
        <span className="font-bold">{activo === dias.length - 1 ? 'Hoy' : fechaCorta(dia.day)}:</span>{' '}
        {plural(dia.views, 'visita', 'visitas')} · {plural(dia.orders, 'pedido', 'pedidos')}
      </p>

      <div className="mt-2 flex gap-2">
        {/* Eje Y: pocas marcas redondas */}
        <div className="flex h-40 flex-col justify-between text-right text-[11px] tabular-nums text-ink/45">
          {marcas.map((m) => (
            <span key={m} className="-my-1.5 leading-none">{numero(m)}</span>
          ))}
        </div>

        <div className="relative h-40 flex-1">
          {/* Líneas guía: finas y discretas */}
          {marcas.map((m) => (
            <div key={m} className="absolute inset-x-0 h-px bg-ink/10" style={{ bottom: `${(m / tope) * 100}%` }} />
          ))}

          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setActivo(dias.length - 1)}>
            {dias.map((d, i) => (
              // Toda la columna es zona de toque, aunque la barra sea baja.
              <button
                key={d.day}
                type="button"
                onMouseEnter={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                onClick={() => setActivo(i)}
                aria-label={`${fechaCorta(d.day)}: ${plural(d.views, 'visita', 'visitas')}, ${plural(d.orders, 'pedido', 'pedidos')}`}
                className="flex h-full flex-1 items-end justify-center outline-none"
              >
                <span
                  className={`block w-full max-w-[24px] rounded-t-[4px] transition-colors ${i === activo ? 'bg-primary' : 'bg-primary/45'}`}
                  style={{ height: `${(d.views / tope) * 100}%`, minHeight: d.views ? 2 : 0 }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-8 text-[11px] text-ink/45">
        <span>{fechaCorta(dias[0].day)}</span>
        <span>Hoy</span>
      </div>

      {/* Vista de tabla: los mismos datos, día por día */}
      <details className="mt-4 border-t border-ink/10 pt-3">
        <summary className="min-h-[36px] cursor-pointer text-sm font-bold text-primary">Ver por día</summary>
        <table className="mt-2 w-full text-sm tabular-nums">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink/45">
              <th className="py-1.5 font-bold">Día</th>
              <th className="py-1.5 text-right font-bold">Visitas</th>
              <th className="py-1.5 text-right font-bold">Pedidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {[...dias].reverse().map((d) => (
              <tr key={d.day}>
                <td className="py-1.5">{fechaCorta(d.day)}</td>
                <td className="py-1.5 text-right">{numero(d.views)}</td>
                <td className="py-1.5 text-right">{numero(d.orders)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}

function Aviso({ titulo, children }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-ink/15 px-6 py-10 text-center">
      <p className="text-lg font-bold">{titulo}</p>
      <p className="mt-1 text-sm text-ink/60">{children}</p>
    </div>
  )
}
