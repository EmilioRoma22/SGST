from pydantic import BaseModel

class DataCrearCliente(BaseModel):
    id_taller: int
    nombre_cliente: str
    apellidos_cliente: str
    correo_cliente: str
    telefono_cliente: str
    direccion_cliente: str
    notas_cliente: str