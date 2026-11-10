import { useState, useEffect } from "react";
import { pedir } from "../api";
import { validarCliente } from "../utils/validaciones";

const formVacio = { nombre: "", apellido: "", email: "", telefono: "", direccion: "" };

function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function cargar() {
    try {
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

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    const erroresForm = validarCliente(form);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      return;
    }

    const datos = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
    };

    try {
      if (editandoId) {
        await pedir("/clientes/" + editandoId, "PUT", datos);
        mostrarMensaje("Cliente modificado", false);
      } else {
        await pedir("/clientes", "POST", datos);
        mostrarMensaje("Cliente creado", false);
      }
      cancelar();
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  function editar(cliente) {
    setEditandoId(cliente.id);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    });
    setErrores({});
  }

  function cancelar() {
    setEditandoId(null);
    setForm(formVacio);
    setErrores({});
  }

  async function eliminar(id) {
    if (!window.confirm("¿Seguro que querés eliminar el cliente?")) {
      return;
    }
    try {
      await pedir("/clientes/" + id, "DELETE");
      mostrarMensaje("Cliente eliminado", false);
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  return (
    <div>
      <h2>Clientes</h2>

      {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

      <form className="formulario" onSubmit={guardar}>
        <h3>{editandoId ? "Modificar cliente" : "Nuevo cliente"}</h3>

        <label>Nombre</label>
        <input name="nombre" value={form.nombre} onChange={cambiar} />
        {errores.nombre && <span className="error-campo">{errores.nombre}</span>}

        <label>Apellido</label>
        <input name="apellido" value={form.apellido} onChange={cambiar} />
        {errores.apellido && <span className="error-campo">{errores.apellido}</span>}

        <label>Email</label>
        <input name="email" value={form.email} onChange={cambiar} />
        {errores.email && <span className="error-campo">{errores.email}</span>}

        <label>Teléfono</label>
        <input name="telefono" value={form.telefono} onChange={cambiar} />
        {errores.telefono && <span className="error-campo">{errores.telefono}</span>}

        <label>Dirección</label>
        <input name="direccion" value={form.direccion} onChange={cambiar} />

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
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {c.nombre} {c.apellido}
              </td>
              <td>{c.email}</td>
              <td>{c.telefono}</td>
              <td>{c.direccion}</td>
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

export default Clientes;
