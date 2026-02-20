import React, { useState, useEffect } from "react"
import Modal from "../../../components/ui/Modal"
import { ESTILO_INPUT, ESTILO_ETIQUETA, ESTILO_BOTON_SUBMIT } from "../../auth/helpers/auth.estilos"
import SelectTipoEquipo from "./SelectTipoEquipo"
import type { CrearEquipoDTO } from "../types/equipo.types"

const estadoInicial: CrearEquipoDTO = {
  id_tipo: 0,
  num_serie: "",
  marca_equipo: null,
  modelo_equipo: null,
  descripcion_equipo: null,
}

interface ModalNuevoEquipoProps {
  open: boolean
  onClose: () => void
  onSubmit: (datos: CrearEquipoDTO) => void
  deshabilitado: boolean
}

function ModalNuevoEquipo({
  open,
  onClose,
  onSubmit,
  deshabilitado,
}: ModalNuevoEquipoProps) {
  const [datos, setDatos] = useState<CrearEquipoDTO>(estadoInicial)

  useEffect(() => {
    if (open) setDatos(estadoInicial)
  }, [open])

  const handleCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value === "" ? null : value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!datos.id_tipo) return
    onSubmit({
      ...datos,
      num_serie: datos.num_serie.trim(),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo equipo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectTipoEquipo
          value={datos.id_tipo || null}
          onChange={(id_tipo) => setDatos((prev) => ({ ...prev, id_tipo: id_tipo ?? 0 }))}
          disabled={deshabilitado}
          required
        />
        <div>
          <label htmlFor="modal-num_serie" className={ESTILO_ETIQUETA}>
            Número de serie <span className="text-red-400">*</span>
          </label>
          <input
            id="modal-num_serie"
            type="text"
            name="num_serie"
            value={datos.num_serie}
            onChange={handleCambio}
            placeholder="Ej. SN123456"
            className={ESTILO_INPUT}
            required
            maxLength={100}
            disabled={deshabilitado}
          />
        </div>
        <div>
          <label htmlFor="modal-marca_equipo" className={ESTILO_ETIQUETA}>
            Marca
          </label>
          <input
            id="modal-marca_equipo"
            type="text"
            name="marca_equipo"
            value={datos.marca_equipo ?? ""}
            onChange={handleCambio}
            placeholder="Opcional"
            className={ESTILO_INPUT}
            maxLength={100}
            disabled={deshabilitado}
          />
        </div>
        <div>
          <label htmlFor="modal-modelo_equipo" className={ESTILO_ETIQUETA}>
            Modelo
          </label>
          <input
            id="modal-modelo_equipo"
            type="text"
            name="modelo_equipo"
            value={datos.modelo_equipo ?? ""}
            onChange={handleCambio}
            placeholder="Opcional"
            className={ESTILO_INPUT}
            maxLength={100}
            disabled={deshabilitado}
          />
        </div>
        <div>
          <label htmlFor="modal-descripcion_equipo" className={ESTILO_ETIQUETA}>
            Descripción
          </label>
          <textarea
            id="modal-descripcion_equipo"
            name="descripcion_equipo"
            value={datos.descripcion_equipo ?? ""}
            onChange={handleCambio}
            placeholder="Opcional"
            rows={3}
            className={`${ESTILO_INPUT} resize-none`}
            disabled={deshabilitado}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={deshabilitado || !datos.id_tipo}
            className={`flex-1 ${ESTILO_BOTON_SUBMIT}`}
          >
            {deshabilitado ? "Creando..." : "Crear equipo"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalNuevoEquipo
