import aiomysql
from pymysql.constants import CLIENT
import config

pool = None


async def iniciar_pool():
    global pool
    pool = await aiomysql.create_pool(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USUARIO,
        password=config.DB_PASSWORD,
        db=config.DB_NOMBRE,
        autocommit=True,
        cursorclass=aiomysql.DictCursor,
        client_flag=CLIENT.FOUND_ROWS,
        minsize=1,
        maxsize=10,
    )


async def cerrar_pool():
    pool.close()
    await pool.wait_closed()


# Devuelve todas las filas de un SELECT
async def traer_todos(sql, params=None):
    async with pool.acquire() as conexion:
        async with conexion.cursor() as cursor:
            await cursor.execute(sql, params)
            return await cursor.fetchall()


# Devuelve solo una fila (o None si no hay)
async def traer_uno(sql, params=None):
    async with pool.acquire() as conexion:
        async with conexion.cursor() as cursor:
            await cursor.execute(sql, params)
            return await cursor.fetchone()


# Para INSERT: devuelve el id generado
async def insertar(sql, params=None):
    async with pool.acquire() as conexion:
        async with conexion.cursor() as cursor:
            await cursor.execute(sql, params)
            return cursor.lastrowid


# Para UPDATE y DELETE: devuelve la cantidad de filas encontradas
async def ejecutar(sql, params=None):
    async with pool.acquire() as conexion:
        async with conexion.cursor() as cursor:
            await cursor.execute(sql, params)
            return cursor.rowcount
