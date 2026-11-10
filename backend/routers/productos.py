from fastapi import APIRouter, Depends

from esquemas.esquemas import ProductoIn
from seguridad import obtener_usuario_actual, solo_admin
from servicios import productos_servicio

router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("")
async def listar_productos():
    return await productos_servicio.listar()


@router.get("/{id}")
async def obtener_producto(id: int):
    return await productos_servicio.obtener(id)


@router.post("", status_code=201)
async def crear_producto(datos: ProductoIn):
    return await productos_servicio.crear(datos)


@router.put("/{id}")
async def actualizar_producto(id: int, datos: ProductoIn):
    return await productos_servicio.actualizar(id, datos)


@router.delete("/{id}", status_code=204, dependencies=[Depends(solo_admin)])
async def eliminar_producto(id: int):
    await productos_servicio.eliminar(id)
