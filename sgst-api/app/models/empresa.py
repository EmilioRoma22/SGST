import re
from pydantic import BaseModel, Field, field_validator
from app.core.exceptions import FormatoTelefonoInvalidoException

REGEX_TELEFONO = re.compile(r"^[\d\s+\-()]{8,20}$")

class CrearEmpresaDTO(BaseModel):
    nombre_empresa: str = Field(..., max_length=150, min_length=1)
    rfc_empresa: str | None = Field(None, max_length=20)
    telefono_empresa: str | None = Field(None, max_length=20)
    correo_empresa: str | None = Field(None, max_length=150)
    direccion_empresa: str | None = Field(None, max_length=255)

    @field_validator("telefono_empresa")
    @classmethod
    def telefono_formato(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        if not REGEX_TELEFONO.match(v.strip()):
            raise FormatoTelefonoInvalidoException()
        return v.strip()

class EmpresaDTO(BaseModel):
    id_empresa: int
    id_creador: int
    nombre_empresa: str
    rfc_empresa: str | None = None
    telefono_empresa: str | None = None
    correo_empresa: str | None = None
    direccion_empresa: str | None = None
    activo: bool
