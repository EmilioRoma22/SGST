import re
from pydantic import BaseModel, Field, field_validator, EmailStr
from app.models.usuarios import UsuarioDTO
from datetime import datetime
from app.core.exceptions import ContrasenaDebilException, FormatoTelefonoInvalidoException

REGEX_TELEFONO = re.compile(r"^[\d\s+\-()]{8,20}$")

def _validar_fortaleza_password(value: str) -> str:
    if len(value) < 8:
        raise ContrasenaDebilException()
    if not any(c.isalpha() for c in value):
        raise ContrasenaDebilException()
    if not any(c.isdigit() for c in value):
        raise ContrasenaDebilException()
    return value

def _validar_formato_telefono(value: str) -> str:
    if not REGEX_TELEFONO.match(value.strip()):
        raise FormatoTelefonoInvalidoException()
    return value.strip()

class LoginDTO(BaseModel):
    correo_usuario: EmailStr
    password_usuario: str = Field(..., min_length=1)

class TokensDTO(BaseModel):
    access_token: str
    refresh_token: str
    
class LoginResponseDTO(BaseModel):
    usuario: UsuarioDTO
    tokens: TokensDTO

class RefreshTokenBdDTO(BaseModel):
    id_token: int
    id_usuario: int
    expira_en: datetime

class RegistroDTO(BaseModel):
    nombre_usuario: str = Field(..., max_length=100, min_length=1)
    apellidos_usuario: str = Field(..., max_length=150, min_length=1)
    correo_usuario: EmailStr
    telefono_usuario: str = Field(..., max_length=20, min_length=1)
    password_usuario: str = Field(..., min_length=1)
    confirmar_password_usuario: str = Field(..., min_length=1)

    @field_validator("password_usuario")
    @classmethod
    def password_fuerte(cls, v: str) -> str:
        return _validar_fortaleza_password(v)

    @field_validator("telefono_usuario")
    @classmethod
    def telefono_formato(cls, v: str) -> str:
        return _validar_formato_telefono(v)