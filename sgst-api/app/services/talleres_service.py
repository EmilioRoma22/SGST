from typing import List
from app.models.taller import CrearTallerDTO, TallerListaDTO
from app.models.usuarios import UsuarioDTO
from app.repositories.talleres_repository import TalleresRepository, TalleresUsuariosRepository
from app.core.exceptions import EmpresaSinSuscripcionException, EmpresaYaTieneMaxTalleresException, NoEsAdministradorException, NombreTallerRepetidoException
from app.repositories.suscripciones_repository import SuscripcionesRepository
import uuid

class TalleresService:
    def __init__(self, bd):
        self.bd = bd
        self.talleres_repository = TalleresRepository(self.bd)
        self.talleres_usuarios_repository = TalleresUsuariosRepository(self.bd)
        self.suscripciones_repository = SuscripcionesRepository(self.bd)
    def listar_por_empresa(self, usuario: UsuarioDTO) -> List[TallerListaDTO]:
        if not usuario.id_empresa:
            raise NoEsAdministradorException()
        return self.talleres_repository.listar_por_empresa(usuario.id_empresa)

    def crear_taller(self, datos: CrearTallerDTO, usuario: UsuarioDTO) -> None:
        if not usuario.id_empresa:
            raise NoEsAdministradorException()

        if self.talleres_repository.existe_nombre_taller_en_empresa(usuario.id_empresa, datos.nombre_taller):
            raise NombreTallerRepetidoException()
        
        # Verificamos que su suscripción activa tenga talleres disponibles para agregar.
        suscripcion_activa = self.suscripciones_repository.obtener_suscripcion_activa_por_empresa(usuario.id_empresa)
        
        if not suscripcion_activa:
            raise EmpresaSinSuscripcionException()
        
        max_talleres = self.suscripciones_repository.obtener_max_talleres_por_suscripcion(usuario.id_empresa)
        cantidad_talleres = len(self.talleres_repository.listar_por_empresa(usuario.id_empresa))
        if max_talleres > 0 and cantidad_talleres >= max_talleres:
            raise EmpresaYaTieneMaxTalleresException()

        id_taller = str(uuid.uuid4())
        self.talleres_repository.create(
            data={
                "id_taller": id_taller,
                "id_empresa": usuario.id_empresa,
                "nombre_taller": datos.nombre_taller,
                "telefono_taller": datos.telefono_taller,
                "correo_taller": datos.correo_taller,
                "direccion_taller": datos.direccion_taller,
                "rfc_taller": datos.rfc_taller,
                "activo": 1,
            }
        )

        # Añadimos el usuario administrador al taller como rol ADMIN.
        self.talleres_usuarios_repository.añadir_usuario_admin_al_taller(usuario.id_usuario, id_taller)

    def obtener_taller_por_id(self, id_taller: str) -> TallerListaDTO:
        """
        Obtiene un taller por su ID.
        Verifica que el taller existe y está activo.
        """
        taller = self.talleres_repository.obtener_por_id_simple(id_taller)
        if not taller:
            from app.core.exceptions import TallerNoEncontradoException
            raise TallerNoEncontradoException()
        return taller
