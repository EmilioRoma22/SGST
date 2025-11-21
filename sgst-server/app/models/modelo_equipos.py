from pydantic import BaseModel

class DataCrearEquipoTaller(BaseModel):
    id_taller: int
    id_tipo: int
    num_serie: str
    marca_equipo: str
    modelo_equipo: str
    descripcion_equipo: str