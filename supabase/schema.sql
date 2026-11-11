-- =====================================================================
--  MenúQR · Esquema de Supabase
--  Ejecuta este archivo completo UNA vez en: Supabase → SQL Editor.
--  Crea tablas, triggers, políticas RLS y el bucket de imágenes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- NEGOCIOS: una fila por restaurante / cafetería.
create table public.businesses (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users (id),
  -- El slug es la dirección pública: midominio.com/[slug]
  slug             text not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug <> 'admin'),
  name             text not null,
  tagline          text,                -- frase corta bajo el nombre
  logo_url         text,
  address          text,
  maps_url         text,                -- enlace de Google Maps
  phone            text,                -- botón "Llamar"
  whatsapp         text,                -- formato 5939XXXXXXXX (para wa.me)
  instagram        text,                -- usuario, sin @
  -- Horario por día. Claves: lun, mar, mie, jue, vie, sab, dom.
  -- Día abierto: {"abre":"08:00","cierra":"20:00"} · Día cerrado: null
  hours            jsonb not null default '{}'::jsonb,
  primary_color    text not null default '#B4532A' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color text not null default '#FBF7F2' check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  -- Lo controla el vendedor: en false el menú deja de verse (cliente que no paga).
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- CATEGORÍAS: Entradas, Platos fuertes, Bebidas…
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name        text not null,
  position    int  not null default 0,      -- orden (arrastrar y soltar)
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- PRODUCTOS
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  -- business_id lo rellena un trigger a partir de la categoría (ver abajo).
  business_id  uuid not null references public.businesses (id) on delete cascade,
  category_id  uuid not null references public.categories (id) on delete cascade,
  name         text not null,
  description  text,
  price        numeric(8,2) not null check (price >= 0),   -- USD
  image_url    text,
  tag          text check (tag in ('nuevo', 'mas_pedido', 'picante')),
  is_available boolean not null default true,   -- false = AGOTADO
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index businesses_owner_idx  on public.businesses (owner_id);
create index categories_orden_idx  on public.categories (business_id, position);
create index products_orden_idx    on public.products   (category_id, position);
create index products_business_idx on public.products   (business_id);

-- ---------------------------------------------------------------------
-- 2. FUNCIONES Y TRIGGERS
-- ---------------------------------------------------------------------

-- ¿El usuario con sesión es dueño de este negocio?
-- security definer: consulta businesses sin pasar por RLS (evita recursión).
create or replace function public.is_owner(p_business_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = p_business_id and b.owner_id = (select auth.uid())
  );
$$;

-- Mantiene updated_at al día.
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger businesses_touch before update on public.businesses
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- El dueño NO puede cambiar slug, dueño ni estado activo desde la app.
-- Esos campos los maneja el vendedor desde el SQL Editor (ahí auth.uid() es null).
create or replace function public.protect_business_fields()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and (
       new.slug      is distinct from old.slug
    or new.owner_id  is distinct from old.owner_id
    or new.is_active is distinct from old.is_active
  ) then
    raise exception 'No tienes permiso para cambiar slug, dueño o estado del negocio';
  end if;
  return new;
end $$;

create trigger businesses_protect before update on public.businesses
  for each row execute function public.protect_business_fields();

-- El negocio de un producto es SIEMPRE el de su categoría.
-- Así es imposible meter un producto en la categoría de otro negocio.
create or replace function public.set_product_business()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  select c.business_id into new.business_id
  from public.categories c where c.id = new.category_id;
  return new;
end $$;

create trigger products_set_business before insert or update of category_id on public.products
  for each row execute function public.set_product_business();

-- Guardan el orden tras arrastrar y soltar: reciben los ids ya ordenados.
-- Corren con los permisos del usuario, así que RLS sigue aplicando.
create or replace function public.reorder_categories(p_ids uuid[])
returns void language sql set search_path = ''
as $$
  update public.categories c set position = x.ord
  from unnest(p_ids) with ordinality as x (id, ord)
  where c.id = x.id;
$$;

create or replace function public.reorder_products(p_ids uuid[])
returns void language sql set search_path = ''
as $$
  update public.products p set position = x.ord
  from unnest(p_ids) with ordinality as x (id, ord)
  where p.id = x.id;
$$;

-- ---------------------------------------------------------------------
-- 3. PERMISOS Y ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- Permisos base de cada rol (RLS decide después qué filas).
-- Nota: nadie puede crear ni borrar negocios desde la app.
grant select on public.businesses, public.categories, public.products to anon, authenticated;
grant update on public.businesses to authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant execute on function public.is_owner(uuid) to anon, authenticated;
grant execute on function public.reorder_categories(uuid[]), public.reorder_products(uuid[]) to authenticated;

-- NEGOCIOS -------------------------------------------------------------
create policy "Público: ver negocios activos"
  on public.businesses for select to anon, authenticated
  using (is_active);

create policy "Dueño: ver su negocio"
  on public.businesses for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Dueño: editar su negocio"
  on public.businesses for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- CATEGORÍAS -----------------------------------------------------------
create policy "Público: ver categorías visibles"
  on public.categories for select to anon, authenticated
  using (
    is_visible and exists (
      select 1 from public.businesses b where b.id = business_id and b.is_active
    )
  );

create policy "Dueño: gestionar sus categorías"
  on public.categories for all to authenticated
  using (public.is_owner(business_id))
  with check (public.is_owner(business_id));

-- PRODUCTOS ------------------------------------------------------------
create policy "Público: ver productos de categorías visibles"
  on public.products for select to anon, authenticated
  using (
    exists (
      select 1 from public.categories c where c.id = category_id and c.is_visible
    )
  );

create policy "Dueño: gestionar sus productos"
  on public.products for all to authenticated
  using (public.is_owner(business_id))
  with check (public.is_owner(business_id));

-- ---------------------------------------------------------------------
-- 4. STORAGE: bucket de fotos y logos
-- ---------------------------------------------------------------------
-- Rutas:  {business_id}/logo-123.webp   ·   {business_id}/productos/abc.webp
-- Bucket público: cualquiera puede VER una imagen por su URL.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 2097152,          -- máx. 2 MB
        array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Solo el dueño puede subir, listar, reemplazar o borrar dentro de la
-- carpeta de su negocio (la primera carpeta de la ruta es el business_id).
create policy "Dueño: subir imágenes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-images'
              and public.is_owner(((storage.foldername(name))[1])::uuid));

create policy "Dueño: ver sus imágenes"
  on storage.objects for select to authenticated
  using (bucket_id = 'menu-images'
         and public.is_owner(((storage.foldername(name))[1])::uuid));

create policy "Dueño: reemplazar imágenes"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu-images'
         and public.is_owner(((storage.foldername(name))[1])::uuid));

create policy "Dueño: borrar imágenes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu-images'
         and public.is_owner(((storage.foldername(name))[1])::uuid));
