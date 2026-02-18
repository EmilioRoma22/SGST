from typing import List
from app.models.taller import CrearTallerDTO, TallerListaDTO
from app.models.usuarios import UsuarioDTO
from app.repositories.talleres_repository import TalleresRepository, TalleresUsuariosRepository
from app.core.exceptions import NoEsAdministradorException, NombreTallerRepetidoException

class TalleresService:
    def __init__(self, bd):
        self.bd = bd
        self.talleres_repository = TalleresRepository(self.bd)
        self.talleres_usuarios_repository = TalleresUsuariosRepository(self.bd)
        
    def listar_por_empresa(self, usuario: UsuarioDTO) -> List[TallerListaDTO]:
        if not usuario.id_empresa:
            raise NoEsAdministradorException()
        return self.talleres_repository.listar_por_empresa(usuario.id_empresa)

    def crear_taller(self, datos: CrearTallerDTO, usuario: UsuarioDTO) -> None:
        if not usuario.id_empresa:
            raise NoEsAdministradorException()

        if self.talleres_repository.existe_nombre_taller_en_empresa(usuario.id_empresa, datos.nombre_taller):
            raise NombreTallerRepetidoException()

        id_taller = self.talleres_repository.create(
            data={
                "id_empresa": usuario.id_empresa,
                "nombre_taller": datos.nombre_taller,
                "telefono_taller": datos.telefono_taller,
                "correo_taller": datos.correo_taller,
                "direccion_taller": datos.direccion_taller,
                "rfc_taller": datos.rfc_taller,
                "activo": 1,
            },
            returning="id_taller",
        )
        
        # Añadimos el usuario administrador al taller como rol ADMIN.
        self.talleres_usuarios_repository.añadir_usuario_admin_al_taller(usuario.id_usuario, id_taller)
