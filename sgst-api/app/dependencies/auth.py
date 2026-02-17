from fastapi import Depends, Request
from app.core.exceptions import UsuarioNoEncontradoException, UsuarioNoPerteneceAlTallerException
from app.core.security import decodificar_token
from app.dependencies.database import obtener_conexion_bd
from app.models.usuarios import UsuarioDTO
from app.core.exceptions import TokenInvalidoException, TokenException
from app.repositories.usuarios_repository import UsuariosRepository
from app.models.taller import TallerDTO
from app.repositories.usuarios_talleres_repository import UsuariosTalleresRepository

def obtener_usuario_actual(request: Request, db = Depends(obtener_conexion_bd)) -> UsuarioDTO:
    token = request.cookies.get("access_token")
    
    if not token:
        raise TokenException()

    payload = decodificar_token(token)
    id_usuario = payload.get("id_usuario")
    
    if not id_usuario:
        raise TokenInvalidoException()

    usuarios_repository = UsuariosRepository(db)
    usuario = usuarios_repository.obtener_usuario_por_id(id_usuario)

    if not usuario:
        raise UsuarioNoEncontradoException()

    if not usuario.activo:
        raise UsuarioNoEncontradoException()

    return usuario

def obtener_taller_actual(request: Request, db = Depends(obtener_conexion_bd)) -> TallerDTO | None:
    token = request.cookies.get("access_token")
    id_taller_actual = request.cookies.get("id_taller_actual")
    
    if not id_taller_actual:
        return None

    try:
        id_taller_int = int(id_taller_actual)
    except (ValueError, TypeError):
        return None

    if not token:
        raise TokenException()

    payload = decodificar_token(token)
    id_usuario = payload.get("id_usuario")

    if not id_usuario:
        raise TokenInvalidoException()

    usuarios_talleres_repository = UsuariosTalleresRepository(db)
    usuario_taller = usuarios_talleres_repository.obtener_rol_por_usuario_y_taller(id_usuario, id_taller_int)

    if not usuario_taller:
        raise UsuarioNoPerteneceAlTallerException()
    
    return TallerDTO(id_taller=usuario_taller.id_taller, rol_taller=usuario_taller.rol_taller)