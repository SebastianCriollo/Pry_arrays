// Generación del código QR: PNG para pantallas y PDF listo para imprimir.
import QRCode from 'qrcode'
import { hexToRgb } from './theme'

// QR como data URL (PNG). Siempre oscuro sobre blanco: es lo que mejor
// leen las cámaras de celulares de gama media.
export const qrDataUrl = (texto, size = 1024) =>
  QRCode.toDataURL(texto, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#1c1917', light: '#ffffff' },
  })

export function descargar(dataUrl, nombreArchivo) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = nombreArchivo
  a.click()
}

// PDF tamaño A4 con tarjetas para las mesas.
// porHoja: 1 (cartel grande), 2 o 4 (tarjetas con líneas de corte).
export async function generarPdf({ url, business, porHoja = 4, mesa = '' }) {
  const { jsPDF } = await import('jspdf') // pesa bastante: se carga solo al usarlo
  // Matriz del QR: se dibuja como vectores (nítido a cualquier tamaño y PDF liviano).
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' }).modules
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const ANCHO = 210
  const ALTO = 297
  const columnas = porHoja === 4 ? 2 : 1
  const filas = porHoja === 1 ? 1 : 2
  const w = ANCHO / columnas
  const h = ALTO / filas
  const primario = hexToRgb(business.primary_color)

  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      dibujarTarjeta(pdf, { x: col * w, y: fila * h, w, h, qr, business, mesa, url, primario })
    }
  }

  // Líneas de corte punteadas entre tarjetas.
  pdf.setDrawColor(180).setLineWidth(0.2).setLineDashPattern([1.5, 1.5], 0)
  if (columnas === 2) pdf.line(ANCHO / 2, 0, ANCHO / 2, ALTO)
  if (filas === 2) pdf.line(0, ALTO / 2, ANCHO, ALTO / 2)

  pdf.save(`qr-${business.slug}${mesa ? `-mesa-${mesa}` : ''}.pdf`)
}

function dibujarTarjeta(pdf, { x, y, w, h, qr, business, mesa, url, primario }) {
  const k = Math.min(w / 105, h / 148.5) // escala respecto a una tarjeta A6
  const cx = x + w / 2
  const margen = 9 * k

  // Marco redondeado con el color del negocio.
  pdf.setDrawColor(...primario).setLineWidth(0.9 * k).setLineDashPattern([], 0)
  pdf.roundedRect(x + margen, y + margen, w - margen * 2, h - margen * 2, 5 * k, 5 * k)

  // Nombre del negocio (se achica si es muy largo).
  pdf.setFont('helvetica', 'bold').setTextColor(...primario)
  let tam = 22 * k
  pdf.setFontSize(tam)
  const anchoMax = w - margen * 2 - 12 * k
  while (pdf.getTextWidth(business.name) > anchoMax && tam > 9) pdf.setFontSize(--tam)
  pdf.text(business.name, cx, y + margen + 20 * k, { align: 'center' })

  pdf.setFont('helvetica', 'normal').setTextColor(70).setFontSize(11.5 * k)
  pdf.text('Escanea y mira nuestro menú', cx, y + margen + 29 * k, { align: 'center' })

  // Código QR centrado.
  const lado = 62 * k
  const qrY = y + margen + 36 * k
  dibujarQr(pdf, qr, cx - lado / 2, qrY, lado)

  // Pastilla con el número de mesa (opcional).
  let pieY = qrY + lado + 9 * k
  if (mesa) {
    const etiqueta = `Mesa ${mesa}`
    pdf.setFont('helvetica', 'bold').setFontSize(12 * k)
    const anchoPastilla = pdf.getTextWidth(etiqueta) + 10 * k
    pdf.setFillColor(...primario)
    pdf.roundedRect(cx - anchoPastilla / 2, pieY - 5.5 * k, anchoPastilla, 8 * k, 4 * k, 4 * k, 'F')
    pdf.setTextColor(255).text(etiqueta, cx, pieY, { align: 'center' })
    pieY += 10 * k
  }

  pdf.setFont('helvetica', 'normal').setTextColor(90).setFontSize(9.5 * k)
  pdf.text('Abre la cámara de tu celular y apunta al código', cx, pieY, { align: 'center' })
  pdf.setTextColor(140).setFontSize(8 * k)
  pdf.text(url.replace(/^https?:\/\//, '').replace(/\?.*$/, ''), cx, y + h - margen - 6 * k, { align: 'center' })
}

// Dibuja la matriz del QR con rectángulos; une los módulos oscuros seguidos
// de cada fila en un solo rectángulo para no dejar líneas finas entre ellos.
function dibujarQr(pdf, modulos, x, y, lado) {
  const n = modulos.size
  const celda = lado / n
  pdf.setFillColor(28, 25, 23)
  for (let fila = 0; fila < n; fila++) {
    let inicio = -1
    for (let col = 0; col <= n; col++) {
      const oscuro = col < n && modulos.data[fila * n + col]
      if (oscuro && inicio === -1) inicio = col
      if (!oscuro && inicio !== -1) {
        // +0.02 mm de alto: solapa la fila siguiente y evita rayas blancas al imprimir.
        pdf.rect(x + inicio * celda, y + fila * celda, (col - inicio) * celda, celda + 0.02, 'F')
        inicio = -1
      }
    }
  }
}
