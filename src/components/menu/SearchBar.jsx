import Icon from '../ui/Icon'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar platos y bebidas"
        aria-label="Buscar productos"
        className="h-[52px] w-full rounded-xl border border-transparent bg-ink/[0.05] pl-12 pr-11 outline-none transition placeholder:text-ink/40 focus:border-primary/60 focus:bg-surface focus:ring-4 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-ink/5"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
