from pydantic import BaseModel

class DataCrearOrden(BaseModel):
    id_taller: int
    id_cliente: int
    id_equipo: int
    accesorios: str
    falla: str
    diagnostico_inicial: str
    solucion_aplicada: str
    id_prioridad: int
    tecnico_asignado: int
    fecha_estimada_de_fin: str
    id_estado: int
    costo_total: float
    meses_garantia: int
    fecha_fin_garantia: str
    es_por_garantia: int
    id_orden_origen: int