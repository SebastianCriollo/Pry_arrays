// Datos de la cafetería ficticia de la demo.
// Es la ÚNICA fuente: el modo demo los lee directamente y
// "npm run seed:sql" genera supabase/seed.sql a partir de este archivo.

const dia = (abre, cierra) => ({ abre, cierra })

export const demoBusiness = {
  slug: 'cafe-ruminahui',
  name: 'Café Rumiñahui',
  tagline: 'Café de altura y cocina de casa al pie de los volcanes',
  logo_url: null,
  address: 'Av. Amazonas y Luis Cordero, Machachi',
  maps_url: 'https://www.google.com/maps/search/?api=1&query=Machachi+Ecuador',
  phone: '+593 99 000 0000',
  whatsapp: '593990000000',
  instagram: 'cafe.ruminahui',
  hours: {
    lun: dia('07:30', '19:00'),
    mar: dia('07:30', '19:00'),
    mie: dia('07:30', '19:00'),
    jue: dia('07:30', '19:00'),
    vie: dia('07:30', '21:00'),
    sab: dia('08:00', '21:00'),
    dom: dia('08:00', '15:00'),
  },
  primary_color: '#A64B2A',
  background_color: '#FAF5EE',
  is_active: true,
}

// Cada categoría trae sus productos en orden.
// tag: 'nuevo' | 'mas_pedido' | 'picante' | null
export const demoMenu = [
  {
    name: 'Desayunos',
    products: [
      { name: 'Desayuno Chagra', description: 'Huevos al gusto, pan de casa, queso de hoja, jugo natural y café pasado.', price: 4.5, tag: 'mas_pedido' },
      { name: 'Tigrillo con queso', description: 'Verde majado con huevo y queso fresco, acompañado de café.', price: 4.0 },
      { name: 'Bolón mixto', description: 'De queso y chicharrón, con huevo frito y ají de la casa.', price: 3.75 },
      { name: 'Tostadas con palta', description: 'Pan de masa madre, aguacate, huevo pochado y semillas.', price: 4.25, tag: 'nuevo' },
    ],
  },
  {
    name: 'Entradas',
    products: [
      { name: 'Empanadas de viento', description: 'Dos empanadas grandes de queso, espolvoreadas con azúcar.', price: 2.5, tag: 'mas_pedido' },
      { name: 'Humita de la abuela', description: 'Choclo tierno molido, cocida en hoja. Con queso fresco.', price: 2.25 },
      { name: 'Locro de papa', description: 'Con queso, aguacate y tostado. Receta de la Sierra.', price: 3.5 },
      { name: 'Choclo con queso y ají', description: 'Choclo cocinado, queso de hoja y ají de tomate de árbol.', price: 2.75, tag: 'picante' },
    ],
  },
  {
    name: 'Platos fuertes',
    products: [
      { name: 'Seco de pollo', description: 'Con arroz amarillo, maduro frito y aguacate.', price: 5.5 },
      { name: 'Trucha a la plancha', description: 'Trucha de río con papas doradas y ensalada fresca.', price: 7.5, tag: 'mas_pedido' },
      { name: 'Llapingachos', description: 'Tortillas de papa con chorizo, huevo, aguacate y salsa de maní.', price: 6.0 },
      { name: 'Fritada machacheña', description: 'Con mote, tostado, papas y encurtido.', price: 6.5, is_available: false },
      { name: 'Sánduche de pernil', description: 'Pan artesanal, pernil horneado, cebolla encurtida y ají.', price: 4.75, tag: 'picante' },
    ],
  },
  {
    name: 'Café y bebidas',
    products: [
      { name: 'Café pasado', description: 'Grano de altura tostado en Mejía, filtrado al momento.', price: 1.5 },
      { name: 'Capuchino', description: 'Espresso doble con leche cremada.', price: 2.5, tag: 'mas_pedido' },
      { name: 'Chocolate caliente', description: 'Cacao fino de aroma con leche y un toque de canela.', price: 2.75 },
      { name: 'Jugo natural', description: 'Mora, naranjilla, tomate de árbol o guanábana.', price: 2.0 },
      { name: 'Limonada de hierbaluisa', description: 'Fría, con hierbaluisa fresca y panela.', price: 2.25, tag: 'nuevo' },
      { name: 'Canelazo', description: 'Bebida caliente de naranjilla y canela. Con o sin puntas.', price: 2.5 },
    ],
  },
  {
    name: 'Postres',
    products: [
      { name: 'Higos con queso', description: 'Higos en miel de panela con queso fresco.', price: 2.75 },
      { name: 'Torta de chocolate', description: 'Húmeda, con cacao ecuatoriano y crema batida.', price: 3.25, tag: 'mas_pedido' },
      { name: 'Quesadilla quiteña', description: 'Masa fina rellena de queso dulce, recién horneada.', price: 1.75 },
      { name: 'Helado de paila', description: 'Dos bolas: mora, taxo o naranjilla.', price: 2.5, is_available: false },
    ],
  },
]
