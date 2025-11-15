from pydantic import BaseModel

class DatosCrearEmpresa(BaseModel):
    nombre_empresa: str
    correo_empresa: str
    direccion_empresa: str
    rfc_empresa: str
    telefono_empresa: str