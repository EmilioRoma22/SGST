import re
from pydantic import BaseModel, Field, field_validator
from app.core.exceptions import FormatoTelefonoInvalidoException, FormatoCorreoInvalidoException

REGEX_TELEFONO = re.compile(r"^[\d\s+\-()]{8,20}$")
REGEX_CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class CrearTallerDTO(BaseModel):
    nombre_taller: str = Field(..., max_length=150, min_length=1)
    telefono_taller: str | None = Field(None, max_length=20)
    correo_taller: str | None = Field(None, max_length=150)
    direccion_taller: str | None = Field(None, max_length=255)
    rfc_taller: str | None = Field(None, max_length=20)

    @field_validator("telefono_taller")
    @classmethod
    def telefono_formato(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not REGEX_TELEFONO.match(v):
            raise FormatoTelefonoInvalidoException()
        return v

    @field_validator("correo_taller")
    @classmethod
    def correo_formato(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not REGEX_CORREO.match(v):
            raise FormatoCorreoInvalidoException()
        return v

    @field_validator("nombre_taller")
    @classmethod
    def nombre_trim(cls, v: str) -> str:
        return v.strip() if v else v

class TallerDTO(BaseModel):
    id_taller: str
    rol_taller: str

class TallerRolDTO(BaseModel):
    rol_taller: str
    id_taller: str

class TallerListaDTO(BaseModel):
    id_taller: str
    id_empresa: str
    nombre_taller: str
    telefono_taller: str | None = None
    correo_taller: str | None = None
    direccion_taller: str | None = None
    rfc_taller: str | None = None
    ruta_logo: str | None = None


class ElegirTallerDTO(BaseModel):
    id_taller: str