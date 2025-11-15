import os
from datetime import datetime, timedelta, timezone
import secrets
from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from app.core.database import get_connection
from app.models.modelo_usuario import RegistroUsuario, LoginUsuario
from app.auth.cifrado_polybios import cifrar_mensaje_polybios
import mysql.connector
import bcrypt
from app.auth.jwt_handler import crear_token
from app.auth.dependencies import verify_token, obtener_payload

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router.get("/me")
def obtener_usuario_actual(payload = Depends(obtener_payload)):
    usuario_info = {
        "id_usuario": payload["id_usuario"],
        "id_empresa": payload["id_empresa"],
        "nombre_usuario": payload["nombre_usuario"],
        "apellidos_usuario": payload["apellidos_usuario"],
        "correo_usuario": payload["correo_usuario"],
    }

    return {"usuario": usuario_info}
    
@router.post("/refresh")
def refresh_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No hay token de actualización")

    connection = get_connection()

    try:
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error de conexión con la base de datos"
            )

        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM refresh_tokens WHERE token = %s AND valido = 1", (refresh_token,))
        existe = cursor.fetchone()

        if not existe:
            raise HTTPException(status_code=401, detail="Refresh token inválido o revocado")

        if existe["expira_en"] < datetime.now():
            cursor.execute("UPDATE refresh_tokens SET valido = 0 WHERE id_token = %s", (existe["id_token"],))
            connection.commit()
            raise HTTPException(status_code=401, detail="Refresh token expirado")

        cursor.execute("SELECT id_usuario, id_empresa, nombre_usuario, apellidos_usuario, correo_usuario FROM usuarios WHERE id_usuario = %s", (existe["id_usuario"],))
        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        cursor.execute("UPDATE refresh_tokens SET valido = 0 WHERE id_token = %s", (existe["id_token"],))

        nuevo_refresh = secrets.token_urlsafe(64)
        expira = datetime.now() + timedelta(days=1)

        cursor.execute("INSERT INTO refresh_tokens (id_usuario, token, expira_en) VALUES (%s, %s, %s)", (usuario["id_usuario"], nuevo_refresh, expira))
        connection.commit()

        nuevo_access = crear_token(usuario, minutos=10)

        response = JSONResponse(content={"message": "Token actualizado correctamente"})

        response.set_cookie(
            key="access_token",
            value=nuevo_access,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 15,
            path="/"
        )

        response.set_cookie(
            key="refresh_token",
            value=nuevo_refresh,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24,
            path="/"
        )

        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en /refresh: {e}")
        raise HTTPException(status_code=500, detail="Error interno en refresh token")
    finally:
        if connection:
            connection.close()

@router.post("/iniciar_sesion", status_code=status.HTTP_200_OK)
def login_user(info_usuario: LoginUsuario):
    connection = get_connection()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error de conexión con la base de datos"
        )

    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute(
                "SELECT * FROM usuarios WHERE correo_usuario = %s", 
                (info_usuario.correo_usuario,)
            )
            usuario = cursor.fetchone()

        if not usuario or not bcrypt.checkpw(cifrar_mensaje_polybios(info_usuario.password_usuario).encode('utf-8'), usuario['hash_password'].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Correo o contraseña incorrectos"}
            )

        if not usuario["activo"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "La cuenta está desactivada, comuníquese con el administrador de su empresa"}
            )

        rol_en_taller = False
        taller = None
        rol_taller = None

        if not usuario["id_empresa"]:
            with connection.cursor(dictionary=True) as cursor_ut:
                cursor_ut.execute(
                    "SELECT * FROM usuarios_talleres WHERE id_usuario = %s", 
                    (usuario["id_usuario"],)
                )
                resp = cursor_ut.fetchone()

            if resp:
                rol_en_taller = True
                rol_taller = resp["rol_taller"]
                with connection.cursor(dictionary=True) as cursor_t:
                    cursor_t.execute(
                        "SELECT * FROM talleres WHERE id_taller = %s", 
                        (resp["id_taller"],)
                    )
                    taller = cursor_t.fetchone()
                    taller = jsonable_encoder(taller)
        
        access_token = crear_token(usuario, minutos=10)
        _refresh_token = secrets.token_urlsafe(64)

        content = {
            "message": "Inicio de sesión exitoso",
            "usuario": {
                "id_usuario": usuario["id_usuario"],
                "id_empresa": usuario["id_empresa"] or 0,
                "nombre_usuario": usuario["nombre_usuario"],
                "apellidos_usuario": usuario["apellidos_usuario"],
                "correo_usuario": usuario["correo_usuario"],
                "rol_en_taller": rol_en_taller,
                "taller": taller,
                "rol": rol_taller
            }
        }
        
        response = JSONResponse(
            content=content
        )
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=10 * 60,
            path="/"
        )

        response.set_cookie(
            key="refresh_token",
            value=_refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=24 * 60 * 60,
            path="/"
        )

        return response
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno del servidor"}
        )
    finally:
        connection.close()

@router.post("/cerrar_sesion", status_code=200)
def cerrar_sesion(request: Request):
    try:
        refresh_token = request.cookies.get("refresh_token")

        if refresh_token:
            connection = get_connection()
            cursor = connection.cursor()

            cursor.execute(
                "UPDATE refresh_tokens SET valido = 0 WHERE token = %s", 
                (refresh_token,)
            )
            connection.commit()
            cursor.close()
            connection.close()

        response = JSONResponse({"mensaje": "Sesión cerrada exitosamente"})

        response.delete_cookie(
            key="access_token",
            httponly=True,
            secure=True,
            samesite="strict"
        )

        response.delete_cookie(
            key="refresh_token",
            httponly=True,
            secure=True,
            samesite="strict"
        )

        return response

    except Exception as e:
        print("Error en logout:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    
@router.post("/registrar_usuario", status_code=status.HTTP_201_CREATED)
def register_user(usuario: RegistroUsuario):
    connection = get_connection()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error de conexión con la base de datos"}
        )

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE correo_usuario = %s", (usuario.correo_usuario,))
        existe_usuario = cursor.fetchone()
        cursor.execute("SELECT * FROM usuarios WHERE telefono_usuario = %s", (usuario.telefono_usuario,))
        existe_telefono = cursor.fetchone()

        if existe_usuario:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "El correo ya está registrado"}
            )
        if existe_telefono:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "El teléfono ya está registrado"}
            )
        
        hashed_password = bcrypt.hashpw(cifrar_mensaje_polybios(usuario.password_usuario).encode('utf-8'), bcrypt.gensalt())

        insert_query = """
            INSERT INTO usuarios (id_empresa, nombre_usuario, apellidos_usuario, correo_usuario, telefono_usuario, hash_password)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            None,
            usuario.nombre_usuario,
            usuario.apellidos_usuario,
            usuario.correo_usuario,
            usuario.telefono_usuario,
            hashed_password.decode('utf-8')
        ))
        connection.commit()

        return {"message": "Su registro ha sido existoso, inicie sesión"}
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        cursor.close()
        connection.close()
        
@router.post("/crear_usuario_taller", status_code=status.HTTP_201_CREATED)
def crear_usuario_taller(id_taller: int, rol: int, info_usuario: RegistroUsuario,usuario=Depends(verify_token)):
    connection = get_connection()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error de conexión con la base de datos"}
        )

    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE correo_usuario = %s", (info_usuario.correo_usuario,))
        existing_user = cursor.fetchone()
        cursor.execute("SELECT * FROM usuarios WHERE telefono_usuario = %s", (info_usuario.telefono_usuario,))
        existing_phone = cursor.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "El correo ya está registrado"}
            )
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "El teléfono ya está registrado"}
            )

        hashed_password = bcrypt.hashpw(info_usuario.password_usuario.encode('utf-8'), bcrypt.gensalt())

        insert_query = """
            INSERT INTO usuarios (nombre_usuario, apellidos_usuario, correo_usuario, telefono_usuario, hash_password)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            info_usuario.nombre_usuario,
            info_usuario.apellidos_usuario,
            info_usuario.correo_usuario,
            info_usuario.telefono_usuario,
            hashed_password.decode('utf-8')
        ))
        
        id_usuario = cursor.lastrowid
        
        rol_str = ""
        
        if rol == 1:
            rol_str = "ADMIN"
        if rol == 2:
            rol_str = "TECNICO"
        if rol == 3:
            rol_str = "RECEPCIONISTA"

        query_rol = "INSERT INTO usuarios_talleres (id_usuario, id_taller, rol_taller) VALUES (%s, %s, %s)"
        print(id_usuario, id_taller, rol_str)
        cursor.execute(query_rol, (id_usuario, id_taller, rol_str))

        connection.commit()

        return {"message": "Se ha registrado el usuario correctamente"}
    except mysql.connector.Error as e:
        print("Error en la base de datos:", e)
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        cursor.close()
        connection.close()