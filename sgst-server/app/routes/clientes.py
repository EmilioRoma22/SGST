from fastapi import APIRouter, status, Depends, HTTPException
from app.auth.dependencies import verify_token
from app.core.database import get_connection
from mysql.connector import Error
from app.models.modelo_clientes import DataCrearCliente, DataModificarCliente

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router.get("/obtener_clientes", status_code=status.HTTP_200_OK)
def obtener_clientes(id_taller: int, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM clientes WHERE id_taller = %s", (id_taller, ))
        clientes = cursor.fetchall()
        
        return {"clientes": clientes}
    except Error as err:
        print(f"Error de MySQL: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error en la base de datos"}
        )
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

@router.post("/crear_cliente", status_code=status.HTTP_201_CREATED)
def crear_cliente(data_cliente: DataCrearCliente, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()
                
        cursor.execute("""
            SELECT 'correo' as tipo FROM clientes 
            WHERE correo_cliente = %s AND id_taller = %s
            UNION
            SELECT 'telefono' as tipo FROM clientes 
            WHERE telefono_cliente = %s AND id_taller = %s
        """, (data_cliente.correo_cliente, data_cliente.id_taller, 
            data_cliente.telefono_cliente, data_cliente.id_taller))

        resultados = cursor.fetchall()
        errores = [fila[0] for fila in resultados]

        if 'correo' in errores:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "Ya existe un cliente con el correo ingresado"})
        if 'telefono' in errores:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "Ya existe un cliente con el telefono ingresado"})
                        
        cursor.execute("""
                       INSERT INTO clientes 
                       (
                            id_taller, 
                            nombre_cliente, 
                            apellidos_cliente, 
                            correo_cliente, 
                            telefono_cliente, 
                            direccion_cliente, 
                            notas_cliente
                       )
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                       (
                           data_cliente.id_taller,
                           data_cliente.nombre_cliente,
                           data_cliente.apellidos_cliente,
                           data_cliente.correo_cliente,
                           data_cliente.telefono_cliente,
                           data_cliente.direccion_cliente,
                           data_cliente.notas_cliente
                       )
        )

        connection.commit()
    
        return {"message": "Se ha creado el cliente correctamente"}
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

@router.put("/modificar_cliente", status_code=status.HTTP_200_OK)
def modificar_cliente(data_cliente: DataModificarCliente, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()
                        
        cursor.execute("""
            SELECT 'correo' as tipo FROM clientes 
            WHERE correo_cliente = %s AND id_taller = %s AND id_cliente != %s
            UNION
            SELECT 'telefono' as tipo FROM clientes 
            WHERE telefono_cliente = %s AND id_taller = %s AND id_cliente != %s
        """, (
            data_cliente.correo_cliente, data_cliente.id_taller, data_cliente.id_cliente,
            data_cliente.telefono_cliente, data_cliente.id_taller, data_cliente.id_cliente
            )
        )

        resultados = cursor.fetchall()
        errores = [fila[0] for fila in resultados]

        if 'correo' in errores:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "Ya existe un cliente con el correo ingresado"})
        if 'telefono' in errores:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "Ya existe un cliente con el telefono ingresado"})
        
        cursor.execute("""
            UPDATE 
                clientes 
            SET
                nombre_cliente = %s, 
                apellidos_cliente = %s, 
                correo_cliente = %s, 
                telefono_cliente = %s, 
                direccion_cliente = %s, 
                notas_cliente = %s
            WHERE
                id_cliente = %s AND id_taller = %s
        """, (
            data_cliente.nombre_cliente,
            data_cliente.apellidos_cliente,
            data_cliente.correo_cliente,
            data_cliente.telefono_cliente,
            data_cliente.direccion_cliente,
            data_cliente.notas_cliente,
            data_cliente.id_cliente,
            data_cliente.id_taller
        ))
        
        if cursor.rowcount == 0:
            return {"message": "La operación fue existosa, pero no se realizaron cambios"}
        
        connection.commit()
        
        return {"message": "El cliente ha sido modificado correctamente"}
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

@router.delete("/eliminar_cliente", status_code=status.HTTP_200_OK)
def eliminar_cliente(id_cliente: int, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("DELETE FROM clientes WHERE id_cliente = %s", (id_cliente, ))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"error": "Hubo un error al eliminar el cliente"})
        
        connection.commit()
        
        return {"message", "El usuario ha sido eliminado correctamente"}
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

@router.get("/obtener_ultimo_cliente", status_code=status.HTTP_200_OK)
def obtener_ultimo_cliente(usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM clientes ORDER BY id_cliente DESC LIMIT 1")
        cliente = cursor.fetchone()
        
        return {
            "cliente": cliente
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