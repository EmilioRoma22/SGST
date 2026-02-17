from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal

class LicenciaDTO(BaseModel):
    id_licencia: int
    nombre_licencia: str
    descripcion: str | None = None
    precio_mensual: Decimal
    precio_anual: Decimal
    max_talleres: int
    max_usuarios: int

class CrearSuscripcionDTO(BaseModel):
    id_licencia: int = Field(..., gt=0)

class SuscripcionDTO(BaseModel):
    id_suscripcion: int
    id_empresa: int
    id_licencia: int
    fecha_inicio: date
    fecha_fin: date | None = None
    activa: bool

class VerificacionSuscripcionDTO(BaseModel):
    tiene_suscripcion: bool
    suscripcion: SuscripcionDTO | None = None
    licencia: LicenciaDTO | None = None
