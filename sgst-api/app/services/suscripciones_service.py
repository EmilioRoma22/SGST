from typing import List
from datetime import date
from app.models.suscripcion import LicenciaDTO, SuscripcionDTO, VerificacionSuscripcionDTO
from app.models.usuarios import UsuarioDTO
from app.repositories.suscripciones_repository import SuscripcionesRepository
from app.repositories.licencias_repository import LicenciasRepository
from app.repositories.talleres_repository import TalleresRepository
from app.core.exceptions import (
    LicenciaNoEncontradaException,
    EmpresaYaTieneSuscripcionActivaException,
    EmpresaSinSuscripcionException,
)
from datetime import timedelta

class SuscripcionesService:
    def __init__(self, bd):
        self.bd = bd
        self.suscripciones_repository = SuscripcionesRepository(self.bd)
        self.licencias_repository = LicenciasRepository(self.bd)
        self.talleres_repository = TalleresRepository(self.bd)

    def verificar_suscripcion(self, usuario: UsuarioDTO, id_taller_actual: str | None) -> VerificacionSuscripcionDTO:
        id_empresa = usuario.id_empresa

        if not id_empresa and id_taller_actual:
            id_empresa = self.talleres_repository.obtener_id_empresa_por_taller(id_taller_actual)

        if not id_empresa:
            return VerificacionSuscripcionDTO(tiene_suscripcion=False)

        suscripcion = self.suscripciones_repository.obtener_suscripcion_activa_por_empresa(id_empresa)

        if not suscripcion:
            return VerificacionSuscripcionDTO(tiene_suscripcion=False)

        return VerificacionSuscripcionDTO(
            tiene_suscripcion=True,
            id_licencia=suscripcion.id_licencia,
        )

    def listar_licencias(self) -> List[LicenciaDTO]:
        return self.licencias_repository.listar_licencias_activas()

    def crear_suscripcion(self, usuario: UsuarioDTO, precio_mensual: str) -> SuscripcionDTO:
        if not usuario.id_empresa:
            raise EmpresaSinSuscripcionException()

        id_licencia = self.licencias_repository.obtener_id_licencia_por_precio_mensual(precio_mensual)
        if not id_licencia:
            raise LicenciaNoEncontradaException()

        suscripcion_existente = self.suscripciones_repository.obtener_suscripcion_activa_por_empresa(usuario.id_empresa)
        if suscripcion_existente:
            raise EmpresaYaTieneSuscripcionActivaException()

        fecha_fin = date.today() + timedelta(days=365)
        
        self.suscripciones_repository.create(
            data={
                "id_empresa": usuario.id_empresa,
                "id_licencia": id_licencia,
                "fecha_fin": fecha_fin,
                "activa": 1,
            },
        )
