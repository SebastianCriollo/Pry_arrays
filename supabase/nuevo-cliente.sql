-- =====================================================================
--  MenúQR · Alta de un cliente nuevo
--
--  1) En Supabase → Authentication → Users → "Add user" crea el usuario
--     del dueño con su email y una contraseña (marca "Auto Confirm User").
--  2) Cambia los 3 valores de abajo y ejecuta este archivo en el SQL Editor.
--  3) Entrégale al dueño: midominio.com/admin + su email y contraseña.
-- =====================================================================
do $$
declare
  v_email  text := 'dueno@ejemplo.com';        -- ← email del usuario creado en el paso 1
  v_slug   text := 'mi-restaurante';           -- ← minúsculas, números y guiones
  v_nombre text := 'Mi Restaurante';           -- ← nombre visible
  v_owner  uuid;
  v_negocio uuid;
begin
  select id into v_owner from auth.users where email = v_email;
  if v_owner is null then
    raise exception 'No existe un usuario con el email %. Créalo primero en Authentication → Users.', v_email;
  end if;

  insert into public.businesses (owner_id, slug, name, hours)
  values (
    v_owner, v_slug, v_nombre,
    -- Horario inicial; el dueño lo cambia luego desde su panel.
    '{"lun":{"abre":"08:00","cierra":"20:00"},
      "mar":{"abre":"08:00","cierra":"20:00"},
      "mie":{"abre":"08:00","cierra":"20:00"},
      "jue":{"abre":"08:00","cierra":"20:00"},
      "vie":{"abre":"08:00","cierra":"20:00"},
      "sab":{"abre":"08:00","cierra":"20:00"},
      "dom":null}'::jsonb
  )
  returning id into v_negocio;

  -- Categorías de arranque para que el panel no esté vacío.
  insert into public.categories (business_id, name, position) values
    (v_negocio, 'Entradas', 1),
    (v_negocio, 'Platos fuertes', 2),
    (v_negocio, 'Bebidas', 3),
    (v_negocio, 'Postres', 4);

  raise notice 'Listo: negocio "%" creado en /%', v_nombre, v_slug;
end $$;

-- ---------------------------------------------------------------------
-- Otras tareas del vendedor
-- ---------------------------------------------------------------------
-- Suspender el menú de un cliente (deja de verse al escanear el QR):
--   update public.businesses set is_active = false where slug = 'mi-restaurante';
-- Reactivarlo:
--   update public.businesses set is_active = true  where slug = 'mi-restaurante';
-- Cambiar el slug (¡los QR ya impresos dejarán de funcionar!):
--   update public.businesses set slug = 'nuevo-slug' where slug = 'mi-restaurante';
