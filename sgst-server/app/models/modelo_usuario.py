from pydantic import BaseModel

class RegistroUsuario(BaseModel):
    nombre_usuario: str
    apellidos_usuario: str
    correo_usuario: str
    telefono_usuario: str
    password_usuario: str
    confirmar_password_usuario: str
    
class LoginUsuario(BaseModel):
    correo_usuario: str
    password_usuario: str