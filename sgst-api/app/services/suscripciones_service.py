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

class SuscripcionesService:
    def __init__(self, bd):
        self.bd = bd
        self.suscripciones_repository = SuscripcionesRepository(self.bd)
        self.licencias_repository = LicenciasRepository(self.bd)
        self.talleres_repository = TalleresRepository(self.bd)

    def verificar_suscripcion(self, usuario: UsuarioDTO, id_taller_actual: str | None) -> VerificacionSuscripcionDTO:
        id_empresa = usuario.id_empresa

        if not id_empresa and id_taller_actual:
            try:
                id_empresa = self.talleres_repository.obtener_id_empresa_por_taller(int(id_taller_actual))
            except (ValueError, TypeError):
                id_empresa = None

        if not id_empresa:
            return VerificacionSuscripcionDTO(tiene_suscripcion=False)

        suscripcion = self.suscripciones_repository.obtener_suscripcion_activa_por_empresa(id_empresa)

        if not suscripcion:
            return VerificacionSuscripcionDTO(tiene_suscripcion=False)

        licencia = self.licencias_repository.obtener_licencia_por_id(suscripcion.id_licencia)

        return VerificacionSuscripcionDTO(
            tiene_suscripcion=True,
            suscripcion=suscripcion,
            licencia=licencia,
        )

    def listar_licencias(self) -> List[LicenciaDTO]:
        return self.licencias_repository.listar_licencias_activas()

    def crear_suscripcion(self, usuario: UsuarioDTO, id_licencia: int) -> SuscripcionDTO:
        if not usuario.id_empresa:
            raise EmpresaSinSuscripcionException()

        licencia = self.licencias_repository.obtener_licencia_por_id(id_licencia)
        if not licencia:
            raise LicenciaNoEncontradaException()

        suscripcion_existente = self.suscripciones_repository.obtener_suscripcion_activa_por_empresa(usuario.id_empresa)
        if suscripcion_existente:
            raise EmpresaYaTieneSuscripcionActivaException()

        id_suscripcion = self.suscripciones_repository.create(
            data={
                "id_empresa": usuario.id_empresa,
                "id_licencia": id_licencia,
                "activa": 1,
            },
            returning="id_suscripcion"
        )

        return SuscripcionDTO(
            id_suscripcion=id_suscripcion,
            id_empresa=usuario.id_empresa,
            id_licencia=id_licencia,
            fecha_inicio=date.today(),
            fecha_fin=None,
            activa=True,
        )
