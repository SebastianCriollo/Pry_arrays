-- =====================================================================
--  MenúQR · Datos de ejemplo: "Café Rumiñahui" (cafetería ficticia)
--  ARCHIVO GENERADO con "npm run seed:sql" — edita src/demo/demoData.js
--
--  Antes de ejecutarlo crea en Authentication → Users el usuario
--  demo@menuqr.app (o cambia v_email abajo por el email que prefieras).
--  Puedes ejecutarlo varias veces: borra y vuelve a crear la demo.
-- =====================================================================
do $$
declare
  v_email   text := 'demo@menuqr.app';
  v_owner   uuid;
  v_negocio uuid;
  v_cat     uuid;
begin
  select id into v_owner from auth.users where email = v_email;
  if v_owner is null then
    raise exception 'Crea primero el usuario % en Authentication → Users.', v_email;
  end if;

  delete from public.businesses where slug = 'cafe-ruminahui';

  insert into public.businesses
    (owner_id, slug, name, tagline, address, maps_url, phone, whatsapp, instagram,
     hours, primary_color, background_color)
  values
    (v_owner, 'cafe-ruminahui', 'Café Rumiñahui', 'Café de altura y cocina de casa al pie de los volcanes', 'Av. Amazonas y Luis Cordero, Machachi',
     'https://www.google.com/maps/search/?api=1&query=Machachi+Ecuador', '+593 99 000 0000', '593990000000', 'cafe.ruminahui',
     '{"lun":{"abre":"07:30","cierra":"19:00"},"mar":{"abre":"07:30","cierra":"19:00"},"mie":{"abre":"07:30","cierra":"19:00"},"jue":{"abre":"07:30","cierra":"19:00"},"vie":{"abre":"07:30","cierra":"21:00"},"sab":{"abre":"08:00","cierra":"21:00"},"dom":{"abre":"08:00","cierra":"15:00"}}'::jsonb, '#A64B2A', '#FAF5EE')
  returning id into v_negocio;

  -- Desayunos
  insert into public.categories (business_id, name, position)
  values (v_negocio, 'Desayunos', 1) returning id into v_cat;
  insert into public.products (category_id, name, description, price, tag, is_available, position) values
    (v_cat, 'Desayuno Chagra', 'Huevos al gusto, pan de casa, queso de hoja, jugo natural y café pasado.', 4.50, 'mas_pedido', true, 1),
    (v_cat, 'Tigrillo con queso', 'Verde majado con huevo y queso fresco, acompañado de café.', 4.00, null, true, 2),
    (v_cat, 'Bolón mixto', 'De queso y chicharrón, con huevo frito y ají de la casa.', 3.75, null, true, 3),
    (v_cat, 'Tostadas con palta', 'Pan de masa madre, aguacate, huevo pochado y semillas.', 4.25, 'nuevo', true, 4);

  -- Entradas
  insert into public.categories (business_id, name, position)
  values (v_negocio, 'Entradas', 2) returning id into v_cat;
  insert into public.products (category_id, name, description, price, tag, is_available, position) values
    (v_cat, 'Empanadas de viento', 'Dos empanadas grandes de queso, espolvoreadas con azúcar.', 2.50, 'mas_pedido', true, 1),
    (v_cat, 'Humita de la abuela', 'Choclo tierno molido, cocida en hoja. Con queso fresco.', 2.25, null, true, 2),
    (v_cat, 'Locro de papa', 'Con queso, aguacate y tostado. Receta de la Sierra.', 3.50, null, true, 3),
    (v_cat, 'Choclo con queso y ají', 'Choclo cocinado, queso de hoja y ají de tomate de árbol.', 2.75, 'picante', true, 4);

  -- Platos fuertes
  insert into public.categories (business_id, name, position)
  values (v_negocio, 'Platos fuertes', 3) returning id into v_cat;
  insert into public.products (category_id, name, description, price, tag, is_available, position) values
    (v_cat, 'Seco de pollo', 'Con arroz amarillo, maduro frito y aguacate.', 5.50, null, true, 1),
    (v_cat, 'Trucha a la plancha', 'Trucha de río con papas doradas y ensalada fresca.', 7.50, 'mas_pedido', true, 2),
    (v_cat, 'Llapingachos', 'Tortillas de papa con chorizo, huevo, aguacate y salsa de maní.', 6.00, null, true, 3),
    (v_cat, 'Fritada machacheña', 'Con mote, tostado, papas y encurtido.', 6.50, null, false, 4),
    (v_cat, 'Sánduche de pernil', 'Pan artesanal, pernil horneado, cebolla encurtida y ají.', 4.75, 'picante', true, 5);

  -- Café y bebidas
  insert into public.categories (business_id, name, position)
  values (v_negocio, 'Café y bebidas', 4) returning id into v_cat;
  insert into public.products (category_id, name, description, price, tag, is_available, position) values
    (v_cat, 'Café pasado', 'Grano de altura tostado en Mejía, filtrado al momento.', 1.50, null, true, 1),
    (v_cat, 'Capuchino', 'Espresso doble con leche cremada.', 2.50, 'mas_pedido', true, 2),
    (v_cat, 'Chocolate caliente', 'Cacao fino de aroma con leche y un toque de canela.', 2.75, null, true, 3),
    (v_cat, 'Jugo natural', 'Mora, naranjilla, tomate de árbol o guanábana.', 2.00, null, true, 4),
    (v_cat, 'Limonada de hierbaluisa', 'Fría, con hierbaluisa fresca y panela.', 2.25, 'nuevo', true, 5),
    (v_cat, 'Canelazo', 'Bebida caliente de naranjilla y canela. Con o sin puntas.', 2.50, null, true, 6);

  -- Postres
  insert into public.categories (business_id, name, position)
  values (v_negocio, 'Postres', 5) returning id into v_cat;
  insert into public.products (category_id, name, description, price, tag, is_available, position) values
    (v_cat, 'Higos con queso', 'Higos en miel de panela con queso fresco.', 2.75, null, true, 1),
    (v_cat, 'Torta de chocolate', 'Húmeda, con cacao ecuatoriano y crema batida.', 3.25, 'mas_pedido', true, 2),
    (v_cat, 'Quesadilla quiteña', 'Masa fina rellena de queso dulce, recién horneada.', 1.75, null, true, 3),
    (v_cat, 'Helado de paila', 'Dos bolas: mora, taxo o naranjilla.', 2.50, null, false, 4);

  raise notice 'Demo creada: /%', 'cafe-ruminahui';
end $$;
