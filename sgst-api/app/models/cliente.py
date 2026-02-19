import re
from pydantic import BaseModel, Field, field_validator
from app.core.exceptions import FormatoTelefonoInvalidoException, FormatoCorreoInvalidoException
from datetime import datetime

REGEX_TELEFONO = re.compile(r"^[\d\s+\-()]{8,20}$")
REGEX_CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class CrearClienteDTO(BaseModel):
    nombre_cliente: str = Field(..., max_length=100, min_length=1)
    apellidos_cliente: str = Field(..., max_length=100, min_length=1)
    correo_cliente: str | None = Field(None, max_length=150)
    telefono_cliente: str | None = Field(None, max_length=20)
    direccion_cliente: str | None = Field(None, max_length=255)
    notas_cliente: str | None = None

    @field_validator("correo_cliente")
    @classmethod
    def correo_formato(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not REGEX_CORREO.match(v):
            raise FormatoCorreoInvalidoException()
        return v

    @field_validator("telefono_cliente")
    @classmethod
    def telefono_formato(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not REGEX_TELEFONO.match(v):
            raise FormatoTelefonoInvalidoException()
        return v

    @field_validator("nombre_cliente")
    @classmethod
    def nombre_trim(cls, v: str) -> str:
        return v.strip() if v else v

    @field_validator("apellidos_cliente")
    @classmethod
    def apellidos_trim(cls, v: str) -> str:
        return v.strip() if v else v

    @field_validator("direccion_cliente")
    @classmethod
    def direccion_trim(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("notas_cliente")
    @classmethod
    def notas_trim(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v.strip() if isinstance(v, str) else v

class ActualizarClienteDTO(BaseModel):
    nombre_cliente: str | None = Field(None, max_length=100, min_length=1)
    apellidos_cliente: str | None = Field(None, max_length=100, min_length=1)
    correo_cliente: str | None = Field(None, max_length=150)
    telefono_cliente: str | None = Field(None, max_length=20)
    direccion_cliente: str | None = Field(None, max_length=255)
    notas_cliente: str | None = None

    @field_validator("correo_cliente")
    @classmethod
    def correo_formato(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not REGEX_CORREO.match(v):
            raise FormatoCorreoInvalidoException()
        return v

    @field_validator("telefono_cliente")
    @classmethod
    def telefono_formato(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not REGEX_TELEFONO.match(v):
            raise FormatoTelefonoInvalidoException()
        return v

    @field_validator("nombre_cliente")
    @classmethod
    def nombre_trim(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("apellidos_cliente")
    @classmethod
    def apellidos_trim(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("direccion_cliente")
    @classmethod
    def direccion_trim(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("notas_cliente")
    @classmethod
    def notas_trim(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v.strip() if isinstance(v, str) else v

class ClienteDTO(BaseModel):
    id_cliente: int
    id_taller: str
    nombre_cliente: str
    apellidos_cliente: str
    correo_cliente: str | None = None
    telefono_cliente: str | None = None
    direccion_cliente: str | None = None
    notas_cliente: str | None = None
    fecha_creacion: datetime
    ultima_actualizacion: datetime | None = None

class ClienteListaDTO(BaseModel):
    id_cliente: int
    nombre_cliente: str
    apellidos_cliente: str
    correo_cliente: str | None = None
    telefono_cliente: str | None = None
