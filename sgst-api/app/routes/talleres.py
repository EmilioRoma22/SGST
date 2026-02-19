from fastapi import APIRouter, status, Depends
from app.dependencies.database import obtener_conexion_bd
from app.dependencies.auth import obtener_usuario_actual, obtener_taller_actual
from app.models.usuarios import UsuarioDTO
from app.models.taller import CrearTallerDTO, TallerDTO
from app.services.talleres_service import TalleresService
from app.core.exceptions import UsuarioNoPerteneceAlTallerException

router = APIRouter(
    prefix="/talleres",
    tags=["talleres"],
)

@router.get("", status_code=status.HTTP_200_OK)
async def listar_talleres_de_empresa(
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd=Depends(obtener_conexion_bd),
):
    talleres_service = TalleresService(bd)
    talleres = talleres_service.listar_por_empresa(usuario)
    return talleres

@router.get("/{id_taller}", status_code=status.HTTP_200_OK)
async def obtener_taller_por_id(
    id_taller: str,
    taller_actual: TallerDTO | None = Depends(obtener_taller_actual),
    bd=Depends(obtener_conexion_bd),
):
    """
    Obtiene un taller por su ID.
    Verifica que el usuario tenga acceso al taller (pertenece al taller actual).
    """
    if not taller_actual:
        raise UsuarioNoPerteneceAlTallerException()
    
    if taller_actual.id_taller != id_taller:
        raise UsuarioNoPerteneceAlTallerException()
    
    talleres_service = TalleresService(bd)
    taller = talleres_service.obtener_taller_por_id(id_taller)
    return taller

@router.post("", status_code=status.HTTP_201_CREATED)
async def crear_taller(
    datos: CrearTallerDTO,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd=Depends(obtener_conexion_bd),
):
    talleres_service = TalleresService(bd)
    talleres_service.crear_taller(datos, usuario)
    return {"message": f"El taller {datos.nombre_taller} se ha creado correctamente"}
