import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import { authService } from "../services/auth.service"
import type { DatosLogin, ErrorApi } from "../types/auth.types"
import { mostrarToast } from "../../../helpers/toast"

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (datos: DatosLogin) => authService.login(datos),
    onSuccess: (respuesta) => {
      mostrarToast.success(respuesta.data.message)
      navigate("/")
    },
    onError: (error: AxiosError<ErrorApi>) => {
      const mensaje =
        error.response?.data?.error?.message || "Hubo un error al iniciar sesión"
      mostrarToast.error(mensaje)
    },
  })
}
