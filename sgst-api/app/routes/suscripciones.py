from fastapi import APIRouter, status, Depends, Request
from app.dependencies.database import obtener_conexion_bd
from app.dependencies.auth import obtener_usuario_actual
from app.models.usuarios import UsuarioDTO
from app.models.suscripcion import CrearSuscripcionDTO
from app.services.suscripciones_service import SuscripcionesService

router = APIRouter(
    prefix="/suscripciones",
    tags=["suscripciones"],
)

@router.get("/verificar", status_code=status.HTTP_200_OK)
async def verificar_suscripcion(
    request: Request,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd = Depends(obtener_conexion_bd),
):
    id_taller_actual = request.cookies.get("id_taller_actual")
    suscripciones_service = SuscripcionesService(bd)
    verificacion = suscripciones_service.verificar_suscripcion(usuario, id_taller_actual)

    return verificacion

@router.get("/licencias", status_code=status.HTTP_200_OK)
async def listar_licencias(
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd = Depends(obtener_conexion_bd),
):
    suscripciones_service = SuscripcionesService(bd)
    licencias = suscripciones_service.listar_licencias()

    return licencias

@router.post("", status_code=status.HTTP_201_CREATED)
async def crear_suscripcion(
    datos: CrearSuscripcionDTO,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd = Depends(obtener_conexion_bd),
):
    suscripciones_service = SuscripcionesService(bd)
    suscripcion = suscripciones_service.crear_suscripcion(usuario, datos.id_licencia)

    return {
        "message": "Se ha activado tu suscripción correctamente, ¡Te agradecemos por confiar en nosotros! Disfruta de SGST.",
        "suscripcion": suscripcion,
    }
