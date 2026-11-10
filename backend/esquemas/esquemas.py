from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class UsuarioIn(BaseModel):
    nombre_usuario: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_]+$")
    password: str = Field(min_length=6, max_length=50)


class CategoriaIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=50)
    descripcion: Optional[str] = Field(default=None, max_length=200)


class ProductoIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    precio: float = Field(gt=0)
    stock: int = Field(ge=0)
    categoria_id: int = Field(gt=0)


class ClienteIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=50)
    apellido: str = Field(min_length=2, max_length=50)
    email: str = Field(max_length=100, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    telefono: Optional[str] = Field(default=None, max_length=20, pattern=r"^[0-9+\- ]*$")
    direccion: Optional[str] = Field(default=None, max_length=150)


class ItemPedido(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)


class PedidoIn(BaseModel):
    cliente_id: int = Field(gt=0)
    items: List[ItemPedido] = Field(min_length=1)


class EstadoIn(BaseModel):
    estado: Literal["pendiente", "pagado", "enviado", "entregado"]
