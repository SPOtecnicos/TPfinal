import { useState, useEffect } from "react";
import { pedir } from "../api";
import { validarCategoria } from "../utils/validaciones";

const formVacio = { nombre: "", descripcion: "" };

function Categorias({ usuario }) {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function cargar() {
    try {
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
    const erroresForm = validarCategoria(form);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      return;
    }

    const datos = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || null };

    try {
      if (editandoId) {
        await pedir("/categorias/" + editandoId, "PUT", datos);
        mostrarMensaje("Categoría modificada", false);
      } else {
        await pedir("/categorias", "POST", datos);
        mostrarMensaje("Categoría creada", false);
      }
      cancelar();
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  function editar(categoria) {
    setEditandoId(categoria.id);
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || "" });
    setErrores({});
  }

  function cancelar() {
    setEditandoId(null);
    setForm(formVacio);
    setErrores({});
  }

  async function eliminar(id) {
    if (!window.confirm("¿Seguro que querés eliminar la categoría?")) {
      return;
    }
    try {
      await pedir("/categorias/" + id, "DELETE");
      mostrarMensaje("Categoría eliminada", false);
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  return (
    <div>
      <h2>Categorías</h2>

      {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

      <form className="formulario" onSubmit={guardar}>
        <h3>{editandoId ? "Modificar categoría" : "Nueva categoría"}</h3>

        <label>Nombre</label>
        <input name="nombre" value={form.nombre} onChange={cambiar} />
        {errores.nombre && <span className="error-campo">{errores.nombre}</span>}

        <label>Descripción</label>
        <input name="descripcion" value={form.descripcion} onChange={cambiar} />
        {errores.descripcion && <span className="error-campo">{errores.descripcion}</span>}

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
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.descripcion}</td>
              <td>
                <button onClick={() => editar(c)}>Editar</button>
                {usuario.rol === "admin" && (
                  <button className="peligro" onClick={() => eliminar(c.id)}>
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

export default Categorias;
