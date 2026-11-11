// Selector de color: muestras sugeridas + selector libre del sistema.
export default function ColorPicker({ id, label, value, onChange, sugeridos }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        {sugeridos.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={`Usar color ${color}`}
            aria-pressed={value.toLowerCase() === color.toLowerCase()}
            style={{ backgroundColor: color }}
            className="h-9 w-9 rounded-full border border-ink/15 ring-offset-2 ring-offset-bg aria-pressed:ring-2 aria-pressed:ring-ink"
          />
        ))}
        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-surface pl-1 pr-3 text-sm font-medium">
          <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0" />
          <span className="uppercase tabular-nums">{value}</span>
        </label>
      </div>
    </div>
  )
}
