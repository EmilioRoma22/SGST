from pydantic import BaseModel

class UsuarioDTO(BaseModel):
    id_usuario: str
    id_empresa: str | None
    nombre_usuario: str
    apellidos_usuario: str
    correo_usuario: str
    telefono_usuario: str
    hash_password: str
    activo: bool