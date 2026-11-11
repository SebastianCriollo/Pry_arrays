// Genera supabase/seed.sql a partir de src/demo/demoData.js
// Uso: npm run seed:sql
import { writeFileSync } from 'node:fs'
import { demoBusiness as b, demoMenu } from '../src/demo/demoData.js'

// Escapa un valor como literal SQL.
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)

let sql = `-- =====================================================================
--  MenúQR · Datos de ejemplo: "${b.name}" (cafetería ficticia)
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

  delete from public.businesses where slug = ${q(b.slug)};

  insert into public.businesses
    (owner_id, slug, name, tagline, address, maps_url, phone, whatsapp, instagram,
     hours, primary_color, background_color)
  values
    (v_owner, ${q(b.slug)}, ${q(b.name)}, ${q(b.tagline)}, ${q(b.address)},
     ${q(b.maps_url)}, ${q(b.phone)}, ${q(b.whatsapp)}, ${q(b.instagram)},
     ${q(JSON.stringify(b.hours))}::jsonb, ${q(b.primary_color)}, ${q(b.background_color)})
  returning id into v_negocio;
`

demoMenu.forEach((cat, i) => {
  sql += `
  -- ${cat.name}
  insert into public.categories (business_id, name, position)
  values (v_negocio, ${q(cat.name)}, ${i + 1}) returning id into v_cat;
  insert into public.products (category_id, name, description, price, tag, is_available, position) values
${cat.products
  .map(
    (p, j) =>
      `    (v_cat, ${q(p.name)}, ${q(p.description)}, ${p.price.toFixed(2)}, ${q(p.tag)}, ${p.is_available !== false}, ${j + 1})`,
  )
  .join(',\n')};
`
})

sql += `
  raise notice 'Demo creada: /%', ${q(b.slug)};
end $$;
`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log('supabase/seed.sql generado')
