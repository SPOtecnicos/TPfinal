import { useState, useEffect } from "react";
import { pedir } from "../api";
import { formatoPesos } from "../utils/formato";

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function cargar() {
    try {
      setProductos(await pedir("/productos"));
      setClientes(await pedir("/clientes"));
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

  function agregar(producto) {
    const existente = carrito.find((item) => item.producto_id === producto.id);
    const cantidadActual = existente ? existente.cantidad : 0;

    if (cantidadActual + 1 > producto.stock) {
      mostrarMensaje("No hay más stock de " + producto.nombre, true);
      return;
    }

    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        { producto_id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 },
      ]);
    }
    setMensaje("");
  }

  function quitar(productoId) {
    setCarrito(carrito.filter((item) => item.producto_id !== productoId));
  }

  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  async function confirmarCompra() {
    if (!clienteId) {
      mostrarMensaje("Seleccioná un cliente", true);
      return;
    }
    if (carrito.length === 0) {
      mostrarMensaje("El carrito está vacío", true);
      return;
    }

    const datos = {
      cliente_id: Number(clienteId),
      items: carrito.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
    };

    try {
      const pedido = await pedir("/pedidos", "POST", datos);
      mostrarMensaje("Compra realizada. Pedido N° " + pedido.id, false);
      setCarrito([]);
      setClienteId("");
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2>Tienda</h2>

      {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

      <div className="tienda">
        <div className="lista-productos">
          <input
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{formatoPesos(p.precio)}</td>
                  <td className={p.stock < 5 ? "stock-bajo" : ""}>{p.stock}</td>
                  <td>
                    <button disabled={p.stock === 0} onClick={() => agregar(p)}>
                      Agregar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="carrito">
          <h3>Carrito</h3>

          <label>Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Seleccionar...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido}
              </option>
            ))}
          </select>

          {carrito.length === 0 ? (
            <p>No hay productos en el carrito</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.producto_id}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatoPesos(item.precio * item.cantidad)}</td>
                    <td>
                      <button className="peligro" onClick={() => quitar(item.producto_id)}>
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>Total: {formatoPesos(total)}</h3>
          <button onClick={confirmarCompra}>Confirmar compra</button>
        </div>
      </div>
    </div>
  );
}

export default Tienda;
