from fastapi import APIRouter, Depends

from esquemas.esquemas import ClienteIn
from seguridad import obtener_usuario_actual, solo_admin
from servicios import clientes_servicio

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("")
async def listar_clientes():
    return await clientes_servicio.listar()


@router.get("/{id}")
async def obtener_cliente(id: int):
    return await clientes_servicio.obtener(id)


@router.post("", status_code=201)
async def crear_cliente(datos: ClienteIn):
    return await clientes_servicio.crear(datos)


@router.put("/{id}")
async def actualizar_cliente(id: int, datos: ClienteIn):
    return await clientes_servicio.actualizar(id, datos)


@router.delete("/{id}", status_code=204, dependencies=[Depends(solo_admin)])
async def eliminar_cliente(id: int):
    await clientes_servicio.eliminar(id)
