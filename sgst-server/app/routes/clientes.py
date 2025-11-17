from fastapi import APIRouter, status, Depends, HTTPException
from app.auth.dependencies import verify_token
from app.core.database import get_connection
from mysql.connector import Error
from app.models.modelo_clientes import DataCrearCliente

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
        print(f"Error interno: {err}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"error": "Error interno en el servidor"})
    finally:
        connection.close()
        cursor.close()

@router.post("/crear_cliente", status_code=status.HTTP_201_CREATED)
def crear_cliente(data_cliente: DataCrearCliente, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        print(data_cliente)
        
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
                            notas_cliente, 
                            activo
                       )
                       VALUES (%s, %s, %s, %s, %s, %s, %s, 1)""",
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
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"error": "No se ha podido crear el cliente"})

        connection.commit()
    
        return {"message": "Se ha creado el cliente correctamente"}
    except Error as err:
        print(f"Error en /crear_cliente: {err}")
        raise HTTPException(status_code=500, detail={"error": "Error interno del servidor"})
    finally:
        connection.close()
        cursor.close()