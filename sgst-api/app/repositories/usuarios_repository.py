from app.repositories.base_repository import BaseRepository
from app.models.usuarios import UsuarioDTO

class UsuariosRepository(BaseRepository):
    table_name = "usuarios"
    searchable_fields = ["nombre_usuario", "apellidos_usuario", "correo_usuario"]

    def obtener_usuario_por_correo(self, correo_usuario: str) -> UsuarioDTO | None:
        query = f"""SELECT 
                        id_usuario,
                        id_empresa,
                        nombre_usuario,
                        apellidos_usuario,
                        correo_usuario,
                        telefono_usuario,
                        hash_password,
                        activo
                    FROM {self.table_name} 
                    WHERE correo_usuario = %s
                    AND activo = 1"""
        self.cursor.execute(query, (correo_usuario,))
        usuario = self.cursor.fetchone()
        return UsuarioDTO(**usuario) if usuario else None

    def obtener_usuario_por_id(self, id_usuario: str) -> UsuarioDTO | None:
        query = f"""SELECT 
                        id_usuario,
                        id_empresa,
                        nombre_usuario,
                        apellidos_usuario,
                        correo_usuario,
                        telefono_usuario,
                        hash_password,
                        activo
                    FROM {self.table_name} 
                    WHERE id_usuario = %s
                    AND activo = 1"""
        self.cursor.execute(query, (id_usuario,))
        usuario = self.cursor.fetchone()
        
        return UsuarioDTO(**usuario) if usuario else None
    
    def hay_correo_repetido(self, correo_usuario: str) -> bool:
        query = f"""SELECT COUNT(*) as total FROM {self.table_name} WHERE correo_usuario = %s AND activo = 1"""
        self.execute(query, (correo_usuario,))
        
        return self.cursor.fetchone()["total"] > 0

    def hay_telefono_repetido(self, telefono_usuario: str) -> bool:
        query = f"""SELECT COUNT(*) as total FROM {self.table_name} WHERE telefono_usuario = %s AND activo = 1"""
        self.execute(query, (telefono_usuario,))
        
        return self.cursor.fetchone()["total"] > 0

    def actualizar_id_empresa(self, id_usuario: str, id_empresa: str) -> None:
        self.update(
            id_value=id_usuario,
            id_column="id_usuario",
            data={"id_empresa": id_empresa}
        )