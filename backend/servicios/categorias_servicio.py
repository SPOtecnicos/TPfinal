from fastapi import HTTPException

import database


async def listar():
    return await database.traer_todos("SELECT id, nombre, descripcion FROM categorias ORDER BY nombre")


async def obtener(id):
    categoria = await database.traer_uno(
        "SELECT id, nombre, descripcion FROM categorias WHERE id = %s", (id,)
    )
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


async def crear(datos):
    id_nuevo = await database.insertar(
        "INSERT INTO categorias (nombre, descripcion) VALUES (%s, %s)",
        (datos.nombre, datos.descripcion),
    )
    return await obtener(id_nuevo)


async def actualizar(id, datos):
    filas = await database.ejecutar(
        "UPDATE categorias SET nombre = %s, descripcion = %s WHERE id = %s",
        (datos.nombre, datos.descripcion, id),
    )
    if filas == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return await obtener(id)


async def eliminar(id):
    filas = await database.ejecutar("DELETE FROM categorias WHERE id = %s", (id,))
    if filas == 0:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
