export interface TipoEquipoDTO {
  id_tipo: number
  id_taller: string
  nombre_tipo: string
  activo: number
  fecha_creacion: string
}

export interface EquipoDTO {
  id_equipo: number
  id_taller: string
  id_tipo: number
  num_serie: string
  marca_equipo: string | null
  modelo_equipo: string | null
  descripcion_equipo: string | null
  activo: number
  fecha_registro: string
  ultima_actualizacion: string | null
  nombre_tipo?: string | null
}

export interface CrearEquipoDTO {
  id_tipo: number
  num_serie: string
  marca_equipo?: string | null
  modelo_equipo?: string | null
  descripcion_equipo?: string | null
}

export interface ActualizarEquipoDTO {
  id_tipo?: number
  num_serie?: string
  marca_equipo?: string | null
  modelo_equipo?: string | null
  descripcion_equipo?: string | null
}

export interface CrearTipoEquipoDTO {
  nombre_tipo: string
}

export interface ActualizarTipoEquipoDTO {
  nombre_tipo?: string
}

export interface RespuestaListaEquipos {
  data: EquipoDTO[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface RespuestaCrearEquipo {
  message: string
  equipo: EquipoDTO
}

export interface RespuestaActualizarEquipo {
  message: string
  equipo: EquipoDTO
}

export interface RespuestaEliminarEquipo {
  message: string
}

export interface RespuestaCrearTipoEquipo {
  message: string
  tipo: TipoEquipoDTO
}

export interface RespuestaActualizarTipoEquipo {
  message: string
  tipo: TipoEquipoDTO
}

export interface RespuestaEliminarTipoEquipo {
  message: string
}
