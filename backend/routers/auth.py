from fastapi import APIRouter, Depends

import seguridad
from esquemas.esquemas import UsuarioIn
from servicios import auth_servicio

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/registro", status_code=201)
async def registro(datos: UsuarioIn):
    return await auth_servicio.registrar(datos)


@router.post("/login")
async def login(datos: UsuarioIn):
    return await auth_servicio.iniciar_sesion(datos)


@router.get("/me")
async def datos_usuario(usuario=Depends(seguridad.obtener_usuario_actual)):
    return usuario
