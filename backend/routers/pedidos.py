from fastapi import APIRouter, Depends

from esquemas.esquemas import EstadoIn, PedidoIn
from seguridad import obtener_usuario_actual, solo_admin
from servicios import pedidos_servicio

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("")
async def listar_pedidos():
    return await pedidos_servicio.listar()


@router.get("/{id}")
async def obtener_pedido(id: int):
    return await pedidos_servicio.obtener(id)


@router.post("", status_code=201)
async def crear_pedido(datos: PedidoIn):
    return await pedidos_servicio.crear(datos)


@router.put("/{id}/estado")
async def cambiar_estado_pedido(id: int, datos: EstadoIn):
    return await pedidos_servicio.cambiar_estado(id, datos)


@router.delete("/{id}", status_code=204, dependencies=[Depends(solo_admin)])
async def eliminar_pedido(id: int):
    await pedidos_servicio.eliminar(id)
