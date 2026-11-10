from fastapi import APIRouter, Depends

from seguridad import solo_admin
from servicios import usuarios_servicio

# Todo este router es solo para el administrador
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
    dependencies=[Depends(solo_admin)],
)


@router.get("")
async def listar_usuarios():
    return await usuarios_servicio.listar()


@router.delete("/{id}", status_code=204)
async def eliminar_usuario(id: int):
    await usuarios_servicio.eliminar(id)
