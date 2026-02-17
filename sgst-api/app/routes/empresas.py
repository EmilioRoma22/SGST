from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.dependencies.database import obtener_conexion_bd
from app.dependencies.auth import obtener_usuario_actual
from app.models.usuarios import UsuarioDTO
from app.models.empresa import CrearEmpresaDTO
from app.services.empresas_service import EmpresasService

def _cookie_params():
    return {
        "httponly": True,
        "secure": settings.COOKIES_SECURE,
        "samesite": "lax",
        "path": "/",
    }

router = APIRouter(
    prefix="/empresas",
    tags=["empresas"],
)

@router.post("", status_code=status.HTTP_201_CREATED)
async def crear_empresa(
    datos: CrearEmpresaDTO,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd = Depends(obtener_conexion_bd),
):
    empresas_service = EmpresasService(bd)
    tokens = empresas_service.crear_empresa(datos, usuario)

    response = JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "message": "Su empresa se ha creado correctamente, por favor seleccione una suscripción."
        }
    )

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
