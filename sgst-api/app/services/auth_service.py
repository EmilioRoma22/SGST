from app.repositories.usuarios_repository import UsuariosRepository
from app.models.usuarios import UsuarioDTO
from app.core.exceptions import CamposIncompletosException, HayCorreoRepetidoException, HayTelefonoRepetidoException, UsuarioNoEncontradoException, CredencialesIncorrectasException, UsuarioNoEsAdminNiPerteneceAlTallerException, ContraseñasNoCoincidenException
from app.services.tokens_service import TokensService
from app.models.auth import LoginResponseDTO, RegistroDTO
from app.core.security import decodificar_token
from app.repositories.usuarios_talleres_repository import UsuariosTalleresRepository
from app.models.taller import TallerRolDTO
import bcrypt
import uuid

class AuthService:
    def __init__(self, bd):
        self.bd = bd
        self.usuarios_repository = UsuariosRepository(self.bd)
        self.tokens_service = TokensService(self.bd)
        self.usuarios_talleres_repository = UsuariosTalleresRepository(self.bd)
        
    def verificar_usuario(self, correo_usuario: str, password_usuario: str) -> UsuarioDTO:
        usuario = self.usuarios_repository.obtener_usuario_por_correo(correo_usuario)
        
        if not usuario:
            raise UsuarioNoEncontradoException()
        if not usuario.activo:
            # Se retona el mismo error ya que se usa un soft delete, si el usuario está desactivado con el mismo correo 
            # no debe de saber que está desactivado, solamente hay que decirle que no existe.
            raise UsuarioNoEncontradoException() 
        
        if not bcrypt.checkpw(password_usuario.encode('utf-8'), usuario.hash_password.encode('utf-8')):
            raise CredencialesIncorrectasException()
        
        return usuario
    
    def login(self, correo_usuario: str, password_usuario: str) -> LoginResponseDTO:
        if not correo_usuario or not password_usuario:
            raise CamposIncompletosException()
        
        usuario = self.verificar_usuario(correo_usuario, password_usuario)
        tokens = self.tokens_service.crear_tokens(usuario)
        
        return LoginResponseDTO(usuario=usuario, tokens=tokens)

    def login_taller(self, access_token: str) -> TallerRolDTO | None:
        payload = decodificar_token(access_token)
        id_usuario = payload.get("id_usuario")
        id_empresa = payload.get("id_empresa")
        
        # Primero verificaremos si tiene una id_empresa, si no la tiene, significa que no es admin, así que 
        # verificaremos en la tabla usuarios_talleres si pertenece a un taller y que rol tiene para regresarlo
        # y generar las cookies necesarias para que entre directamente al dashboard del taller.
        
        if not id_empresa:
            rol_y_taller = self.usuarios_talleres_repository.obtener_rol_y_taller_por_id_usuario(id_usuario)
            
            if not rol_y_taller:
                raise UsuarioNoEsAdminNiPerteneceAlTallerException()
            
            return rol_y_taller
        
        # Si tiene una id_empresa, significa que es admin, así que en el frontend se redireccionará al dashboard de la empresa para elegir el taller.
        return None
    
    def verificar_datos_registro(self, datos: RegistroDTO) -> None:
        if not datos.nombre_usuario or not datos.apellidos_usuario or not datos.correo_usuario or not datos.telefono_usuario or not datos.password_usuario or not datos.confirmar_password_usuario:
            raise CamposIncompletosException()
        
        if self.usuarios_repository.hay_correo_repetido(datos.correo_usuario):
            raise HayCorreoRepetidoException()
        
        if self.usuarios_repository.hay_telefono_repetido(datos.telefono_usuario):
            raise HayTelefonoRepetidoException()

        if datos.password_usuario != datos.confirmar_password_usuario:
            raise ContraseñasNoCoincidenException()
    
    def registro(self, datos: RegistroDTO) -> None:
        self.verificar_datos_registro(datos)
        hash_password = bcrypt.hashpw(datos.password_usuario.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        id_usuario = str(uuid.uuid4())

        self.usuarios_repository.create(data={
            "id_usuario": id_usuario,
            "nombre_usuario": datos.nombre_usuario,
            "apellidos_usuario": datos.apellidos_usuario,
            "correo_usuario": datos.correo_usuario,
            "telefono_usuario": datos.telefono_usuario,
            "hash_password": hash_password,
            "activo": 1
        })
        
        