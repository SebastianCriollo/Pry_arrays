import Switch from '../ui/Switch'
import { DIAS } from '../../lib/format'

const POR_DEFECTO = { abre: '08:00', cierra: '20:00' }

// Editor del horario semanal. value = { lun: {abre, cierra} | null, ... }
export default function HoursEditor({ value, onChange }) {
  const horas = value ?? {}
  const cambiar = (clave, turno) => onChange({ ...horas, [clave]: turno })

  // Copia el horario del lunes al resto de días (ahorra mucho tecleo).
  const copiarLunes = () => onChange(Object.fromEntries(DIAS.map((d) => [d.clave, horas.lun ? { ...horas.lun } : null])))

  return (
    <div>
      <ul className="divide-y divide-ink/10 rounded-2xl bg-surface px-3.5 shadow-card">
        {DIAS.map((dia) => {
          const turno = horas[dia.clave]
          return (
            <li key={dia.clave} className="flex min-h-[56px] flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <Switch checked={Boolean(turno)} onChange={(abierto) => cambiar(dia.clave, abierto ? POR_DEFECTO : null)} label={`Abre el ${dia.nombre}`} />
              <span className="w-24 font-semibold">{dia.nombre}</span>
              {turno ? (
                <span className="ml-auto flex items-center gap-1.5">
                  <input type="time" required aria-label={`${dia.nombre}: abre`} value={turno.abre} onChange={(e) => cambiar(dia.clave, { ...turno, abre: e.target.value })} className="campo !w-auto !px-2 !py-1.5 tabular-nums" />
                  <span className="text-ink/40">a</span>
                  <input type="time" required aria-label={`${dia.nombre}: cierra`} value={turno.cierra} onChange={(e) => cambiar(dia.clave, { ...turno, cierra: e.target.value })} className="campo !w-auto !px-2 !py-1.5 tabular-nums" />
                </span>
              ) : (
                <span className="ml-auto text-sm text-ink/45">Cerrado</span>
              )}
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={copiarLunes} className="mt-2 min-h-[40px] text-sm font-semibold text-primary">
        Copiar el horario del lunes a todos los días
      </button>
    </div>
  )
}
