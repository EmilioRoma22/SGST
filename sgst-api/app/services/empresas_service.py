from app.models.empresa import CrearEmpresaDTO
from app.models.usuarios import UsuarioDTO
from app.models.auth import TokensDTO
from app.repositories.empresas_repository import EmpresasRepository
from app.repositories.usuarios_repository import UsuariosRepository
from app.services.tokens_service import TokensService
from app.core.exceptions import UsuarioYaTieneEmpresaException

class EmpresasService:
    def __init__(self, bd):
        self.bd = bd
        self.empresas_repository = EmpresasRepository(self.bd)
        self.usuarios_repository = UsuariosRepository(self.bd)
        self.tokens_service = TokensService(self.bd)

    def crear_empresa(self, datos: CrearEmpresaDTO, usuario: UsuarioDTO) -> TokensDTO:
        if usuario.id_empresa:
            raise UsuarioYaTieneEmpresaException()

        id_empresa = self.empresas_repository.create(
            data={
                "id_creador": usuario.id_usuario,
                "nombre_empresa": datos.nombre_empresa,
                "rfc_empresa": datos.rfc_empresa,
                "telefono_empresa": datos.telefono_empresa,
                "correo_empresa": datos.correo_empresa,
                "direccion_empresa": datos.direccion_empresa,
                "activo": 1,
            },
            returning="id_empresa"
        )

        self.usuarios_repository.actualizar_id_empresa(usuario.id_usuario, id_empresa)

        usuario_actualizado = self.usuarios_repository.obtener_usuario_por_id(usuario.id_usuario)
        tokens = self.tokens_service.crear_tokens(usuario_actualizado)

        return tokens
