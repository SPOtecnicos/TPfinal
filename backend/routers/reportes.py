from fastapi import APIRouter, Depends

from seguridad import obtener_usuario_actual
from servicios import reportes_servicio

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"],
    dependencies=[Depends(obtener_usuario_actual)],
)


@router.get("/resumen")
async def resumen():
    return await reportes_servicio.resumen()


@router.get("/ventas-por-categoria")
async def ventas_por_categoria():
    return await reportes_servicio.ventas_por_categoria()


@router.get("/productos-mas-vendidos")
async def productos_mas_vendidos():
    return await reportes_servicio.productos_mas_vendidos()


@router.get("/clientes-destacados")
async def clientes_destacados():
    return await reportes_servicio.clientes_destacados()


@router.get("/productos-sin-ventas")
async def productos_sin_ventas():
    return await reportes_servicio.productos_sin_ventas()
