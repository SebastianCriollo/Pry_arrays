// Punto único de acceso a los datos. El resto de la app importa desde aquí
// y no sabe si está hablando con Supabase o con el modo demo.
import { isDemo } from '../supabase'
import * as supabaseApi from './supabaseApi'
import * as demoApi from './demoApi'

export const api = isDemo ? demoApi : supabaseApi
export { isDemo }
