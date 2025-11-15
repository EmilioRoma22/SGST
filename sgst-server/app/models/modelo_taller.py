from pydantic import BaseModel

class CrearTaller(BaseModel):
    nombre_taller: str
    telefono_taller: str
    correo_taller: str
    direccion_taller: str
    rfc_taller: str