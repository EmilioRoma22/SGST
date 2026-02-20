import { useQuery } from "@tanstack/react-query"
import { equiposService } from "../services/equipos.service"

export function useEquipo(id_equipo: number | null) {
  return useQuery({
    queryKey: ["equipo", id_equipo],
    queryFn: async () => {
      if (!id_equipo) return null
      const { data } = await equiposService.obtenerPorId(id_equipo)
      return data
    },
    enabled: !!id_equipo,
  })
}
