from fastapi import APIRouter, Depends, HTTPException, status
from datetime import date
from app.core.database import get_connection
from app.auth.dependencies import verify_token
from mysql.connector import Error

router = APIRouter(
    prefix="/suscripciones",
    tags=["Suscripciones"]
)

@router.post("/verificar_suscripcion_empresa", status_code=status.HTTP_200_OK)
def verificar_suscripcion(id_empresa: int, usuario=Depends(verify_token)):
    connection = get_connection()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error de conexión con la base de datos"}
        )

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM suscripciones
            WHERE id_empresa = %s AND activa = 1
            LIMIT 1
        """, (id_empresa,))
        suscripcion = cursor.fetchone()

        if not suscripcion:
            return {"suscripcion_activa": False, "message": "No existe suscripción activa"}

        hoy = date.today()
        fecha_fin = suscripcion["fecha_fin"]

        if fecha_fin and hoy > fecha_fin:
            cursor.execute("""
                UPDATE suscripciones
                SET activa = 0
                WHERE id_suscripcion = %s
            """, (suscripcion["id_suscripcion"],))
            connection.commit()

            return {
                "suscripcion_activa": False,
                "message": f"Suscripción vencida el {fecha_fin.strftime('%Y-%m-%d')}"
            }
        return {
            "suscripcion_activa": True,
            "message": "Suscripción vigente",
            "fecha_fin": fecha_fin.strftime('%Y-%m-%d') if fecha_fin else None,
            "id_licencia": suscripcion["id_licencia"]
        }
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

@router.get("/obtener_licencias", status_code=status.HTTP_200_OK)
def obtener_licencias(usuario=Depends(verify_token)):
    connection = get_connection()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM licencias")
        licencias = cursor.fetchall()

        if not licencias:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontraron licencias"
            )

        return {"licencias": licencias}
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

@router.post("/seleccionar_licencia", status_code=status.HTTP_200_OK)
def seleccionar_licencia(id_empresa: int, id_licencia: int, usuario=Depends(verify_token)):
    connection = get_connection()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO suscripciones (id_empresa, id_licencia, fecha_inicio, fecha_fin, activa) VALUES (%s, %s, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1)",
                    (id_empresa, id_licencia))
        connection.commit()
                
        return (
            {"message": "Licencia seleccionada exitosamente"}
        )
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