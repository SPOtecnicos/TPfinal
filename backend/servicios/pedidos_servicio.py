import json

from aiomysql import MySQLError
from fastapi import HTTPException

import database

# Consulta con INNER JOIN para traer el nombre del cliente
SQL_PEDIDOS = """
    SELECT p.id, p.fecha, p.estado, p.total, p.cliente_id,
           CONCAT(c.nombre, ' ', c.apellido) AS cliente,
           c.email AS cliente_email, c.direccion AS cliente_direccion
    FROM pedidos p
    INNER JOIN clientes c ON p.cliente_id = c.id
"""


async def listar():
    return await database.traer_todos(SQL_PEDIDOS + " ORDER BY p.fecha DESC, p.id DESC")


async def obtener(id):
    pedido = await database.traer_uno(SQL_PEDIDOS + " WHERE p.id = %s", (id,))
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    items = await database.traer_todos(
        """
        SELECT d.producto_id, pr.nombre AS producto, d.cantidad, d.precio_unitario,
               (d.cantidad * d.precio_unitario) AS subtotal
        FROM detalle_pedido d
        INNER JOIN productos pr ON d.producto_id = pr.id
        WHERE d.pedido_id = %s
        """,
        (id,),
    )
    pedido["items"] = items
    return pedido


# Llama al procedimiento almacenado que hace todo en una transacción
async def crear(datos):
    items = [{"producto_id": i.producto_id, "cantidad": i.cantidad} for i in datos.items]
    try:
        async with database.pool.acquire() as conexion:
            async with conexion.cursor() as cursor:
                await cursor.execute("CALL sp_crear_pedido(%s, %s)", (datos.cliente_id, json.dumps(items)))
                fila = await cursor.fetchone()
    except MySQLError as error:
        # el mensaje viene del SIGNAL del procedimiento
        raise HTTPException(status_code=400, detail=str(error.args[1]))

    return await obtener(fila["pedido_id"])


async def cambiar_estado(id, datos):
    filas = await database.ejecutar("UPDATE pedidos SET estado = %s WHERE id = %s", (datos.estado, id))
    if filas == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return await obtener(id)


# Al eliminar un pedido se devuelve el stock de los productos
async def eliminar(id):
    async with database.pool.acquire() as conexion:
        await conexion.begin()
        try:
            async with conexion.cursor() as cursor:
                await cursor.execute(
                    """
                    UPDATE productos
                    SET stock = stock + (
                        SELECT SUM(d.cantidad) FROM detalle_pedido d
                        WHERE d.pedido_id = %s AND d.producto_id = productos.id
                    )
                    WHERE id IN (SELECT producto_id FROM detalle_pedido WHERE pedido_id = %s)
                    """,
                    (id, id),
                )
                await cursor.execute("DELETE FROM pedidos WHERE id = %s", (id,))
                filas = cursor.rowcount
            await conexion.commit()
        except Exception:
            await conexion.rollback()
            raise

    if filas == 0:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
