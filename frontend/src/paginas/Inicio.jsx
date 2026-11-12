import { useState, useEffect } from "react";
import { pedir } from "../api";
import { formatoPesos, formatoFecha } from "../utils/formato";

function Inicio() {
  const [resumen, setResumen] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setResumen(await pedir("/reportes/resumen"));
        const lista = await pedir("/pedidos");
        setPedidos(lista.slice(0, 5));
      } catch (e) {
        setError(e.message);
      }
    }
    cargar();
  }, []);

  if (error) return <p className="mensaje error">{error}</p>;
  if (!resumen) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Panel principal</h2>

      <div className="paneles">
        <div className="panel">
          <span>Productos</span>
          <strong>{resumen.total_productos}</strong>
        </div>
        <div className="panel">
          <span>Clientes</span>
          <strong>{resumen.total_clientes}</strong>
        </div>
        <div className="panel">
          <span>Pedidos</span>
          <strong>{resumen.total_pedidos}</strong>
        </div>
        <div className="panel">
          <span>Ventas totales</span>
          <strong>{formatoPesos(resumen.total_ventas)}</strong>
        </div>
        <div className="panel">
          <span>Productos con poco stock</span>
          <strong>{resumen.productos_stock_bajo}</strong>
        </div>
      </div>

      <h3>Últimos pedidos</h3>
      <table>
        <thead>
          <tr>
            <th>N°</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{formatoFecha(p.fecha)}</td>
              <td>{p.cliente}</td>
              <td>
                <span className={"estado " + p.estado}>{p.estado}</span>
              </td>
              <td>{formatoPesos(p.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inicio;
