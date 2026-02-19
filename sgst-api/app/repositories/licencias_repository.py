from decimal import Decimal
from typing import List
from app.repositories.base_repository import BaseRepository
from app.models.suscripcion import LicenciaDTO

class LicenciasRepository(BaseRepository):
    table_name = "licencias"

    def listar_licencias_activas(self) -> List[LicenciaDTO]:
        query = f"""SELECT nombre_licencia, descripcion,
                           precio_mensual, precio_anual, max_talleres, max_usuarios
                    FROM {self.table_name}
                    WHERE activo = 1"""
        self.execute(query, ())
        licencias = self.cursor.fetchall()
        return [
            LicenciaDTO(
                nombre_licencia=lic["nombre_licencia"],
                descripcion=lic.get("descripcion"),
                precio_mensual=str(lic["precio_mensual"]),
                precio_anual=str(lic["precio_anual"]),
                max_talleres=int(lic["max_talleres"]),
                max_usuarios=int(lic["max_usuarios"]),
            )
            for lic in licencias
        ]

    def obtener_id_licencia_por_precio_mensual(self, precio_mensual: str) -> str | None:
        query = f"""SELECT id_licencia FROM {self.table_name}
                    WHERE activo = 1 AND precio_mensual = %s"""
        self.execute(query, (Decimal(precio_mensual),))
        row = self.cursor.fetchone()
        return row["id_licencia"] if row else None

    def obtener_licencia_por_id(self, id_licencia: str) -> dict | None:
        query = f"""SELECT id_licencia, nombre_licencia, descripcion,
                           precio_mensual, precio_anual, max_talleres, max_usuarios
                    FROM {self.table_name}
                    WHERE id_licencia = %s AND activo = 1"""
        self.execute(query, (id_licencia,))
        return self.cursor.fetchone()
