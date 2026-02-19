class AppException(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: dict | None = None
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details

class ConfigError(AppException):
    def __init__(self):
        super().__init__(
            status_code=500,
            code="SERVER_ERROR", # Se coloca así para el el usuario solamente sepa que es un error del servidor y no un error de configuración.
            message="Error en el servidor, comuníquese con el administrador e intente nuevamente.",
            details={}
        )

class TokenExpiradoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=401,
            code="TOKEN_EXPIRADO",
            message="El token ha expirado, por favor inicie sesión nuevamente.",
            details={}
        )

class TokenInvalidoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=401,
            code="TOKEN_INVALIDO",
            message="El token es inválido, por favor inicie sesión nuevamente.",
            details={}
        )

class UsuarioNoEncontradoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=404,
            code="USUARIO_NO_ENCONTRADO",
            message="No existe un usuario con el correo ingresado, por favor verifique o regístrese.",
            details={}
        )

class CredencialesIncorrectasException(AppException):
    def __init__(self):
        super().__init__(
            status_code=401,
            code="CREDENCIALES_INCORRECTAS",
            message="Las credenciales ingresadas son incorrectas, por favor verifique e intente nuevamente.",
            details={}
        )

class TokenException(AppException):
    def __init__(self):
        super().__init__(
            status_code=401,
            code="TOKEN_ERROR",
            message="Se necesita un token para continuar, inicie sesión.",
            details={}
        )

class TokenRevocadoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=401,
            code="TOKEN_REVOCADO",
            message="El token ha sido revocado, por favor inicie sesión nuevamente.",
            details={}
        )

class UsuarioNoPerteneceAlTallerException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="USUARIO_NO_PERTENECE_AL_TALLER",
            message="El usuario no pertenece al taller, por favor inicie sesión nuevamente.",
            details={}
        )

class UsuarioNoEsAdminNiPerteneceAlTallerException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="USUARIO_NO_ES_ADMIN_NI_TALLER",
            message="El usuario no es admin ni pertenece a un taller, por favor inicie sesión nuevamente.",
            details={}
        )

class UsuarioDesactivadoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="USUARIO_DESACTIVADO",
            message="El usuario ha sido desactivado, por favor comuníquese con el administrador.",
            details={}
        )

class HayCorreoRepetidoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="HAY_CORREO_REPETIDO",
            message="El correo electrónico ya está en uso, por favor ingrese uno diferente.",
            details={}
        )

class HayTelefonoRepetidoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="HAY_TELEFONO_REPETIDO",
            message="El teléfono ya está en uso, por favor ingrese uno diferente.",
            details={}
        )

class ContraseñasNoCoincidenException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="CONTRASEÑAS_NO_COINCIDEN",
            message="Las contraseñas no coinciden, por favor ingrese nuevamente.",
            details={}
        )

class CamposIncompletosException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="CAMPOS_INCOMPLETOS",
            message="Por favor complete todos los campos requeridos.",
            details={}
        )

class ContrasenaDebilException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="CONTRASENA_DEBIL",
            message="La contraseña debe tener al menos 8 caracteres, una letra y un número.",
            details={}
        )

class FormatoTelefonoInvalidoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="FORMATO_TELEFONO_INVALIDO",
            message="El formato del teléfono no es válido. Use solo números, espacios, +, - o paréntesis.",
            details={}
        )

class FormatoCorreoInvalidoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="FORMATO_CORREO_INVALIDO",
            message="El formato del correo electrónico no es válido.",
            details={}
        )

class NombreTallerRepetidoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="NOMBRE_TALLER_REPETIDO",
            message="Ya existe un taller con ese nombre en su empresa.",
            details={}
        )

class NoEsAdministradorException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="NO_ES_ADMINISTRADOR",
            message="Solo los administradores pueden elegir un taller.",
            details={}
        )

class UsuarioYaTieneEmpresaException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="USUARIO_YA_TIENE_EMPRESA",
            message="El usuario ya tiene una empresa asociada.",
            details={}
        )

class LicenciaNoEncontradaException(AppException):
    def __init__(self):
        super().__init__(
            status_code=404,
            code="LICENCIA_NO_ENCONTRADA",
            message="La licencia seleccionada no existe o no está disponible.",
            details={}
        )

class EmpresaYaTieneSuscripcionActivaException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="EMPRESA_YA_TIENE_SUSCRIPCION_ACTIVA",
            message="La empresa ya cuenta con una suscripción activa.",
            details={}
        )

class EmpresaSinSuscripcionException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="EMPRESA_SIN_SUSCRIPCION",
            message="La empresa no cuenta con una suscripción activa.",
            details={}
        )

class TallerNoEncontradoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=404,
            code="TALLER_NO_ENCONTRADO",
            message="El taller no existe o no está disponible.",
            details={}
        )

class TallerNoPerteneceAEmpresaException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="TALLER_NO_PERTENECE_A_EMPRESA",
            message="El taller no pertenece a tu empresa.",
            details={}
        )

class EmpresaYaTieneMaxTalleresException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="EMPRESA_YA_TIENE_MAX_TALLERES",
            message="La empresa ya tiene el máximo de talleres permitidos en su suscripción activa.",
            details={}
        )

class ClienteNoEncontradoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=404,
            code="CLIENTE_NO_ENCONTRADO",
            message="El cliente no existe o no pertenece a este taller.",
            details={}
        )

class ClienteDuplicadoException(AppException):
    def __init__(self, campo: str = "correo o teléfono"):
        super().__init__(
            status_code=400,
            code="CLIENTE_DUPLICADO",
            message=f"Ya existe un cliente con ese {campo} en este taller.",
            details={"campo": campo}
        )

class NoEsAdministradorDelTallerException(AppException):
    def __init__(self):
        super().__init__(
            status_code=403,
            code="NO_ES_ADMINISTRADOR_DEL_TALLER",
            message="Solo los administradores del taller pueden realizar esta acción.",
            details={}
        )

class TallerNoEspecificadoException(AppException):
    def __init__(self):
        super().__init__(
            status_code=400,
            code="TALLER_NO_ESPECIFICADO",
            message="No se ha especificado un taller. Por favor, seleccione un taller primero.",
            details={}
        )