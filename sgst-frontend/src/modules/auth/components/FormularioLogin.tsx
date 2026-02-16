import React, { useState } from "react"
import {
  ICONO_OJO_ABIERTO,
  ICONO_OJO_CERRADO,
  ESTILO_INPUT,
  ESTILO_ETIQUETA,
  ESTILO_BOTON_SUBMIT,
  ESTILO_BOTON_OJO,
} from "../helpers/auth.estilos"
import { useLogin } from "../hooks/useLogin"

function FormularioLogin() {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  const [datosLogin, setDatosLogin] = useState({
    correo_usuario: "",
    password_usuario: "",
  })

  const loginMutation = useLogin()

  const handleCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDatosLogin((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    loginMutation.mutate(datosLogin)
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Iniciar sesión</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-correo" className={ESTILO_ETIQUETA}>
            Correo electrónico
          </label>
          <input
            id="login-correo"
            type="email"
            name="correo_usuario"
            value={datosLogin.correo_usuario}
            onChange={handleCambio}
            placeholder="correo@ejemplo.com"
            className={ESTILO_INPUT}
            required
            autoComplete="email"
            disabled={loginMutation.isPending}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={ESTILO_ETIQUETA}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={mostrarContrasena ? "text" : "password"}
              name="password_usuario"
              value={datosLogin.password_usuario}
              onChange={handleCambio}
              placeholder="••••••••"
              className={`${ESTILO_INPUT} pr-12`}
              required
              autoComplete="current-password"
              disabled={loginMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              className={ESTILO_BOTON_OJO}
              tabIndex={-1}
            >
              {mostrarContrasena ? ICONO_OJO_CERRADO : ICONO_OJO_ABIERTO}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={ESTILO_BOTON_SUBMIT}
        >
          {loginMutation.isPending ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
    </>
  )
}

export default FormularioLogin
