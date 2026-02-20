import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { equiposService } from "../services/equipos.service"
import type { CrearEquipoDTO } from "../types/equipo.types"
import type { ErrorApi } from "../../auth/types/auth.types"
import { mostrarToast } from "../../../helpers/toast"
import { EQUIPOS_QUERY_KEY } from "./useEquipos"

export function useCrearEquipo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: CrearEquipoDTO) => equiposService.crear(datos),
    onSuccess: (respuesta) => {
      mostrarToast.success(respuesta.data.message)
      queryClient.invalidateQueries({ queryKey: EQUIPOS_QUERY_KEY })
    },
    onError: (error: AxiosError<ErrorApi>) => {
      const mensaje =
        error.response?.data?.error?.message || "Error al crear el equipo"
      mostrarToast.error(mensaje)
    },
  })
}
