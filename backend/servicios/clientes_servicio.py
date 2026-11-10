from fastapi import HTTPException

import database


async def listar():
    return await database.traer_todos(
        "SELECT id, nombre, apellido, email, telefono, direccion FROM clientes ORDER BY apellido, nombre"
    )


async def obtener(id):
    cliente = await database.traer_uno(
        "SELECT id, nombre, apellido, email, telefono, direccion FROM clientes WHERE id = %s", (id,)
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


async def crear(datos):
    id_nuevo = await database.insertar(
        "INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES (%s, %s, %s, %s, %s)",
        (datos.nombre, datos.apellido, datos.email, datos.telefono, datos.direccion),
    )
    return await obtener(id_nuevo)


async def actualizar(id, datos):
    filas = await database.ejecutar(
        "UPDATE clientes SET nombre = %s, apellido = %s, email = %s, telefono = %s, direccion = %s WHERE id = %s",
        (datos.nombre, datos.apellido, datos.email, datos.telefono, datos.direccion, id),
    )
    if filas == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return await obtener(id)


async def eliminar(id):
    filas = await database.ejecutar("DELETE FROM clientes WHERE id = %s", (id,))
    if filas == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
