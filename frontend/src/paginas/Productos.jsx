import { useState, useEffect } from "react";
import { pedir } from "../api";
import { validarProducto } from "../utils/validaciones";
import { formatoPesos } from "../utils/formato";

const formVacio = { nombre: "", descripcion: "", precio: "", stock: "", categoria_id: "" };

function Productos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function cargar() {
    try {
      setProductos(await pedir("/productos"));
      setCategorias(await pedir("/categorias"));
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

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    const erroresForm = validarProducto(form);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      return;
    }

    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoria_id: Number(form.categoria_id),
    };

    try {
      if (editandoId) {
        await pedir("/productos/" + editandoId, "PUT", datos);
        mostrarMensaje("Producto modificado", false);
      } else {
        await pedir("/productos", "POST", datos);
        mostrarMensaje("Producto creado", false);
      }
      cancelar();
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  function editar(producto) {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      categoria_id: producto.categoria_id,
    });
    setErrores({});
  }

  function cancelar() {
    setEditandoId(null);
    setForm(formVacio);
    setErrores({});
  }

  async function eliminar(id) {
    if (!window.confirm("¿Seguro que querés eliminar el producto?")) {
      return;
    }
    try {
      await pedir("/productos/" + id, "DELETE");
      mostrarMensaje("Producto eliminado", false);
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  return (
    <div>
      <h2>Productos</h2>

      {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

      <form className="formulario" onSubmit={guardar}>
        <h3>{editandoId ? "Modificar producto" : "Nuevo producto"}</h3>

        <label>Nombre</label>
        <input name="nombre" value={form.nombre} onChange={cambiar} />
        {errores.nombre && <span className="error-campo">{errores.nombre}</span>}

        <label>Descripción</label>
        <input name="descripcion" value={form.descripcion} onChange={cambiar} />

        <label>Precio</label>
        <input name="precio" value={form.precio} onChange={cambiar} />
        {errores.precio && <span className="error-campo">{errores.precio}</span>}

        <label>Stock</label>
        <input name="stock" value={form.stock} onChange={cambiar} />
        {errores.stock && <span className="error-campo">{errores.stock}</span>}

        <label>Categoría</label>
        <select name="categoria_id" value={form.categoria_id} onChange={cambiar}>
          <option value="">Seleccionar...</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errores.categoria_id && <span className="error-campo">{errores.categoria_id}</span>}

        <div className="botones">
          <button type="submit">{editandoId ? "Guardar cambios" : "Agregar"}</button>
          {editandoId && (
            <button type="button" className="secundario" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>{formatoPesos(p.precio)}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
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
    </div>
  );
}

export default Productos;
