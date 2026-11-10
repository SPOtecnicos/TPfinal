import { useState, useEffect } from "react";
import { pedir } from "../api";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function cargar() {
    try {
      setUsuarios(await pedir("/usuarios"));
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

  async function eliminar(usuario) {
    if (!window.confirm("¿Seguro que querés eliminar al usuario " + usuario.nombre_usuario + "?")) {
      return;
    }
    try {
      await pedir("/usuarios/" + usuario.id, "DELETE");
      mostrarMensaje("Usuario eliminado", false);
      cargar();
    } catch (error) {
      mostrarMensaje(error.message, true);
    }
  }

  return (
    <div>
      <h2>Usuarios</h2>

      {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre_usuario}</td>
              <td>{u.rol}</td>
              <td>
                {u.rol === "empleado" && (
                  <button className="peligro" onClick={() => eliminar(u)}>
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

export default Usuarios;
