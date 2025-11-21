from mysql.connector import Error
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_connection
from app.auth.dependencies import verify_token
from app.models.modelo_ordenes import DataCrearOrden
from datetime import datetime

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
    except Error as err:
        print(f"Error de MySQL: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error en la base de datos"}
        )
    except HTTPException as http_err:
        raise http_err
    except Exception as err:
        print(f"Error interno: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno en el servidor"}
        )
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@router.post("/crear_orden", status_code=status.HTTP_201_CREATED)
def crear_orden(dataOrden: DataCrearOrden, usuario = Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT num_orden FROM ordenes WHERE id_taller = %s", (dataOrden.id_taller,))
        existe_num_orden = cursor.fetchone()

        if existe_num_orden:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "El número de orden ya existe"}
            )
        
        cursor.execute("SELECT MAX(num_orden) FROM ordenes WHERE id_taller = %s", (dataOrden.id_taller,))
        ultimo_num_orden = cursor.fetchone()

        num_orden = 0

        if ultimo_num_orden[0] == None:
            num_orden = 1
        else:
            num_orden = ultimo_num_orden[0] + 1

        print(dataOrden)

        fecha_estimada_de_fin = datetime.strptime(dataOrden.fecha_estimada_de_fin, "%Y-%m-%d")
        fecha_fin_garantia = datetime.strptime(dataOrden.fecha_fin_garantia, "%Y-%m-%d")

        sql = """
            INSERT INTO ordenes (
                id_taller,
                num_orden,
                id_cliente,
                id_equipo,
                accesorios,
                falla,
                diagnostico_inicial,
                solucion_aplicada,
                id_prioridad,
                tecnico_asignado,
                fecha_estimada_de_fin,
                id_estado,
                costo_total,
                meses_garantia,
                fecha_fin_garantia,
                es_por_garantia,
                id_orden_origen,
                creado_por
            ) VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """
        cursor.execute(sql, (
            dataOrden.id_taller,
            num_orden,
            dataOrden.id_cliente,
            dataOrden.id_equipo,
            dataOrden.accesorios,
            dataOrden.falla,
            dataOrden.diagnostico_inicial,
            dataOrden.solucion_aplicada,
            dataOrden.id_prioridad,
            dataOrden.tecnico_asignado,
            fecha_estimada_de_fin,
            dataOrden.id_estado,
            dataOrden.costo_total,
            dataOrden.meses_garantia,
            fecha_fin_garantia,
            dataOrden.es_por_garantia,
            dataOrden.id_orden_origen or None,
            usuario['id_usuario']
        ))

        connection.commit()

        return {"message": "Orden creada exitosamente"}
    except Error as err:
        print(f"Error de MySQL: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error en la base de datos"}
        )
    except HTTPException as http_err:
        raise http_err
    except Exception as err:
        print(f"Error interno: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno en el servidor"}
        )
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()