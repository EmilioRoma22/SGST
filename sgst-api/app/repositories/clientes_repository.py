from typing import List, Dict, Any
from app.repositories.base_repository import BaseRepository
from app.models.pagination import PaginationParams
from app.models.cliente import ClienteDTO, ClienteListaDTO

class ClientesRepository(BaseRepository):
    table_name = "clientes"
    searchable_fields = ["nombre_cliente", "apellidos_cliente", "correo_cliente", "telefono_cliente"]

    def listar_por_taller(self, id_taller: str, pagination: PaginationParams) -> List[Dict[str, Any]]:
        """
        Lista clientes de un taller con paginación y búsqueda.
        
        :param id_taller: ID del taller
        :param pagination: Parámetros de paginación y búsqueda
        :return: Lista de clientes
        """
        base_query = f"SELECT * FROM {self.table_name} WHERE id_taller = %s"
        search_clause, search_params = self._build_search_clause(pagination.search)
        
        query = base_query + search_clause
        
        columnas_permitidas = {
            "id_cliente": "id_cliente",
            "nombre_cliente": "nombre_cliente",
            "apellidos_cliente": "apellidos_cliente",
            "correo_cliente": "correo_cliente",
            "telefono_cliente": "telefono_cliente",
            "fecha_creacion": "fecha_creacion",
            "ultima_actualizacion": "ultima_actualizacion"
        }
        
        params = (id_taller,) + tuple(search_params) if search_params else (id_taller,)
        
        return self.paginate(
            base_query=query,
            params=params,
            pagination=pagination,
            columnas_permitidas=columnas_permitidas,
            default_order="fecha_creacion DESC"
        )

    def obtener_por_id(self, id_cliente: int, id_taller: str) -> ClienteDTO | None:
        """
        Obtiene un cliente por ID verificando que pertenezca al taller.
        
        :param id_cliente: ID del cliente
        :param id_taller: ID del taller
        :return: ClienteDTO si existe, None si no existe o no pertenece al taller
        """
        query = f"""SELECT * FROM {self.table_name} 
                    WHERE id_cliente = %s AND id_taller = %s"""
        self.execute(query, (id_cliente, id_taller))
        fila = self.cursor.fetchone()
        return ClienteDTO(**fila) if fila else None

    def existe_correo_en_taller(self, id_taller: str, correo: str, excluir_id: int | None = None) -> bool:
        """
        Verifica si un correo ya existe en el taller.
        
        :param id_taller: ID del taller
        :param correo: Correo a verificar
        :param excluir_id: ID del cliente a excluir de la búsqueda (útil para actualizaciones)
        :return: True si existe, False si no existe
        """
        if not correo:
            return False
        
        if excluir_id is not None:
            query = f"""SELECT COUNT(*) as total FROM {self.table_name}
                       WHERE id_taller = %s AND correo_cliente = %s AND correo_cliente IS NOT NULL AND id_cliente != %s"""
            self.execute(query, (id_taller, correo, excluir_id))
        else:
            query = f"""SELECT COUNT(*) as total FROM {self.table_name}
                       WHERE id_taller = %s AND correo_cliente = %s AND correo_cliente IS NOT NULL"""
            self.execute(query, (id_taller, correo))
        
        resultado = self.cursor.fetchone()
        return resultado["total"] > 0 if resultado else False

    def existe_telefono_en_taller(self, id_taller: str, telefono: str, excluir_id: int | None = None) -> bool:
        """
        Verifica si un teléfono ya existe en el taller.
        
        :param id_taller: ID del taller
        :param telefono: Teléfono a verificar
        :param excluir_id: ID del cliente a excluir de la búsqueda (útil para actualizaciones)
        :return: True si existe, False si no existe
        """
        if not telefono:
            return False
        
        if excluir_id is not None:
            query = f"""SELECT COUNT(*) as total FROM {self.table_name}
                       WHERE id_taller = %s AND telefono_cliente = %s AND telefono_cliente IS NOT NULL AND id_cliente != %s"""
            self.execute(query, (id_taller, telefono, excluir_id))
        else:
            query = f"""SELECT COUNT(*) as total FROM {self.table_name}
                       WHERE id_taller = %s AND telefono_cliente = %s AND telefono_cliente IS NOT NULL"""
            self.execute(query, (id_taller, telefono))
        
        resultado = self.cursor.fetchone()
        return resultado["total"] > 0 if resultado else False

    def contar_por_taller(self, id_taller: str, search: str | None = None) -> int:
        """
        Cuenta el total de clientes del taller que coinciden con la búsqueda.
        
        :param id_taller: ID del taller
        :param search: Término de búsqueda opcional
        :return: Número total de clientes
        """
        base = f"SELECT COUNT(*) as total FROM {self.table_name} WHERE id_taller = %s"
        search_clause, params = self._build_search_clause(search)
        
        query = base + search_clause
        full_params = (id_taller,) + tuple(params) if params else (id_taller,)
        
        try:
            self.cursor.execute(query, full_params)
            result = self.cursor.fetchone()
            return result["total"] if result else 0
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error en contar_por_taller: {e}")
            return 0
