import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { equiposService } from "../services/equipos.service"
import type { ActualizarEquipoDTO } from "../types/equipo.types"
import type { ErrorApi } from "../../auth/types/auth.types"
import { mostrarToast } from "../../../helpers/toast"
import { EQUIPOS_QUERY_KEY } from "./useEquipos"

export function useActualizarEquipo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id_equipo,
      datos,
    }: {
      id_equipo: number
      datos: ActualizarEquipoDTO
    }) => equiposService.actualizar(id_equipo, datos),
    onSuccess: (respuesta) => {
      mostrarToast.success(respuesta.data.message)
      queryClient.invalidateQueries({ queryKey: EQUIPOS_QUERY_KEY })
    },
    onError: (error: AxiosError<ErrorApi>) => {
      const mensaje =
        error.response?.data?.error?.message || "Error al actualizar el equipo"
      mostrarToast.error(mensaje)
    },
  })
}
