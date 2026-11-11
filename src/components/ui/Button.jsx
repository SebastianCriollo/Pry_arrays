// Botón base del panel. variante: 'primario' | 'suave' | 'peligro'
const ESTILOS = {
  primario: 'bg-primary text-on-primary hover:brightness-110',
  suave: 'bg-ink/5 text-ink hover:bg-ink/10',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
}

export default function Button({ variante = 'primario', className = '', cargando, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || cargando}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60 ${ESTILOS[variante]} ${className}`}
    >
      {cargando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
