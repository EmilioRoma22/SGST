import axios from "axios"

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _reintentado?: boolean
  }
}

const URL_BASE = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_PREFIX}`

const RUTAS_SIN_REFRESH = [
  "/auth/login",
  "/auth/registro",
  "/auth/refresh",
  "/auth/logout",
]

const cliente = axios.create({
  baseURL: URL_BASE,
  withCredentials: true,
})

let promesaRefresco: Promise<void> | null = null

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const configOriginal = error.config

    const esRutaExcluida = RUTAS_SIN_REFRESH.some((ruta) =>
      configOriginal?.url?.includes(ruta)
    )

    if (
      error.response?.status !== 401 ||
      configOriginal?._reintentado ||
      esRutaExcluida
    ) {
      return Promise.reject(error)
    }

    configOriginal._reintentado = true

    if (!promesaRefresco) {
      promesaRefresco = axios
        .post(`${URL_BASE}/auth/refresh`, null, { withCredentials: true })
        .then(() => {})
        .finally(() => {
          promesaRefresco = null
        })
    }

    try {
      await promesaRefresco
      return cliente(configOriginal)
    } catch {
      window.location.href = "/login"
      return Promise.reject(error)
    }
  }
)

export default cliente
