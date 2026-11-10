import { useState, useEffect } from "react";
import { pedir } from "../api";
import { formatoPesos, formatoFecha } from "../utils/formato";
import { exportarFactura } from "../utils/exportar";

const estados = ["pendiente", "pagado", "enviado", "entregado"];

function Pedidos({ usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function cargar() {
    try {
      setPedidos(await pedir("/pedidos"));
    } catch (e) {
      mostrarMensaje(e.message, true);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function mostrarMensaje(texto, error) {
    setMensaje(texto);
    setEsError(error);
  }

  async function verDetalle(id) {
    try {
      setDetalle(await pedir("/pedidos/" + id));
    } catch (e) {
      mostrarMensaje(e.message, true);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await pedir("/pedidos/" + id + "/estado", "PUT", { estado: estado });
      mostrarMensaje("Estado del pedido actualizado", false);
      cargar();
      if (detalle && detalle.id === id) {
        verDetalle(id);
      }
    } catch (e) {
      mostrarMensaje(e.message, true);
    }
  }

  async function eliminar(id) {
    if (!window.confirm("¿Seguro que querés eliminar el pedido? Se devuelve el stock.")) {
      return;
    }
    try {
      await pedir("/pedidos/" + id, "DELETE");
      mostrarMensaje("Pedido eliminado", false);
      if (detalle && detalle.id === id) {
        setDetalle(null);
      }
      cargar();
    } catch (e) {
      mostrarMensaje(e.message, true);
    }
  }

  return (
    <div>
      <h2>Pedidos</h2>

      {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{formatoFecha(p.fecha)}</td>
              <td>{p.cliente}</td>
              <td>
                <select value={p.estado} onChange={(e) => cambiarEstado(p.id, e.target.value)}>
                  {estados.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </td>
              <td>{formatoPesos(p.total)}</td>
              <td>
                <button onClick={() => verDetalle(p.id)}>Ver detalle</button>
                {usuario.rol === "admin" && (
                  <button className="peligro" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detalle && (
        <div className="detalle">
          <h3>Detalle del pedido N° {detalle.id}</h3>
          <p>Cliente: {detalle.cliente}</p>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalle.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.producto}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatoPesos(item.precio_unitario)}</td>
                  <td>{formatoPesos(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: {formatoPesos(detalle.total)}</h3>
          <button onClick={() => exportarFactura(detalle)}>Emitir factura (PDF)</button>
          <button className="secundario" onClick={() => setDetalle(null)}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

export default Pedidos;
