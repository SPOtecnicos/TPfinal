import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import config
import database

esquema_bearer = HTTPBearer()


def encriptar_password(password):
    sal = os.urandom(16).hex()
    hash_pass = hashlib.pbkdf2_hmac("sha256", password.encode(), sal.encode(), 100000).hex()
    return sal + "$" + hash_pass


def verificar_password(password, guardado):
    sal, hash_guardado = guardado.split("$")
    hash_pass = hashlib.pbkdf2_hmac("sha256", password.encode(), sal.encode(), 100000).hex()
    return hmac.compare_digest(hash_pass, hash_guardado)


def crear_token(usuario):
    vencimiento = datetime.now(timezone.utc) + timedelta(minutes=config.MINUTOS_EXPIRACION)
    datos = {"sub": str(usuario["id"]), "rol": usuario["rol"], "exp": vencimiento}
    return jwt.encode(datos, config.CLAVE_SECRETA, algorithm=config.ALGORITMO)


# Se usa como dependencia en los endpoints que necesitan estar logueado
async def obtener_usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(esquema_bearer)):
    try:
        datos = jwt.decode(credenciales.credentials, config.CLAVE_SECRETA, algorithms=[config.ALGORITMO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido o vencido")

    usuario = await database.traer_uno(
        "SELECT id, nombre_usuario, rol FROM usuarios WHERE id = %s", (int(datos["sub"]),)
    )
    if not usuario:
        raise HTTPException(status_code=401, detail="El usuario no existe")
    return usuario


# Solo deja pasar a los usuarios con rol admin
async def solo_admin(usuario=Depends(obtener_usuario_actual)):
    if usuario["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Solo el administrador puede hacer esta acción")
    return usuario
