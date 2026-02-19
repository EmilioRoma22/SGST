from app.repositories.base_repository import BaseRepository
from app.models.taller import TallerRolDTO

class UsuariosTalleresRepository(BaseRepository):
    table_name = "usuarios_talleres"
    
    def el_usuario_pertenece_al_taller(self, id_usuario: str, id_taller: str) -> bool:
        query = f"""SELECT COUNT(*) as total FROM {self.table_name} WHERE id_usuario = %s AND id_taller = %s AND activo = 1"""
        self.execute(query, (id_usuario, id_taller))
        resultado = self.cursor.fetchone()
        return (resultado["total"] > 0) if resultado else False

    def obtener_rol_y_taller_por_id_usuario(self, id_usuario: str) -> TallerRolDTO | None:
        query = f"""SELECT rol_taller, id_taller FROM {self.table_name} WHERE id_usuario = %s AND activo = 1"""
        self.execute(query, (id_usuario,))
        rol_y_taller = self.cursor.fetchone()
        
        return TallerRolDTO(**rol_y_taller) if rol_y_taller else None

    def obtener_rol_por_usuario_y_taller(self, id_usuario: str, id_taller: str) -> TallerRolDTO | None:
        query = f"""SELECT rol_taller, id_taller FROM {self.table_name} 
                    WHERE id_usuario = %s AND id_taller = %s AND activo = 1"""
        self.execute(query, (id_usuario, id_taller))
        resultado = self.cursor.fetchone()
        return TallerRolDTO(**resultado) if resultado else None