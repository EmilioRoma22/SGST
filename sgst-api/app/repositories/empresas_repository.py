from app.repositories.base_repository import BaseRepository
from app.models.empresa import EmpresaDTO

class EmpresasRepository(BaseRepository):
    table_name = "empresas"

    def obtener_empresa_por_id(self, id_empresa: str) -> EmpresaDTO | None:
        query = f"""SELECT id_empresa, id_creador, nombre_empresa, rfc_empresa, 
                           telefono_empresa, correo_empresa, direccion_empresa, activo
                    FROM {self.table_name} 
                    WHERE id_empresa = %s AND activo = 1"""
        self.execute(query, (id_empresa,))
        empresa = self.cursor.fetchone()
        return EmpresaDTO(**empresa) if empresa else None
