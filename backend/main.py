from contextlib import asynccontextmanager

from aiomysql import IntegrityError
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import database
from routers import auth, categorias, clientes, pedidos, productos, reportes, usuarios


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.iniciar_pool()
    yield
    await database.cerrar_pool()


app = FastAPI(title="API Ecommerce", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Errores de claves únicas y claves foráneas de MySQL
@app.exception_handler(IntegrityError)
async def error_integridad(request, error):
    codigo = error.args[0]
    if codigo == 1062:
        mensaje = "Ya existe un registro con ese dato"
    elif codigo == 1451:
        mensaje = "No se puede eliminar porque tiene registros relacionados"
    elif codigo == 1452:
        mensaje = "El registro relacionado no existe"
    else:
        mensaje = "Error de integridad en los datos"
    return JSONResponse(status_code=409, content={"detail": mensaje})


app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(clientes.router)
app.include_router(pedidos.router)
app.include_router(reportes.router)
app.include_router(usuarios.router)
