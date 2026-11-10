from fastapi import HTTPException

import database
import seguridad


async def registrar(datos):
    existe = await database.traer_uno(
        "SELECT id FROM usuarios WHERE nombre_usuario = %s", (datos.nombre_usuario,)
    )
    if existe:
        raise HTTPException(status_code=409, detail="Ese nombre de usuario ya está en uso")

    password_hash = seguridad.encriptar_password(datos.password)
    id_nuevo = await database.insertar(
        "INSERT INTO usuarios (nombre_usuario, password_hash, rol) VALUES (%s, %s, 'empleado')",
        (datos.nombre_usuario, password_hash),
    )
    return {"id": id_nuevo, "nombre_usuario": datos.nombre_usuario, "rol": "empleado"}


async def iniciar_sesion(datos):
    usuario = await database.traer_uno(
        "SELECT id, nombre_usuario, password_hash, rol FROM usuarios WHERE nombre_usuario = %s",
        (datos.nombre_usuario,),
    )
    if not usuario or not seguridad.verificar_password(datos.password, usuario["password_hash"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    token = seguridad.crear_token(usuario)
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {"id": usuario["id"], "nombre_usuario": usuario["nombre_usuario"], "rol": usuario["rol"]},
    }
