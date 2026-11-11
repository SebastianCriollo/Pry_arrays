// Cliente de Supabase. Si no hay variables de entorno, la app corre en MODO DEMO
// (datos locales en el navegador) y este cliente queda en null.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isDemo = !url || !anonKey
export const supabase = isDemo ? null : createClient(url, anonKey)

export const BUCKET = 'menu-images'
