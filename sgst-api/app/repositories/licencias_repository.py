from typing import List
from app.repositories.base_repository import BaseRepository
from app.models.suscripcion import LicenciaDTO

class LicenciasRepository(BaseRepository):
    table_name = "licencias"

    def listar_licencias_activas(self) -> List[LicenciaDTO]:
        query = f"""SELECT id_licencia, nombre_licencia, descripcion, 
                           precio_mensual, precio_anual, max_talleres, max_usuarios
                    FROM {self.table_name} 
                    WHERE activo = 1"""
        self.execute(query, ())
        licencias = self.cursor.fetchall()
        return [LicenciaDTO(**lic) for lic in licencias]

    def obtener_licencia_por_id(self, id_licencia: int) -> LicenciaDTO | None:
        query = f"""SELECT id_licencia, nombre_licencia, descripcion, 
                           precio_mensual, precio_anual, max_talleres, max_usuarios
                    FROM {self.table_name} 
                    WHERE id_licencia = %s AND activo = 1"""
        self.execute(query, (id_licencia,))
        licencia = self.cursor.fetchone()
        return LicenciaDTO(**licencia) if licencia else None
