// Cada función devuelve un objeto con los errores encontrados
// Si el objeto está vacío, el formulario es válido

const regexEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validarLogin(datos, esRegistro) {
  const errores = {};
  if (datos.nombre_usuario.length < 3 || datos.nombre_usuario.length > 30) {
    errores.nombre_usuario = "El usuario debe tener entre 3 y 30 caracteres";
  } else if (!/^[A-Za-z0-9_]+$/.test(datos.nombre_usuario)) {
    errores.nombre_usuario = "Solo letras, números y guión bajo";
  }
  if (datos.password.length < 6) {
    errores.password = "La contraseña debe tener al menos 6 caracteres";
  }
  if (esRegistro && datos.password !== datos.repetir) {
    errores.repetir = "Las contraseñas no coinciden";
  }
  return errores;
}

export function validarCategoria(datos) {
  const errores = {};
  if (datos.nombre.trim().length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres";
  }
  if (datos.descripcion.length > 200) {
    errores.descripcion = "La descripción no puede superar los 200 caracteres";
  }
  return errores;
}

export function validarProducto(datos) {
  const errores = {};
  if (datos.nombre.trim().length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres";
  }
  if (datos.precio === "" || isNaN(datos.precio) || Number(datos.precio) <= 0) {
    errores.precio = "El precio debe ser un número mayor a 0";
  }
  if (datos.stock === "" || !Number.isInteger(Number(datos.stock)) || Number(datos.stock) < 0) {
    errores.stock = "El stock debe ser un número entero mayor o igual a 0";
  }
  if (!datos.categoria_id) {
    errores.categoria_id = "Seleccioná una categoría";
  }
  return errores;
}

export function validarCliente(datos) {
  const errores = {};
  if (datos.nombre.trim().length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres";
  }
  if (datos.apellido.trim().length < 2) {
    errores.apellido = "El apellido debe tener al menos 2 caracteres";
  }
  if (!regexEmail.test(datos.email.trim())) {
    errores.email = "El email no es válido";
  }
  if (datos.telefono && !/^[0-9+\- ]+$/.test(datos.telefono)) {
    errores.telefono = "El teléfono solo puede tener números, + y -";
  }
  return errores;
}
