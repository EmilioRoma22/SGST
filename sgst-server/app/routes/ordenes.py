from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_connection
from app.auth.dependencies import verify_token
from app.models.modelo_ordenes import DataCrearOrden, DataActualizarOrden, DataTerminarOrden
from datetime import datetime

router = APIRouter(
    prefix="/ordenes",
    tags=["Órdenes"]
)

@router.get("/obtener_ordenes", status_code=status.HTTP_200_OK)
def obtener_ordenes(id_taller: int, usuario = Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(""" 
            SELECT
                o.id_orden,
                o.id_taller,
                o.num_orden,
                o.accesorios,
                o.falla,
                o.diagnostico_inicial,
                o.solucion_aplicada,
                o.fecha_estimada_de_fin,
                o.fecha_entrega,
                o.costo_total,
                o.meses_garantia,
                o.fecha_fin_garantia,
                o.es_por_garantia,
                o.fecha_creacion,
                o.ultima_actualizacion,
                o.creado_por,
                o.cerrado_por,
                -- Cliente
                c.id_cliente,
                c.nombre_cliente,
                c.apellidos_cliente,
                -- Equipo
                e.id_equipo,
                e.id_tipo,
                e.marca_equipo,
                e.modelo_equipo,
                te.nombre_tipo,
                -- Prioridad
                cp.id_prioridad,
                cp.descripcion AS descripcion_prioridad,
                -- Técnico asignado
                u.id_usuario AS id_tecnico,
                u.nombre_usuario AS nombre_tecnico,
                u.apellidos_usuario AS apellidos_tecnico,
                -- Estado
                ce.id_estado,
                ce.descripcion AS descripcion_estado
            FROM ordenes o
            LEFT JOIN talleres t ON t.id_taller = o.id_taller
            LEFT JOIN clientes c ON c.id_cliente = o.id_cliente
            LEFT JOIN equipos e ON e.id_equipo = o.id_equipo
            LEFT JOIN tipo_equipos te ON te.id_tipo = e.id_tipo
            LEFT JOIN usuarios u ON u.id_usuario = o.tecnico_asignado
            LEFT JOIN cat_prioridades cp ON cp.id_prioridad = o.id_prioridad
            LEFT JOIN cat_estados ce ON ce.id_estado = o.id_estado
            WHERE o.id_taller = %s
            ORDER BY o.fecha_creacion DESC;
        """, (id_taller,))

        ordenes = cursor.fetchall()

        return {"ordenes": ordenes}
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

@router.get("/obtener_orden", status_code=status.HTTP_200_OK)
def obtener_orden(id_orden: int, usuario = Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(""" 
            SELECT
                o.id_orden,
                o.id_taller,
                o.num_orden,
                o.accesorios,
                o.falla,
                o.diagnostico_inicial,
                o.solucion_aplicada,
                o.fecha_estimada_de_fin,
                o.fecha_entrega,
                o.costo_total,
                o.meses_garantia,
                o.fecha_fin_garantia,
                o.es_por_garantia,
                o.fecha_creacion,
                o.ultima_actualizacion,
                o.creado_por,
                o.cerrado_por,
                -- Cliente
                c.id_cliente,
                c.nombre_cliente,
                c.apellidos_cliente,
                c.telefono_cliente,
                c.correo_cliente,
                c.direccion_cliente,
                -- Equipo
                e.id_equipo,
                e.id_tipo,
                e.marca_equipo,
                e.modelo_equipo,
                e.num_serie,
                e.descripcion_equipo,
                te.nombre_tipo,
                -- Prioridad
                cp.id_prioridad,
                cp.descripcion AS descripcion_prioridad,
                -- Técnico asignado
                u.id_usuario AS id_tecnico,
                u.nombre_usuario AS nombre_tecnico,
                u.apellidos_usuario AS apellidos_tecnico,
                -- Estado
                ce.id_estado,
                ce.descripcion AS descripcion_estado
            FROM ordenes o
            LEFT JOIN talleres t ON t.id_taller = o.id_taller
            LEFT JOIN clientes c ON c.id_cliente = o.id_cliente
            LEFT JOIN equipos e ON e.id_equipo = o.id_equipo
            LEFT JOIN tipo_equipos te ON te.id_tipo = e.id_tipo
            LEFT JOIN usuarios u ON u.id_usuario = o.tecnico_asignado
            LEFT JOIN cat_prioridades cp ON cp.id_prioridad = o.id_prioridad
            LEFT JOIN cat_estados ce ON ce.id_estado = o.id_estado
            WHERE o.id_orden = %s
            ORDER BY o.fecha_creacion DESC;
        """, (id_orden,))
        
        orden = cursor.fetchone()

        return {"orden": orden}
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
        
        cursor.execute("SELECT MAX(num_orden) FROM ordenes WHERE id_taller = %s", (dataOrden.id_taller,))
        ultimo_num_orden = cursor.fetchone()
        num_orden = 0

        if ultimo_num_orden[0] == None:
            num_orden = 1
        else:
            num_orden = ultimo_num_orden[0] + 1

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
            dataOrden.tecnico_asignado or None,
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

@router.put("/actualizar_orden", status_code=status.HTTP_200_OK)
def actualizar_orden(data: DataActualizarOrden, usuario = Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()

        fecha_estimada = datetime.strptime(data.fecha_estimada_de_fin, "%Y-%m-%d")

        sql = """
            UPDATE ordenes SET
                accesorios = %s,
                falla = %s,
                diagnostico_inicial = %s,
                solucion_aplicada = %s,
                id_prioridad = %s,
                tecnico_asignado = %s,
                fecha_estimada_de_fin = %s,
                id_estado = %s,
                costo_total = %s,
                ultima_actualizacion = NOW()
            WHERE id_orden = %s
        """

        cursor.execute(sql, (
            data.accesorios,
            data.falla,
            data.diagnostico_inicial,
            data.solucion_aplicada,
            data.id_prioridad,
            data.tecnico_asignado or None,
            fecha_estimada,
            data.id_estado,
            data.costo_total,
            data.id_orden
        ))

        connection.commit()

        return {"message": "Orden actualizada exitosamente"}
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

@router.put("/terminar_servicio", status_code=status.HTTP_200_OK)
def terminar_servicio(data: DataTerminarOrden, usuario = Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT id_taller FROM ordenes WHERE id_orden = %s", (data.id_orden,))
        orden = cursor.fetchone()
        
        if not orden:
             raise HTTPException(status_code=404, detail="Orden no encontrada")

        id_taller = orden['id_taller']

        sql_update = """
            UPDATE ordenes SET
                id_estado = 3,
                costo_total = %s,
                cerrado_por = %s,
                ultima_actualizacion = NOW()
            WHERE id_orden = %s
        """

        cursor.execute(sql_update, (
            data.costo_total,
            usuario['id_usuario'],
            data.id_orden
        ))

        sql_pago = """
            INSERT INTO pagos (
                id_orden, id_taller, tipo_pago, monto, metodo, creado_por
            ) VALUES (%s, %s, 'liquidacion', %s, %s, %s)
        """
        
        cursor.execute(sql_pago, (
            data.id_orden,
            id_taller,
            data.costo_total,
            data.metodo_pago,
            usuario['id_usuario']
        ))

        connection.commit()

        return {"message": "Servicio terminado y pago registrado exitosamente"}
    except Error as err:
        print(f"Error de MySQL: {err}")
        if connection:
            connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error en la base de datos"}
        )
    except HTTPException as http_err:
        if connection:
            connection.rollback()
        raise http_err
    except Exception as err:
        print(f"Error interno: {err}")
        if connection:
            connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno en el servidor"}
        )
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()