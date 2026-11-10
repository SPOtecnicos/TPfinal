import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// columnas: [{ campo: "nombre", titulo: "Nombre" }, ...]
export function exportarPDF(titulo, columnas, filas) {
  const doc = new jsPDF();
  doc.text(titulo, 14, 15);
  autoTable(doc, {
    startY: 22,
    head: [columnas.map((c) => c.titulo)],
    body: filas.map((fila) => columnas.map((c) => fila[c.campo])),
  });
  doc.save(titulo + ".pdf");
}

export function exportarExcel(titulo, columnas, filas) {
  const datos = filas.map((fila) => {
    const nuevaFila = {};
    columnas.forEach((c) => {
      nuevaFila[c.titulo] = fila[c.campo];
    });
    return nuevaFila;
  });

  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
  XLSX.writeFile(libro, titulo + ".xlsx");
}

// Genera la factura de un pedido en PDF (usa los datos del detalle del pedido)
export function exportarFactura(pedido) {
  const pesos = (numero) =>
    Number(numero).toLocaleString("es-AR", { style: "currency", currency: "ARS" }).replace(/\u00a0/g, " ");

  const doc = new jsPDF();
  const numero = "0001-" + String(pedido.id).padStart(8, "0");

  doc.setFontSize(22);
  doc.text("FACTURA", 14, 20);
  doc.setFontSize(11);
  doc.text("Ecommerce", 14, 28);

  doc.text("N° " + numero, 196, 20, { align: "right" });
  doc.text("Fecha: " + new Date(pedido.fecha).toLocaleDateString("es-AR"), 196, 28, { align: "right" });

  doc.line(14, 33, 196, 33);

  doc.setFontSize(12);
  doc.text("Datos del cliente", 14, 42);
  doc.setFontSize(10);
  doc.text("Nombre: " + pedido.cliente, 14, 49);
  doc.text("Email: " + (pedido.cliente_email || "-"), 14, 55);
  doc.text("Dirección: " + (pedido.cliente_direccion || "-"), 14, 61);
  doc.text("Estado del pedido: " + pedido.estado, 14, 67);

  autoTable(doc, {
    startY: 75,
    head: [["Producto", "Cantidad", "Precio unitario", "Subtotal"]],
    body: pedido.items.map((item) => [
      item.producto,
      item.cantidad,
      pesos(item.precio_unitario),
      pesos(item.subtotal),
    ]),
  });

  const y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.text("TOTAL: " + pesos(pedido.total), 196, y, { align: "right" });

  doc.setFontSize(8);
  doc.text("Comprobante de venta sin validez fiscal.", 14, 285);

  doc.save("Factura-" + numero + ".pdf");
}
