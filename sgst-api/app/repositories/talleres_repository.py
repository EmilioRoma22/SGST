from typing import List
from app.repositories.base_repository import BaseRepository
from app.models.taller import TallerListaDTO
from app.constants.roles import Roles

class TalleresRepository(BaseRepository):
    table_name = "talleres"

    def obtener_id_empresa_por_taller(self, id_taller: int) -> int | None:
        query = f"""SELECT id_empresa FROM {self.table_name} 
                    WHERE id_taller = %s AND activo = 1"""
        self.execute(query, (id_taller,))
        resultado = self.cursor.fetchone()
        return resultado["id_empresa"] if resultado else None

    def listar_por_empresa(self, id_empresa: int) -> List[TallerListaDTO]:
        query = f"""SELECT id_taller, id_empresa, nombre_taller, telefono_taller,
                           correo_taller, direccion_taller, rfc_taller, ruta_logo
                    FROM {self.table_name}
                    WHERE id_empresa = %s AND activo = 1
                    ORDER BY nombre_taller"""
        self.execute(query, (id_empresa,))
        filas = self.cursor.fetchall()
        return [TallerListaDTO(**fila) for fila in filas]

    def existe_nombre_taller_en_empresa(self, id_empresa: int, nombre_taller: str) -> bool:
        query = f"""SELECT COUNT(*) as total FROM {self.table_name}
                    WHERE id_empresa = %s AND nombre_taller = %s AND activo = 1"""
        self.execute(query, (id_empresa, nombre_taller.strip()))
        return self.cursor.fetchone()["total"] > 0

    def obtener_por_id(self, id_taller: int, id_empresa: int) -> TallerListaDTO | None:
        query = f"""SELECT id_taller, id_empresa, nombre_taller, telefono_taller,
                           correo_taller, direccion_taller, rfc_taller, ruta_logo
                    FROM {self.table_name}
                    WHERE id_taller = %s AND id_empresa = %s AND activo = 1"""
        self.execute(query, (id_taller, id_empresa))
        fila = self.cursor.fetchone()
        return TallerListaDTO(**fila) if fila else None

class TalleresUsuariosRepository(BaseRepository):
    table_name = "usuarios_talleres"

    def añadir_usuario_admin_al_taller(self, id_usuario: int, id_taller: int) -> None:
        query = f"""INSERT INTO {self.table_name} (id_usuario, id_taller, rol_taller) VALUES (%s, %s, %s)"""
        self.execute(query, (id_usuario, id_taller, Roles.ADMIN))