from fastapi import HTTPException

import database


async def listar():
    return await database.traer_todos(
        "SELECT id, nombre_usuario, rol FROM usuarios ORDER BY rol, nombre_usuario"
    )


# Solo se pueden eliminar usuarios con rol empleado
async def eliminar(id):
    usuario = await database.traer_uno("SELECT id, rol FROM usuarios WHERE id = %s", (id,))
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario["rol"] != "empleado":
        raise HTTPException(status_code=400, detail="Solo se pueden eliminar usuarios con rol empleado")

    await database.ejecutar("DELETE FROM usuarios WHERE id = %s", (id,))
