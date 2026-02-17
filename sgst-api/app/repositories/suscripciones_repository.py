from app.repositories.base_repository import BaseRepository
from app.models.suscripcion import SuscripcionDTO

class SuscripcionesRepository(BaseRepository):
    table_name = "suscripciones"

    def obtener_suscripcion_activa_por_empresa(self, id_empresa: int) -> SuscripcionDTO | None:
        query = f"""SELECT id_suscripcion, id_empresa, id_licencia, fecha_inicio, fecha_fin, activa
                    FROM {self.table_name} 
                    WHERE id_empresa = %s AND activa = 1 
                    LIMIT 1"""
        self.execute(query, (id_empresa,))
        suscripcion = self.cursor.fetchone()
        return SuscripcionDTO(**suscripcion) if suscripcion else None
