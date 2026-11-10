import { useState, useEffect } from "react";
import { pedir } from "../api";
import { exportarPDF, exportarExcel } from "../utils/exportar";

const reportes = [
  {
    ruta: "/reportes/ventas-por-categoria",
    titulo: "Ventas por categoría",
    columnas: [
      { campo: "categoria", titulo: "Categoría" },
      { campo: "cantidad_pedidos", titulo: "Pedidos" },
      { campo: "unidades_vendidas", titulo: "Unidades vendidas" },
      { campo: "total_vendido", titulo: "Total vendido" },
    ],
  },
  {
    ruta: "/reportes/productos-mas-vendidos",
    titulo: "Productos más vendidos",
    columnas: [
      { campo: "producto", titulo: "Producto" },
      { campo: "categoria", titulo: "Categoría" },
      { campo: "unidades_vendidas", titulo: "Unidades vendidas" },
      { campo: "total_vendido", titulo: "Total vendido" },
    ],
  },
  {
    ruta: "/reportes/clientes-destacados",
    titulo: "Clientes que gastaron más que el promedio",
    columnas: [
      { campo: "cliente", titulo: "Cliente" },
      { campo: "email", titulo: "Email" },
      { campo: "cantidad_pedidos", titulo: "Pedidos" },
      { campo: "total_gastado", titulo: "Total gastado" },
    ],
  },
  {
    ruta: "/reportes/productos-sin-ventas",
    titulo: "Productos sin ventas",
    columnas: [
      { campo: "producto", titulo: "Producto" },
      { campo: "categoria", titulo: "Categoría" },
      { campo: "precio", titulo: "Precio" },
      { campo: "stock", titulo: "Stock" },
    ],
  },
];

function Reportes() {
  const [indice, setIndice] = useState(0);
  const [filas, setFilas] = useState([]);
  const [error, setError] = useState("");

  const reporte = reportes[indice];

  useEffect(() => {
    async function cargar() {
      try {
        setError("");
        setFilas(await pedir(reporte.ruta));
      } catch (e) {
        setError(e.message);
        setFilas([]);
      }
    }
    cargar();
  }, [indice]);

  return (
    <div>
      <h2>Reportes</h2>

      <label>Reporte: </label>
      <select value={indice} onChange={(e) => setIndice(Number(e.target.value))}>
        {reportes.map((r, i) => (
          <option key={i} value={i}>
            {r.titulo}
          </option>
        ))}
      </select>

      <div className="botones">
        <button disabled={filas.length === 0} onClick={() => exportarPDF(reporte.titulo, reporte.columnas, filas)}>
          Exportar PDF
        </button>
        <button disabled={filas.length === 0} onClick={() => exportarExcel(reporte.titulo, reporte.columnas, filas)}>
          Exportar Excel
        </button>
      </div>

      {error && <p className="mensaje error">{error}</p>}

      <table>
        <thead>
          <tr>
            {reporte.columnas.map((c) => (
              <th key={c.campo}>{c.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              {reporte.columnas.map((c) => (
                <td key={c.campo}>{fila[c.campo]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {filas.length === 0 && !error && <p>No hay datos para mostrar</p>}
    </div>
  );
}

export default Reportes;
