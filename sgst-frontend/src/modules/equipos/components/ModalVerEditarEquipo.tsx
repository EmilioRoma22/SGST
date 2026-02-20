import React, { useState, useEffect } from "react"
import Modal from "../../../components/ui/Modal"
import { ESTILO_INPUT, ESTILO_ETIQUETA, ESTILO_BOTON_SUBMIT } from "../../auth/helpers/auth.estilos"
import SelectTipoEquipo from "./SelectTipoEquipo"
import type { EquipoDTO, ActualizarEquipoDTO } from "../types/equipo.types"

interface ModalVerEditarEquipoProps {
  open: boolean
  onClose: () => void
  onSubmit: (datos: ActualizarEquipoDTO) => void
  equipo: EquipoDTO | null
  deshabilitado: boolean
}

function ModalVerEditarEquipo({
  open,
  onClose,
  onSubmit,
  equipo,
  deshabilitado,
}: ModalVerEditarEquipoProps) {
  const [datos, setDatos] = useState<ActualizarEquipoDTO>({})

  useEffect(() => {
    if (open && equipo) {
      setDatos({
        id_tipo: equipo.id_tipo,
        num_serie: equipo.num_serie,
        marca_equipo: equipo.marca_equipo,
        modelo_equipo: equipo.modelo_equipo,
        descripcion_equipo: equipo.descripcion_equipo,
      })
    }
  }, [open, equipo])

  const handleCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value === "" ? null : value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const datosLimpios: ActualizarEquipoDTO = {
      ...datos,
      num_serie: datos.num_serie?.trim(),
    }
    onSubmit(datosLimpios)
  }

  if (!equipo) return null

  return (
    <Modal open={open} onClose={onClose} title="Editar equipo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectTipoEquipo
          value={datos.id_tipo ?? equipo.id_tipo}
          onChange={(id_tipo) => setDatos((prev) => ({ ...prev, id_tipo: id_tipo ?? undefined }))}
          disabled={deshabilitado}
          required
        />
        <div>
          <label htmlFor="modal-edit-num_serie" className={ESTILO_ETIQUETA}>
            Número de serie <span className="text-red-400">*</span>
          </label>
          <input
            id="modal-edit-num_serie"
            type="text"
            name="num_serie"
            value={datos.num_serie ?? equipo.num_serie}
            onChange={handleCambio}
            placeholder="Ej. SN123456"
            className={ESTILO_INPUT}
            required
            maxLength={100}
            disabled={deshabilitado}
          />
        </div>
        <div>
          <label htmlFor="modal-edit-marca_equipo" className={ESTILO_ETIQUETA}>
            Marca
          </label>
          <input
            id="modal-edit-marca_equipo"
            type="text"
            name="marca_equipo"
            value={datos.marca_equipo ?? equipo.marca_equipo ?? ""}
            onChange={handleCambio}
            placeholder="Opcional"
            className={ESTILO_INPUT}
            maxLength={100}
            disabled={deshabilitado}
          />
        </div>
        <div>
          <label htmlFor="modal-edit-modelo_equipo" className={ESTILO_ETIQUETA}>
            Modelo
          </label>
          <input
            id="modal-edit-modelo_equipo"
            type="text"
            name="modelo_equipo"
            value={datos.modelo_equipo ?? equipo.modelo_equipo ?? ""}
            onChange={handleCambio}
            placeholder="Opcional"
            className={ESTILO_INPUT}
            maxLength={100}
            disabled={deshabilitado}
          />
        </div>
        <div>
          <label htmlFor="modal-edit-descripcion_equipo" className={ESTILO_ETIQUETA}>
            Descripción
          </label>
          <textarea
            id="modal-edit-descripcion_equipo"
            name="descripcion_equipo"
            value={datos.descripcion_equipo ?? equipo.descripcion_equipo ?? ""}
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
            disabled={deshabilitado}
            className={`flex-1 ${ESTILO_BOTON_SUBMIT}`}
          >
            {deshabilitado ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalVerEditarEquipo
