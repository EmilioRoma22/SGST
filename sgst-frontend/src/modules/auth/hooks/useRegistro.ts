import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import { authService } from "../services/auth.service"
import type { DatosRegistro, ErrorApi } from "../types/auth.types"
import { mostrarToast } from "../../../helpers/toast"

export function useRegistro() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (datos: DatosRegistro) => authService.registro(datos),
    onSuccess: (respuesta) => {
      mostrarToast.success(respuesta.data.message)
      navigate("/login")
    },
    onError: (error: AxiosError<ErrorApi>) => {
      const mensaje =
        error.response?.data?.error?.message || "Hubo un error al registrarse"
      mostrarToast.error(mensaje)
    },
  })
}
