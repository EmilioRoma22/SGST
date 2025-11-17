from fastapi import APIRouter, status, Depends, HTTPException
from app.auth.dependencies import verify_token
from app.core.database import get_connection
from app.models.modelo_taller import CrearTaller
import mysql.connector

router = APIRouter(prefix="/talleres", tags=["Talleres"])

@router.get("/obtener_taller", status_code=status.HTTP_200_OK)
def obtener_taller(id_taller: int, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM talleres WHERE id_taller = %s", (id_taller, ))
        taller = cursor.fetchone()
        
        return { "taller": taller }
    except mysql.connector.Error as err:
        print(f"Error en /obtener_talleres: {err}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": "Error interno en el servidor"})
    finally:
        connection.close()
        cursor.close()
@router.get("/obtener_talleres", status_code=status.HTTP_200_OK)
def obtener_talleres(id_empresa: int, usuario=Depends(verify_token)):
    connection = get_connection()    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM talleres WHERE id_empresa = %s", (id_empresa,))
        talleres = cursor.fetchall()
        
        return{
            "talleres": talleres
        }
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        cursor.close()
        connection.close()

@router.post("/crear_taller", status_code=status.HTTP_201_CREATED)
def crear_taller(id_empresa: int, datos_taller: CrearTaller, usuario=Depends(verify_token)):
    connection = get_connection()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )
    
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO talleres (id_empresa, nombre_taller, telefono_taller, correo_taller, direccion_taller, rfc_taller) VALUES (%s, %s, %s, %s, %s, %s)",
            (id_empresa, datos_taller.nombre_taller, datos_taller.telefono_taller, datos_taller.correo_taller, datos_taller.direccion_taller, datos_taller.rfc_taller)
        )
        cursor.execute("INSERT INTO usuarios_talleres (id_usuario, id_taller, rol_taller) VALUES (%s, %s, 'ADMIN')", 
                       (usuario['id_usuario'], cursor.lastrowid))

        connection.commit()
        
        return {
            "message": "Taller creado exitosamente",
            "id_taller": cursor.lastrowid
        }
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        cursor.close()
        connection.close()

@router.get("/obtener_usuarios_taller", status_code=status.HTTP_200_OK)
def obtener_usuarios_taller(id_taller: int, usuario=Depends(verify_token)):
    connection = get_connection()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
                       SELECT
                        u.id_usuario,
                        u.nombre_usuario,
                        u.apellidos_usuario,
                        u.correo_usuario,
                        t.id_taller,
                        ut.rol_taller
                    FROM usuarios_talleres ut
                    JOIN usuarios u ON u.id_usuario = ut.id_usuario
                    JOIN talleres t ON t.id_taller = ut.id_taller
                    WHERE ut.id_taller = %s;
                    """, (id_taller,))
        usuarios = cursor.fetchall()
        
        return {"usuarios": usuarios}
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        cursor.close()
        connection.close()