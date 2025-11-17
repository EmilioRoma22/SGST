import mysql.connector
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_connection
from app.auth.dependencies import verify_token

router = APIRouter(
    prefix="/ordenes",
    tags=["Órdenes"]
)

@router.get("/", status_code=status.HTTP_200_OK)
def listar_ordenes(id_taller: int, usuario = Depends(verify_token)):
    """
    Devuelve las órdenes de servicio de un taller, incluyendo información de garantía.
    El frontend envía el id_taller del taller activo.
    """
    connection = get_connection()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error de conexión con la base de datos"}
        )

    try:
        cursor = connection.cursor(dictionary=True)

        query = '''
            SELECT 
                o.id_orden,
                o.num_orden,
                CONCAT(c.nombre_cliente, ' ', c.apellidos_cliente) AS cliente,
                COALESCE(e.descripcion_equipo, CONCAT(e.marca_equipo, ' ', e.modelo_equipo)) AS equipo,
                o.falla,
                o.diagnostico_inicial AS diagnostico,
                o.solucion_aplicada AS solucion,
                cp.descripcion AS prioridad,
                CONCAT(COALESCE(t.nombre_tecnico, ''), ' ', COALESCE(t.apellidos_tecnico, '')) AS tecnico,
                o.fecha_estimada_de_fin AS fecha_estimada,
                o.fecha_entrega,
                ce.descripcion AS estado,
                FORMAT(o.costo_total, 2) AS costo,
                o.meses_garantia,
                o.fecha_fin_garantia,
                o.es_por_garantia
            FROM ordenes o
            INNER JOIN clientes c ON o.id_cliente = c.id_cliente
            INNER JOIN equipos e ON o.id_equipo = e.id_equipo
            INNER JOIN cat_prioridades cp ON o.id_prioridad = cp.id_prioridad
            INNER JOIN cat_estados ce ON o.id_estado = ce.id_estado
            LEFT JOIN tecnicos t ON o.tecnico_asignado = t.id_tecnico
            WHERE o.id_taller = %s
            ORDER BY o.fecha_creacion DESC
        '''

        cursor.execute(query, (id_taller,))
        ordenes = cursor.fetchall()

        for o in ordenes:
            if o.get("tecnico"):
                o["tecnico"] = o["tecnico"].strip() or None

        return ordenes
    except mysql.connector.Error as e:
        print("Error en la base de datos (ordenes):", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno del servidor"}
        )
    finally:
        cursor.close()
        connection.close()
