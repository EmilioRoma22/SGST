import React, { useState } from "react"
import {
  ICONO_OJO_ABIERTO,
  ICONO_OJO_CERRADO,
  ESTILO_INPUT,
  ESTILO_ETIQUETA,
  ESTILO_BOTON_SUBMIT,
  ESTILO_BOTON_OJO,
} from "../helpers/auth.estilos"
import { useRegistro } from "../hooks/useRegistro"
import { mostrarToast } from "../../../helpers/toast"

function FormularioRegistro() {
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false)

  const [datosRegistro, setDatosRegistro] = useState({
    nombre_usuario: "",
    apellidos_usuario: "",
    correo_usuario: "",
    telefono_usuario: "",
    password_usuario: "",
    confirmar_password_usuario: "",
  })

  const registroMutation = useRegistro()

  const handleCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDatosRegistro((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (datosRegistro.password_usuario !== datosRegistro.confirmar_password_usuario) {
      mostrarToast.warning("Las contraseñas no coinciden")
      return
    }
    registroMutation.mutate(datosRegistro)
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Completa el formulario para registrarte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="registro-nombre" className={ESTILO_ETIQUETA}>
              Nombre
            </label>
            <input
              id="registro-nombre"
              type="text"
              name="nombre_usuario"
              value={datosRegistro.nombre_usuario}
              onChange={handleCambio}
              placeholder="Juan"
              className={ESTILO_INPUT}
              required
              autoComplete="given-name"
              disabled={registroMutation.isPending}
            />
          </div>
          <div>
            <label htmlFor="registro-apellidos" className={ESTILO_ETIQUETA}>
              Apellidos
            </label>
            <input
              id="registro-apellidos"
              type="text"
              name="apellidos_usuario"
              value={datosRegistro.apellidos_usuario}
              onChange={handleCambio}
              placeholder="Pérez García"
              className={ESTILO_INPUT}
              required
              autoComplete="family-name"
              disabled={registroMutation.isPending}
            />
          </div>
        </div>

        <div>
          <label htmlFor="registro-correo" className={ESTILO_ETIQUETA}>
            Correo electrónico
          </label>
          <input
            id="registro-correo"
            type="email"
            name="correo_usuario"
            value={datosRegistro.correo_usuario}
            onChange={handleCambio}
            placeholder="correo@ejemplo.com"
            className={ESTILO_INPUT}
            required
            autoComplete="email"
            disabled={registroMutation.isPending}
          />
        </div>

        <div>
          <label htmlFor="registro-telefono" className={ESTILO_ETIQUETA}>
            Teléfono
          </label>
          <input
            id="registro-telefono"
            type="tel"
            name="telefono_usuario"
            value={datosRegistro.telefono_usuario}
            onChange={handleCambio}
            placeholder="+34 612 345 678"
            className={ESTILO_INPUT}
            autoComplete="tel"
            disabled={registroMutation.isPending}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="registro-password" className={ESTILO_ETIQUETA}>
              Contraseña
            </label>
            <div className="relative">
              <input
                id="registro-password"
                type={mostrarContrasena ? "text" : "password"}
                name="password_usuario"
                value={datosRegistro.password_usuario}
                onChange={handleCambio}
                placeholder="••••••••"
                className={`${ESTILO_INPUT} pr-12`}
                required
                autoComplete="new-password"
                disabled={registroMutation.isPending}
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
          <div>
            <label htmlFor="registro-confirmar" className={ESTILO_ETIQUETA}>
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="registro-confirmar"
                type={mostrarConfirmarContrasena ? "text" : "password"}
                name="confirmar_password_usuario"
                value={datosRegistro.confirmar_password_usuario}
                onChange={handleCambio}
                placeholder="••••••••"
                className={`${ESTILO_INPUT} pr-12`}
                required
                autoComplete="new-password"
                disabled={registroMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                className={ESTILO_BOTON_OJO}
                tabIndex={-1}
              >
                {mostrarConfirmarContrasena ? ICONO_OJO_CERRADO : ICONO_OJO_ABIERTO}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={registroMutation.isPending}
          className={ESTILO_BOTON_SUBMIT}
        >
          {registroMutation.isPending ? "Cargando..." : "Crear cuenta"}
        </button>
      </form>
    </>
  )
}

export default FormularioRegistro
