// Compresión de imágenes en el navegador ANTES de subirlas.
// Una foto de celular de 4 MB queda en ~150 KB: el menú carga rápido con
// datos móviles y el plan gratis de Supabase rinde mucho más.

const TIPOS = ['image/jpeg', 'image/png', 'image/webp']

// tipo: 'producto' (hasta 1200 px) o 'logo' (hasta 400 px)
export async function comprimirImagen(file, tipo = 'producto') {
  if (!TIPOS.includes(file.type)) throw new Error('Usa una imagen JPG, PNG o WebP')
  // La librería se descarga solo cuando el dueño sube una foto.
  const { default: imageCompression } = await import('browser-image-compression')
  const esLogo = tipo === 'logo'
  return imageCompression(file, {
    maxWidthOrHeight: esLogo ? 400 : 1200,
    maxSizeMB: esLogo ? 0.08 : 0.2,
    fileType: 'image/webp',
    initialQuality: 0.82,
    useWebWorker: true,
  })
}
