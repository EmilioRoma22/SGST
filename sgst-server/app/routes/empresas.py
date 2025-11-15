from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from app.auth.dependencies import verify_token
from datetime import datetime, timedelta, timezone
from app.models.modelo_empresa import DatosCrearEmpresa
from app.core.database import get_connection
from app.auth.jwt_handler import crear_token
import mysql.connector

router = APIRouter(prefix="/empresas", tags=["Empresas"])

@router.post("/crear", status_code=status.HTTP_200_OK)
def crear_empresa(datos_empresa: DatosCrearEmpresa, usuario=Depends(verify_token)):
    connection = get_connection()    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )

    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM empresas WHERE nombre_empresa = %s", (datos_empresa.nombre_empresa,))
        nombre_existente = cursor.fetchone()

        if nombre_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Ya existe una empresa con ese nombre"}
            )
        
        cursor.execute("SELECT * FROM empresas WHERE rfc_empresa = %s", (datos_empresa.rfc_empresa,))
        rfc_existente = cursor.fetchone()
        
        if rfc_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Este RFC ya está registrado"}
            )
        
        cursor.execute("SELECT * FROM empresas WHERE telefono_empresa = %s", (datos_empresa.telefono_empresa,))
        telefono_existente = cursor.fetchone()
        
        if telefono_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Este teléfono ya está registrado."}
            )
        
        cursor.execute("SELECT * FROM empresas WHERE correo_empresa = %s", (datos_empresa.correo_empresa,))
        correo_existente = cursor.fetchone()
        
        if correo_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Este correo ya está registrado."}
            )
        
        cursor.execute("INSERT INTO empresas (id_creador, nombre_empresa, rfc_empresa, telefono_empresa, correo_empresa, direccion_empresa) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (usuario["id_usuario"], datos_empresa.nombre_empresa, datos_empresa.rfc_empresa, datos_empresa.telefono_empresa, datos_empresa.correo_empresa, datos_empresa.direccion_empresa)
                    )
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "Hubo un problema al registrar la empresa, intentelo más tarde, disculpa las molestias."}
            )
        
        id_empresa = cursor.lastrowid
        
        cursor.execute("UPDATE usuarios SET id_empresa = %s WHERE id_usuario = %s", (id_empresa, usuario["id_usuario"]))
        connection.commit()
        
        cursor.execute(
            "SELECT id_usuario, id_empresa, nombre_usuario, apellidos_usuario, correo_usuario FROM usuarios WHERE id_usuario = %s",
            (usuario["id_usuario"],)
        )
        usuario_actualizado = cursor.fetchone()

        nuevo_access_token = crear_token(usuario_actualizado, minutos=10)

        response = JSONResponse({
            "message": "La empresa se ha creado correctamente",
            "id_empresa": id_empresa
        })

        response.set_cookie(
            key="access_token",
            value=nuevo_access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=10 * 60,
            path="/"
        )

        return response
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        cursor.close()
        connection.close()