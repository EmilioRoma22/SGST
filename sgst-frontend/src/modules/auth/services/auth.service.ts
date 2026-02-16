import cliente from "../../../api/cliente"
import type { DatosLogin, DatosRegistro, RespuestaApi } from "../types/auth.types"

export const authService = {
  login: (datos: DatosLogin) =>
    cliente.post<RespuestaApi>("/auth/login", datos),

  registro: (datos: DatosRegistro) =>
    cliente.post<RespuestaApi>("/auth/registro", datos),
}
