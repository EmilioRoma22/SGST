from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_connection
from app.auth.dependencies import verify_token
from typing import Optional
from datetime import datetime

router = APIRouter(
    prefix="/finanzas",
    tags=["Finanzas"]
)

@router.get("/obtener_ingresos", status_code=status.HTTP_200_OK)
def obtener_ingresos(
    id_taller: int, 
    fecha_inicio: Optional[str] = None, 
    fecha_fin: Optional[str] = None, 
    usuario = Depends(verify_token)
):
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        sql = """
            SELECT 
                p.id_pago,
                p.monto,
                p.metodo,
                p.fecha_pago,
                o.num_orden,
                c.nombre_cliente,
                c.apellidos_cliente
            FROM pagos p
            JOIN ordenes o ON p.id_orden = o.id_orden
            JOIN clientes c ON o.id_cliente = c.id_cliente
            WHERE p.id_taller = %s AND p.tipo_pago = 'liquidacion'
        """
        
        params = [id_taller]

        if fecha_inicio and fecha_fin:
            sql += " AND DATE(p.fecha_pago) BETWEEN %s AND %s"
            params.append(fecha_inicio)
            params.append(fecha_fin)
        
        sql += " ORDER BY p.fecha_pago DESC"

        cursor.execute(sql, tuple(params))
        transacciones = cursor.fetchall()

        total_ingresos = sum(t['monto'] for t in transacciones)
        
        ingresos_por_metodo = {}
        for t in transacciones:
            metodo = t['metodo'] or 'Desconocido'
            if metodo not in ingresos_por_metodo:
                ingresos_por_metodo[metodo] = 0
            ingresos_por_metodo[metodo] += t['monto']

        ingresos_por_fecha = {}
        for t in transacciones:
            fecha = t['fecha_pago'].strftime('%Y-%m-%d')
            if fecha not in ingresos_por_fecha:
                ingresos_por_fecha[fecha] = 0
            ingresos_por_fecha[fecha] += t['monto']
            
        chart_data = [
            {"fecha": fecha, "ingresos": monto} 
            for fecha, monto in sorted(ingresos_por_fecha.items())
        ]

        return {
            "total_ingresos": total_ingresos,
            "transacciones": transacciones,
            "ingresos_por_metodo": ingresos_por_metodo,
            "chart_data": chart_data
        }
    except Exception as err:
        print(f"Error en finanzas: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error al obtener finanzas"}
        )
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
