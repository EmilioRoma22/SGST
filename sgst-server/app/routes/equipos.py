from fastapi import APIRouter, status, HTTPException, Depends
from app.auth.dependencies import verify_token
from app.core.database import get_connection
from mysql.connector import Error
from app.models.modelo_equipos import DataCrearEquipoTaller

router = APIRouter(
    prefix="/equipos",
    tags=["Equipos"]
)

@router.get("/obtener_equipos" ,status_code=status.HTTP_200_OK)
def obtener_equipos(id_taller: int, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                e.id_equipo,
                e.id_taller,
                e.id_tipo,
                e.num_serie,
                e.marca_equipo,
                e.modelo_equipo,
                e.descripcion_equipo,
                e.fecha_registro,
                e.ultima_actualizacion,
                t.nombre_tipo
            FROM equipos e
            JOIN tipo_equipos t ON e.id_tipo = t.id_tipo
            WHERE e.id_taller = %s
        """, (id_taller, ))
        equipos = cursor.fetchall()
        
        return {"equipos": equipos}
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

@router.get("/obtener_ultimo_equipo",status_code=status.HTTP_200_OK)
def obtener_ultimo_equipo(id_taller: int, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                e.id_equipo,
                e.id_taller,
                e.id_tipo,
                e.num_serie,
                e.marca_equipo,
                e.modelo_equipo,
                e.descripcion_equipo,
                e.fecha_registro,
                e.ultima_actualizacion,
                t.nombre_tipo
            FROM equipos e
            JOIN tipo_equipos t ON e.id_tipo = t.id_tipo
            WHERE e.id_taller = %s
            ORDER BY e.fecha_registro DESC
            LIMIT 1
        """, (id_taller, ))
        ultimo_equipo = cursor.fetchone()
        
        return {"ultimo_equipo": ultimo_equipo}
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

@router.post("/crear_equipo", status_code=status.HTTP_201_CREATED)
def crear_equipo(datos_equipo: DataCrearEquipoTaller, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT num_serie FROM equipos WHERE id_taller = %s AND num_serie = %s", (datos_equipo.id_taller, datos_equipo.num_serie))
        existe_num_serie = cursor.fetchone()

        if existe_num_serie:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "El número de serie ya existe"}
            )

        cursor.execute("""
            INSERT INTO equipos (id_taller, id_tipo, num_serie, marca_equipo, modelo_equipo, descripcion_equipo) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            datos_equipo.id_taller, 
            datos_equipo.id_tipo, 
            datos_equipo.num_serie, 
            datos_equipo.marca_equipo, 
            datos_equipo.modelo_equipo, 
            datos_equipo.descripcion_equipo
        ))

        connection.commit()
    
        return {"message": "Se ha creado el equipo correctamente"}
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

@router.get("/obtener_tipo_equipos" ,status_code=status.HTTP_200_OK)
def obtener_tipo_equipos(id_taller: int, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM tipo_equipos WHERE id_taller = %s ORDER BY fecha_creacion DESC", (id_taller, ))
        tipo_equipos = cursor.fetchall()
        
        return {"tipo_equipos": tipo_equipos}
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

@router.post("/crear_tipo_equipo", status_code=status.HTTP_201_CREATED)
def crear_tipo_equipo(id_taller: int, nombre_tipo: str, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()
                
        cursor.execute("SELECT nombre_tipo FROM tipo_equipos WHERE nombre_tipo = %s AND id_taller = %s", (nombre_tipo, id_taller))
        existe_tipo = cursor.fetchone()

        if existe_tipo:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "Ya existe un tipo de equipo con el nombre ingresado"})

        cursor.execute("INSERT INTO tipo_equipos (id_taller, nombre_tipo) VALUES (%s, %s)", (id_taller, nombre_tipo))
        connection.commit()
    
        return {"message": "Se ha creado el tipo de equipo correctamente"}
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

