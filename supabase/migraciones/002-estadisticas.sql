-- =====================================================================
--  MenúQR · Migración 002: estadísticas de visitas y pedidos
--  Solo para bases creadas ANTES de esta versión (schema.sql ya lo incluye).
--  Ejecútala UNA vez en Supabase → SQL Editor. No borra nada.
-- =====================================================================

-- Un contador por negocio y por día (hora de Ecuador).
--   views  = veces que se abrió el menú (máx. 1 por celular y día)
--   orders = veces que tocaron "Pedir por WhatsApp"
create table if not exists public.menu_stats (
  business_id uuid not null references public.businesses (id) on delete cascade,
  day         date not null,
  views       int  not null default 0,
  orders      int  not null default 0,
  primary key (business_id, day)
);

alter table public.menu_stats enable row level security;

-- Solo el dueño puede LEER sus estadísticas. Nadie escribe directo en la tabla:
-- se suma únicamente a través de la función track_event de abajo.
grant select on public.menu_stats to authenticated;

drop policy if exists "Dueño: ver sus estadísticas" on public.menu_stats;
create policy "Dueño: ver sus estadísticas"
  on public.menu_stats for select to authenticated
  using (public.is_owner(business_id));

-- Suma 1 visita ('view') o 1 pedido ('order') al negocio de ese slug, hoy.
-- security definer: el visitante anónimo no tiene permiso sobre la tabla,
-- pero sí puede llamar a esta función, que solo sabe sumar de a uno.
create or replace function public.track_event(p_slug text, p_kind text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_business uuid;
  v_hoy date := (now() at time zone 'America/Guayaquil')::date;
begin
  if p_kind not in ('view', 'order') then
    return;
  end if;

  select id into v_business from public.businesses where slug = p_slug and is_active;
  if v_business is null then
    return;
  end if;

  insert into public.menu_stats as s (business_id, day, views, orders)
  values (v_business, v_hoy, (p_kind = 'view')::int, (p_kind = 'order')::int)
  on conflict (business_id, day) do update
    set views  = s.views  + (p_kind = 'view')::int,
        orders = s.orders + (p_kind = 'order')::int;
end $$;

revoke all on function public.track_event(text, text) from public;
grant execute on function public.track_event(text, text) to anon, authenticated;
