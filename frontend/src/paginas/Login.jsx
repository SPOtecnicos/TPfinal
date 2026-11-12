import { useState } from "react";
import { pedir } from "../api";
import { validarLogin } from "../utils/validaciones";

function Login({ onLogin }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [form, setForm] = useState({ nombre_usuario: "", password: "", repetir: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    const erroresForm = validarLogin(form, esRegistro);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) {
      return;
    }

    const datos = { nombre_usuario: form.nombre_usuario, password: form.password };

    try {
      if (esRegistro) {
        await pedir("/auth/registro", "POST", datos);
        setEsRegistro(false);
        setEsError(false);
        setMensaje("Usuario creado, ya podés iniciar sesión");
      } else {
        const respuesta = await pedir("/auth/login", "POST", datos);
        localStorage.setItem("token", respuesta.access_token);
        localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
        onLogin(respuesta.usuario);
      }
    } catch (error) {
      setEsError(true);
      setMensaje(error.message);
    }
  }

  return (
    <div className="login">
      <form className="tarjeta" onSubmit={enviar}>
        <h1 className="logo">Ecommerce</h1>
        <h2>{esRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>

        {mensaje && <p className={esError ? "mensaje error" : "mensaje ok"}>{mensaje}</p>}

        <label>Usuario</label>
        <input name="nombre_usuario" value={form.nombre_usuario} onChange={cambiar} />
        {errores.nombre_usuario && <span className="error-campo">{errores.nombre_usuario}</span>}

        <label>Contraseña</label>
        <input type="password" name="password" value={form.password} onChange={cambiar} />
        {errores.password && <span className="error-campo">{errores.password}</span>}

        {esRegistro && (
          <>
            <label>Repetir contraseña</label>
            <input type="password" name="repetir" value={form.repetir} onChange={cambiar} />
            {errores.repetir && <span className="error-campo">{errores.repetir}</span>}
          </>
        )}

        <button type="submit">{esRegistro ? "Registrarme" : "Entrar"}</button>

        <p className="cambio">
          {esRegistro ? "¿Ya tenés cuenta? " : "¿No tenés cuenta? "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setEsRegistro(!esRegistro);
              setErrores({});
              setMensaje("");
            }}
          >
            {esRegistro ? "Iniciar sesión" : "Registrarse"}
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
