import { useQuery } from "@tanstack/react-query"
import { equiposService } from "../services/equipos.service"

export const TIPOS_EQUIPO_QUERY_KEY = ["equipos", "tipos"]

export function useTiposEquipo() {
  return useQuery({
    queryKey: TIPOS_EQUIPO_QUERY_KEY,
    queryFn: async () => {
      const { data } = await equiposService.listarTipos()
      return data
    },
  })
}
