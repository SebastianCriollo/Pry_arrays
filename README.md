# MenúQR

Menú digital con código QR para restaurantes y cafeterías. Un solo deploy sirve a muchos negocios: cada uno vive en `midominio.com/su-slug`, con sus colores, su logo y su propio panel de administración.

- **Cliente:** escanea el QR, ve el menú, busca, arma su pedido y lo envía por WhatsApp.
- **Dueño:** entra a `/admin`, edita productos y categorías, marca agotados, sube fotos y descarga su QR.
- **Tú (vendedor):** das de alta a cada negocio desde Supabase. No hay registro público.

**Stack:** React + Vite + Tailwind CSS · Supabase (Auth, Postgres con RLS, Storage) · Netlify o Vercel.

---

## 1. Probarlo en 1 minuto (modo demo, sin Supabase)

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Sin archivo `.env` la app arranca en **modo demo**: usa la cafetería ficticia *Café Rumiñahui* y guarda los cambios solo en el navegador.

| Qué | Dónde |
|---|---|
| Menú público | `/cafe-ruminahui` |
| Menú con número de mesa | `/cafe-ruminahui?mesa=5` |
| Panel | `/admin` → `demo@menuqr.app` / `demo1234` |

El modo demo también sirve para enseñarle el panel a un posible cliente sin crearle una cuenta. La demo no trae fotos: súbelas desde el panel.

---

## 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (el plan gratis alcanza para empezar).
2. **SQL Editor → New query:** pega todo [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo. Crea las tablas, los triggers, las políticas RLS y el bucket `menu-images`.
3. **Authentication → Sign In / Providers:** desactiva *Allow new users to sign up*. Así nadie puede crearse una cuenta por su lado.
4. **Project Settings → API:** copia la *Project URL* y la clave *anon public*.
5. En el proyecto, copia `.env.example` como `.env` y pega esos dos valores:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_VENTAS_WHATSAPP=5939XXXXXXXX   # opcional: tu WhatsApp en la página de inicio
   ```

6. Reinicia `npm run dev`.

### Actualizar una base ya instalada

Si creaste tu base con una versión anterior, ejecuta en el SQL Editor los archivos de [`supabase/migraciones/`](supabase/migraciones) que aún no hayas corrido, en orden. Son seguros: no borran datos.

| Migración | Qué agrega |
|---|---|
| `001-nuevo-estilo.sql` | Foto de portada del menú y los colores por defecto del nuevo estilo (naranja y blanco) |

### Cargar la cafetería de ejemplo

1. **Authentication → Users → Add user:** email `demo@menuqr.app`, la contraseña que quieras, y marca *Auto Confirm User*.
2. **SQL Editor:** ejecuta [`supabase/seed.sql`](supabase/seed.sql).
3. Abre `/cafe-ruminahui`.

`seed.sql` se genera desde `src/demo/demoData.js`. Si cambias los datos de ejemplo, regenera con `npm run seed:sql`.

---

## 3. Dar de alta un cliente nuevo

1. **Authentication → Users → Add user:** el email del dueño y una contraseña (marca *Auto Confirm User*).
2. Abre [`supabase/nuevo-cliente.sql`](supabase/nuevo-cliente.sql), cambia las tres variables (email, slug y nombre) y ejecútalo en el SQL Editor.
3. Entrégale al dueño la dirección `midominio.com/admin`, su email y su contraseña.

El dueño completa el resto desde su panel (logo, colores, horario, WhatsApp, productos).

**Suspender a un cliente que no paga** (su menú deja de verse):

```sql
update public.businesses set is_active = false where slug = 'mi-restaurante';
```

El slug, el dueño y el estado activo solo se pueden cambiar desde el SQL Editor; el dueño no puede tocarlos desde la app.

---

## 4. Desplegar

Sube el repositorio a GitHub y conéctalo en cualquiera de los dos:

**Netlify** — *Add new site → Import an existing project*. La configuración ya está en `netlify.toml` (build `npm run build`, carpeta `dist`, redirección de SPA).

**Vercel** — *Add New → Project*. Detecta Vite automáticamente; `vercel.json` ya trae la redirección de SPA.

En ambos, agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (y `VITE_VENTAS_WHATSAPP` si la usas) antes del primer deploy. Si las cambias después, vuelve a desplegar.

Con un dominio propio, los QR apuntan a `tudominio.com/slug`. **Genera los QR desde el sitio ya publicado**, no desde `localhost`: el código lleva la dirección desde la que se generó.

---

## 5. Estructura del proyecto

```
├── supabase/
│   ├── schema.sql            # tablas, triggers, RLS, bucket y políticas
│   ├── seed.sql              # cafetería de ejemplo (generado)
│   └── nuevo-cliente.sql     # plantilla para dar de alta un negocio
├── scripts/generar-seed.mjs  # demoData.js → seed.sql
├── src/
│   ├── App.jsx               # rutas: /, /:slug, /admin/*
│   ├── index.css             # Tailwind + variables de tema
│   ├── demo/demoData.js      # datos de la cafetería ficticia
│   ├── lib/
│   │   ├── supabase.js       # cliente (null en modo demo)
│   │   ├── api/              # capa de datos: supabaseApi.js y demoApi.js
│   │   ├── theme.js          # colores del negocio → variables CSS
│   │   ├── format.js         # precios, buscador, "Abierto ahora"
│   │   ├── whatsapp.js       # mensaje del pedido y enlace wa.me
│   │   ├── images.js         # compresión antes de subir
│   │   └── qr.js             # QR en PNG y PDF
│   ├── hooks/                # useMenu, useCart, useAuth
│   ├── pages/
│   │   ├── Landing.jsx       # "/"
│   │   ├── PublicMenu.jsx    # "/:slug"
│   │   └── admin/            # Login, AdminLayout, ProductsPage, BusinessPage, QrPage
│   └── components/
│       ├── menu/             # encabezado, chips, tarjeta, buscador, carrito
│       ├── admin/            # formulario de producto, fotos, horario, colores, arrastrar
│       └── ui/               # botón, switch, modal, avisos, íconos
├── netlify.toml · vercel.json
└── tailwind.config.js
```

---

## 6. Cómo funciona (lo esencial)

**Seguridad.** Todo se decide en la base de datos con Row Level Security, no en el navegador. Cualquiera puede *leer* negocios activos, categorías visibles y sus productos. Solo el dueño (`owner_id = auth.uid()`) puede escribir, y solo en su negocio. En Storage, cada dueño solo puede subir a la carpeta con el id de su negocio.

**Tema por negocio.** El dueño elige un color principal y uno de fondo (por defecto naranja `#FF7622` sobre blanco), y puede subir una foto de portada. `theme.js` los convierte en variables CSS y calcula solo el color del texto (oscuro o claro) para que siempre haya contraste.

**Horario.** Se guarda por día en `businesses.hours`:

```json
{ "lun": { "abre": "08:00", "cierra": "20:00" }, "dom": null }
```

El menú muestra «Abierto · cierra 20:00» o «Cerrado · abre mañana 08:00», calculado con la hora de Ecuador. Soporta turnos que pasan de medianoche.

**Pedidos.** No se guardan en la base: el carrito vive en el celular del cliente y el botón arma un mensaje de WhatsApp con productos, cantidades, total, nombre, nota y mesa. Si el negocio no tiene WhatsApp configurado, el menú se muestra sin carrito.

**Mesas.** En la pestaña *Código QR* se puede poner un número de mesa: el QR lleva `?mesa=N` y el pedido llega con «Mesa N».

**Fotos.** Se comprimen en el navegador antes de subir (WebP: productos hasta 1200 px, portada hasta 1600 px, logo hasta 400 px). Una categoría con al menos una foto se muestra en cuadrícula de 2 columnas; sin fotos, como lista.

**Etiquetas de producto.** `nuevo`, `mas_pedido` y `picante`. Para agregar otra: añádela al `check` de `products.tag` en la base y al objeto `TAGS` en `src/components/menu/ProductCard.jsx`.
