from fastapi import APIRouter, status, Depends
from app.dependencies.database import obtener_conexion_bd
from app.dependencies.auth import obtener_usuario_actual
from app.models.usuarios import UsuarioDTO
from app.models.taller import CrearTallerDTO
from app.services.talleres_service import TalleresService

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

@router.post("", status_code=status.HTTP_201_CREATED)
async def crear_taller(
    datos: CrearTallerDTO,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    bd=Depends(obtener_conexion_bd),
):
    talleres_service = TalleresService(bd)
    talleres_service.crear_taller(datos, usuario)
    return {"message": f"El taller {datos.nombre_taller} se ha creado correctamente"}
