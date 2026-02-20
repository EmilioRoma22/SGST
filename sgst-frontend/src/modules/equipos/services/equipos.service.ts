import cliente from "../../../api/cliente"
import type {
  EquipoDTO,
  TipoEquipoDTO,
  CrearEquipoDTO,
  ActualizarEquipoDTO,
  CrearTipoEquipoDTO,
  ActualizarTipoEquipoDTO,
  RespuestaListaEquipos,
  RespuestaCrearEquipo,
  RespuestaActualizarEquipo,
  RespuestaEliminarEquipo,
  RespuestaCrearTipoEquipo,
  RespuestaActualizarTipoEquipo,
  RespuestaEliminarTipoEquipo,
} from "../types/equipo.types"

interface ParametrosListaEquipos {
  page?: number
  limit?: number
  order_by?: string
  order_dir?: "ASC" | "DESC"
  search?: string
  id_tipo?: number
}

export const equiposService = {
  listar: (params?: ParametrosListaEquipos) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.order_by) queryParams.append("order_by", params.order_by)
    if (params?.order_dir) queryParams.append("order_dir", params.order_dir)
    if (params?.search) queryParams.append("search", params.search)
    if (params?.id_tipo != null) queryParams.append("id_tipo", params.id_tipo.toString())

    const queryString = queryParams.toString()
    const url = `/equipos${queryString ? `?${queryString}` : ""}`
    return cliente.get<RespuestaListaEquipos>(url)
  },

  obtenerPorId: (id_equipo: number) =>
    cliente.get<EquipoDTO>(`/equipos/${id_equipo}`),

  crear: (datos: CrearEquipoDTO) =>
    cliente.post<RespuestaCrearEquipo>("/equipos", datos),

  actualizar: (id_equipo: number, datos: ActualizarEquipoDTO) =>
    cliente.put<RespuestaActualizarEquipo>(`/equipos/${id_equipo}`, datos),

  eliminar: (id_equipo: number) =>
    cliente.delete<RespuestaEliminarEquipo>(`/equipos/${id_equipo}`),

  listarTipos: () => cliente.get<TipoEquipoDTO[]>("/equipos/tipos"),

  crearTipo: (datos: CrearTipoEquipoDTO) =>
    cliente.post<RespuestaCrearTipoEquipo>("/equipos/tipos", datos),

  actualizarTipo: (id_tipo: number, datos: ActualizarTipoEquipoDTO) =>
    cliente.put<RespuestaActualizarTipoEquipo>(`/equipos/tipos/${id_tipo}`, datos),

  eliminarTipo: (id_tipo: number) =>
    cliente.delete<RespuestaEliminarTipoEquipo>(`/equipos/tipos/${id_tipo}`),
}
