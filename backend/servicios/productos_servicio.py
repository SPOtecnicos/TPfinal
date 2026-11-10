from fastapi import HTTPException

import database

# Consulta con INNER JOIN para traer el nombre de la categoría
SQL_PRODUCTOS = """
    SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock,
           p.categoria_id, c.nombre AS categoria
    FROM productos p
    INNER JOIN categorias c ON p.categoria_id = c.id
"""


async def listar():
    return await database.traer_todos(SQL_PRODUCTOS + " ORDER BY p.nombre")


async def obtener(id):
    producto = await database.traer_uno(SQL_PRODUCTOS + " WHERE p.id = %s", (id,))
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


async def crear(datos):
    id_nuevo = await database.insertar(
        "INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES (%s, %s, %s, %s, %s)",
        (datos.nombre, datos.descripcion, datos.precio, datos.stock, datos.categoria_id),
    )
    return await obtener(id_nuevo)


async def actualizar(id, datos):
    filas = await database.ejecutar(
        "UPDATE productos SET nombre = %s, descripcion = %s, precio = %s, stock = %s, categoria_id = %s WHERE id = %s",
        (datos.nombre, datos.descripcion, datos.precio, datos.stock, datos.categoria_id, id),
    )
    if filas == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return await obtener(id)


async def eliminar(id):
    filas = await database.ejecutar("DELETE FROM productos WHERE id = %s", (id,))
    if filas == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
