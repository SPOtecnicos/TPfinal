export function formatoPesos(numero) {
  return Number(numero).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function formatoFecha(fecha) {
  return new Date(fecha).toLocaleString("es-AR");
}
