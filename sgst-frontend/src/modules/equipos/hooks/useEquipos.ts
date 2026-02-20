import { useQuery } from "@tanstack/react-query"
import { equiposService } from "../services/equipos.service"

export const EQUIPOS_QUERY_KEY = ["equipos"]

interface UseEquiposParams {
  page?: number
  limit?: number
  order_by?: string
  order_dir?: "ASC" | "DESC"
  search?: string
  id_tipo?: number
}

export function useEquipos(params?: UseEquiposParams) {
  return useQuery({
    queryKey: [...EQUIPOS_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await equiposService.listar(params)
      return data
    },
  })
}
