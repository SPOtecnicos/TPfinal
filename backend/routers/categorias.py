from fastapi import APIRouter, Depends

from esquemas.esquemas import CategoriaIn
from seguridad import obtener_usuario_actual, solo_admin
from servicios import categorias_servicio

router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("")
async def listar_categorias():
    return await categorias_servicio.listar()


@router.get("/{id}")
async def obtener_categoria(id: int):
    return await categorias_servicio.obtener(id)


@router.post("", status_code=201)
async def crear_categoria(datos: CategoriaIn):
    return await categorias_servicio.crear(datos)


@router.put("/{id}")
async def actualizar_categoria(id: int, datos: CategoriaIn):
    return await categorias_servicio.actualizar(id, datos)


@router.delete("/{id}", status_code=204, dependencies=[Depends(solo_admin)])
async def eliminar_categoria(id: int):
    await categorias_servicio.eliminar(id)
