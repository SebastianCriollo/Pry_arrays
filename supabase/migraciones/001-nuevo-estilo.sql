-- =====================================================================
--  MenúQR · Migración 001: nuevo estilo
--  Solo para bases creadas ANTES de esta versión (si instalas desde cero,
--  schema.sql ya lo incluye). Ejecútala UNA vez en Supabase → SQL Editor.
--  Es segura: no borra nada y puede ejecutarse más de una vez.
-- =====================================================================

-- 1. Foto de portada del menú (opcional, se sube desde "Mi negocio").
alter table public.businesses add column if not exists cover_url text;

-- 2. Colores por defecto del nuevo estilo para los negocios que crees de aquí en adelante.
alter table public.businesses
  alter column primary_color    set default '#FF7622',
  alter column background_color set default '#FFFFFF';

-- 3. La cafetería de ejemplo pasa a los colores nuevos.
--    (Tus clientes no se tocan: cada uno conserva los colores que eligió.)
update public.businesses
   set primary_color = '#FF7622', background_color = '#FFFFFF'
 where slug = 'cafe-ruminahui';
