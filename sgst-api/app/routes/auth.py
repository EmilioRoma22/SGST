from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from fastapi import Request
from app.core.config import settings
from app.core.rate_limit import limiter
from app.models.auth import LoginDTO, RegistroDTO
from app.dependencies.database import obtener_conexion_bd
from app.services.auth_service import AuthService
from app.services.tokens_service import TokensService
from app.models.usuarios import UsuarioDTO
from app.dependencies.auth import obtener_usuario_actual, obtener_taller_actual
from app.models.taller import TallerDTO

def _cookie_params():
    return {
        "httponly": True,
        "secure": settings.COOKIES_SECURE,
        "samesite": "lax",
        "path": "/",
    }

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.get("/me/taller", status_code=status.HTTP_200_OK)
async def me_taller(taller: TallerDTO | None = Depends(obtener_taller_actual)):
    if not taller:
        return None
    
    return {
        "id_taller": taller.id_taller,
        "rol_taller": taller.rol_taller,
    }

@router.get("/me", status_code=status.HTTP_200_OK)
async def me(usuario: UsuarioDTO = Depends(obtener_usuario_actual)):
    return {
        "id_usuario": usuario.id_usuario,
        "id_empresa": usuario.id_empresa,
        "nombre_usuario": usuario.nombre_usuario,
        "apellidos_usuario": usuario.apellidos_usuario,
        "correo_usuario": usuario.correo_usuario,
        "telefono_usuario": usuario.telefono_usuario,
    }

@router.post("/refresh", status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
async def refresh_token(request: Request, bd=Depends(obtener_conexion_bd)):
    refresh_token_cookie = request.cookies.get("refresh_token")
    tokens_service = TokensService(bd)
    tokens = tokens_service.refresh_token(refresh_token_cookie)
    response = JSONResponse(content = {"message": "Token actualizado correctamente"})

    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        max_age=10 * 60,
        **_cookie_params(),
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        max_age=24 * 60 * 60,
        **_cookie_params(),
    )
    return response

@router.post("/login", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def login(request: Request, credenciales: LoginDTO, bd=Depends(obtener_conexion_bd)):
    auth_service = AuthService(bd)
    login_response = auth_service.login(credenciales.correo_usuario, credenciales.password_usuario)
    
    response = JSONResponse(
        content={
            "message": "¡Bienvenido! Iniciaste sesión correctamente"
        }
    )
    
    response.set_cookie(
        key="access_token",
        value=login_response.tokens.access_token,
        max_age=10 * 60,
        **_cookie_params(),
    )
    response.set_cookie(
        key="refresh_token",
        value=login_response.tokens.refresh_token,
        max_age=24 * 60 * 60,
        **_cookie_params(),
    )
    return response

@router.post("/login/taller", status_code=status.HTTP_200_OK)
async def login_taller(request: Request, bd = Depends(obtener_conexion_bd)):
    auth_service = AuthService(bd)
    taller_rol = auth_service.login_taller(request.cookies.get("access_token"))
    
    response = JSONResponse(
        content={
            "message": "OK"
        }
    )
    
    if taller_rol:
        response.set_cookie(
            key="id_taller_actual",
            value=str(taller_rol.id_taller),
            max_age=10 * 60,
            **_cookie_params(),
        )
    return response

@router.post("/registro", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def registro(request: Request, datos: RegistroDTO, bd=Depends(obtener_conexion_bd)):
    auth_service = AuthService(bd)
    auth_service.registro(datos)
    
    return {
        "message": f"{datos.nombre_usuario} ha sido registrado correctamente"
    }
