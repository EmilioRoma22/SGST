from app.repositories.base_repository import BaseRepository
from app.models.suscripcion import SuscripcionConDetalleDTO

class SuscripcionesRepository(BaseRepository):
    table_name = "suscripciones"

    def obtener_suscripcion_activa_por_empresa(self, id_empresa: str) -> SuscripcionConDetalleDTO | None:
        query = f"""SELECT id_suscripcion, id_empresa, id_licencia, fecha_inicio, fecha_fin, activa
                    FROM {self.table_name} 
                    WHERE id_empresa = %s AND activa = 1 
                    LIMIT 1"""
        self.execute(query, (id_empresa,))
        suscripcion = self.cursor.fetchone()
        return SuscripcionConDetalleDTO(**suscripcion) if suscripcion else None
    
    def obtener_max_talleres_por_suscripcion(self, id_empresa: str) -> int:
        query = f"""SELECT max_talleres FROM licencias 
                    WHERE id_licencia = (SELECT id_licencia FROM {self.table_name} 
                    WHERE id_empresa = %s AND activa = 1 
                    LIMIT 1)"""
        self.execute(query, (id_empresa,))
        resultado = self.cursor.fetchone()
        
        return resultado["max_talleres"] if resultado else 0