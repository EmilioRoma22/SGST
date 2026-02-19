from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal

class LicenciaDTO(BaseModel):
    """Respuesta al listar licencias: sin id, precios como string."""
    nombre_licencia: str
    descripcion: str | None = None
    precio_mensual: str
    precio_anual: str
    max_talleres: int
    max_usuarios: int

class CrearSuscripcionDTO(BaseModel):
    """Se envía solo el precio; el backend busca la licencia por precio_mensual."""
    precio_mensual: str = Field(..., min_length=1)

class SuscripcionDTO(BaseModel):
    id_empresa: str
    fecha_inicio: date
    fecha_fin: date | None = None
    activa: bool

class SuscripcionConDetalleDTO(SuscripcionDTO):
    id_suscripcion: int
    id_empresa: str
    id_licencia: str
    fecha_inicio: date
    fecha_fin: date | None = None
    activa: bool

class VerificacionSuscripcionDTO(BaseModel):
    tiene_suscripcion: bool
    id_licencia: str | None = None
