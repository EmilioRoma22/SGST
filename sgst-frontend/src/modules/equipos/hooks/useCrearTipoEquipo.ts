import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { equiposService } from "../services/equipos.service"
import type { CrearTipoEquipoDTO } from "../types/equipo.types"
import type { ErrorApi } from "../../auth/types/auth.types"
import { mostrarToast } from "../../../helpers/toast"
import { TIPOS_EQUIPO_QUERY_KEY } from "./useTiposEquipo"

export function useCrearTipoEquipo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CrearTipoEquipoDTO) => equiposService.crearTipo(datos),
    onSuccess: (respuesta) => {
      mostrarToast.success(respuesta.data.message)
      queryClient.invalidateQueries({ queryKey: TIPOS_EQUIPO_QUERY_KEY })
    },
    onError: (error: AxiosError<ErrorApi>) => {
      const mensaje =
        error.response?.data?.error?.message ||
        "Error al crear el tipo de equipo"
      mostrarToast.error(mensaje)
    },
  })
}
