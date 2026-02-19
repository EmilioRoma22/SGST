from fastapi import APIRouter, status, Depends
from app.dependencies.database import obtener_conexion_bd
from app.dependencies.auth import obtener_usuario_actual, verificar_es_admin_taller
from app.dependencies.pagination import pagination_params
from app.models.usuarios import UsuarioDTO
from app.models.taller import TallerDTO
from app.models.cliente import CrearClienteDTO, ActualizarClienteDTO
from app.models.pagination import PaginationParams
from app.services.clientes_service import ClientesService

router = APIRouter(
    prefix="/clientes",
    tags=["clientes"],
)

@router.get("", status_code=status.HTTP_200_OK)
async def listar_clientes(
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    taller_actual: TallerDTO = Depends(verificar_es_admin_taller),
    pagination: PaginationParams = Depends(pagination_params),
    bd=Depends(obtener_conexion_bd),
):
    """
    Lista los clientes del taller actual con paginación y búsqueda.
    Solo los administradores del taller pueden acceder a este endpoint.
    """
    clientes_service = ClientesService(bd)
    resultado = clientes_service.listar_clientes(taller_actual.id_taller, pagination)
    return resultado

@router.get("/{id_cliente}", status_code=status.HTTP_200_OK)
async def obtener_cliente(
    id_cliente: int,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    taller_actual: TallerDTO = Depends(verificar_es_admin_taller),
    bd=Depends(obtener_conexion_bd),
):
    """
    Obtiene un cliente específico por su ID.
    Solo los administradores del taller pueden acceder a este endpoint.
    """
    clientes_service = ClientesService(bd)
    cliente = clientes_service.obtener_cliente(id_cliente, taller_actual.id_taller)
    return cliente

@router.post("", status_code=status.HTTP_201_CREATED)
async def crear_cliente(
    datos: CrearClienteDTO,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    taller_actual: TallerDTO = Depends(verificar_es_admin_taller),
    bd=Depends(obtener_conexion_bd),
):
    """
    Crea un nuevo cliente en el taller actual.
    Solo los administradores del taller pueden acceder a este endpoint.
    """
    clientes_service = ClientesService(bd)
    cliente_creado = clientes_service.crear_cliente(datos, taller_actual.id_taller)
    return {
        "message": f"El cliente {datos.nombre_cliente} {datos.apellidos_cliente} se ha creado correctamente",
        "cliente": cliente_creado
    }

@router.put("/{id_cliente}", status_code=status.HTTP_200_OK)
async def actualizar_cliente(
    id_cliente: int,
    datos: ActualizarClienteDTO,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    taller_actual: TallerDTO = Depends(verificar_es_admin_taller),
    bd=Depends(obtener_conexion_bd),
):
    """
    Actualiza un cliente existente en el taller actual.
    Solo los administradores del taller pueden acceder a este endpoint.
    """
    clientes_service = ClientesService(bd)
    cliente_actualizado = clientes_service.actualizar_cliente(id_cliente, datos, taller_actual.id_taller)
    return {
        "message": f"El cliente se ha actualizado correctamente",
        "cliente": cliente_actualizado
    }

@router.delete("/{id_cliente}", status_code=status.HTTP_200_OK)
async def eliminar_cliente(
    id_cliente: int,
    usuario: UsuarioDTO = Depends(obtener_usuario_actual),
    taller_actual: TallerDTO = Depends(verificar_es_admin_taller),
    bd=Depends(obtener_conexion_bd),
):
    """
    Elimina un cliente del taller actual.
    Solo los administradores del taller pueden acceder a este endpoint.
    """
    clientes_service = ClientesService(bd)
    clientes_service.eliminar_cliente(id_cliente, taller_actual.id_taller)
    return {"message": "El cliente se ha eliminado correctamente"}
