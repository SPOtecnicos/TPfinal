import database


async def resumen():
    # Usa subconsultas para contar cada cosa
    return await database.traer_uno(
        """
        SELECT
            (SELECT COUNT(*) FROM productos) AS total_productos,
            (SELECT COUNT(*) FROM clientes) AS total_clientes,
            (SELECT COUNT(*) FROM pedidos) AS total_pedidos,
            (SELECT COALESCE(SUM(total), 0) FROM pedidos) AS total_ventas,
            (SELECT COUNT(*) FROM productos WHERE stock < 5) AS productos_stock_bajo
        """
    )


# INNER JOIN + GROUP BY
async def ventas_por_categoria():
    return await database.traer_todos(
        """
        SELECT c.nombre AS categoria,
               COUNT(DISTINCT d.pedido_id) AS cantidad_pedidos,
               SUM(d.cantidad) AS unidades_vendidas,
               SUM(d.cantidad * d.precio_unitario) AS total_vendido
        FROM categorias c
        INNER JOIN productos p ON p.categoria_id = c.id
        INNER JOIN detalle_pedido d ON d.producto_id = p.id
        GROUP BY c.id, c.nombre
        ORDER BY total_vendido DESC
        """
    )


# INNER JOIN + GROUP BY
async def productos_mas_vendidos():
    return await database.traer_todos(
        """
        SELECT p.nombre AS producto,
               c.nombre AS categoria,
               SUM(d.cantidad) AS unidades_vendidas,
               SUM(d.cantidad * d.precio_unitario) AS total_vendido
        FROM detalle_pedido d
        INNER JOIN productos p ON d.producto_id = p.id
        INNER JOIN categorias c ON p.categoria_id = c.id
        GROUP BY p.id, p.nombre, c.nombre
        ORDER BY unidades_vendidas DESC
        LIMIT 10
        """
    )


# INNER JOIN + GROUP BY + subconsulta (clientes que gastaron más que el promedio)
async def clientes_destacados():
    return await database.traer_todos(
        """
        SELECT CONCAT(c.nombre, ' ', c.apellido) AS cliente,
               c.email,
               COUNT(p.id) AS cantidad_pedidos,
               SUM(p.total) AS total_gastado
        FROM clientes c
        INNER JOIN pedidos p ON p.cliente_id = c.id
        GROUP BY c.id, c.nombre, c.apellido, c.email
        HAVING SUM(p.total) > (
            SELECT AVG(t.gasto)
            FROM (SELECT SUM(total) AS gasto FROM pedidos GROUP BY cliente_id) t
        )
        ORDER BY total_gastado DESC
        """
    )


# Subconsulta (productos que nunca se vendieron)
async def productos_sin_ventas():
    return await database.traer_todos(
        """
        SELECT p.nombre AS producto, c.nombre AS categoria, p.precio, p.stock
        FROM productos p
        INNER JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id NOT IN (SELECT producto_id FROM detalle_pedido)
        ORDER BY p.nombre
        """
    )
