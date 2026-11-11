import Icon from '../ui/Icon'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/45" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar en el menú…"
        aria-label="Buscar productos"
        className="h-11 w-full rounded-full border border-ink/10 bg-surface pl-10 pr-10 outline-none transition placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Borrar búsqueda"
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-ink/5"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
