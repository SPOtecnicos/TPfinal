const URL_BASE = "http://localhost:8000";

// Función para hacer los pedidos a la API (agrega el token si hay sesión)
export async function pedir(ruta, metodo = "GET", datos = null) {
  const token = localStorage.getItem("token");

  const opciones = {
    method: metodo,
    headers: { "Content-Type": "application/json" },
  };
  if (token) {
    opciones.headers["Authorization"] = "Bearer " + token;
  }
  if (datos) {
    opciones.body = JSON.stringify(datos);
  }

  const respuesta = await fetch(URL_BASE + ruta, opciones);

  // si el token venció se cierra la sesión
  if (respuesta.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.reload();
  }

  if (respuesta.status === 204) {
    return null;
  }

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    let mensaje = "Ocurrió un error";
    if (typeof resultado.detail === "string") {
      mensaje = resultado.detail;
    } else if (Array.isArray(resultado.detail)) {
      mensaje = resultado.detail.map((d) => d.msg).join(", ");
    }
    throw new Error(mensaje);
  }

  return resultado;
}
