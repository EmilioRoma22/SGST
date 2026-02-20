import Modal from "../../../components/ui/Modal"
import type { EquipoDTO } from "../types/equipo.types"

interface ModalEliminarEquipoProps {
  open: boolean
  onClose: () => void
  onConfirmar: () => void
  equipo: EquipoDTO | null
  deshabilitado: boolean
}

function ModalEliminarEquipo({
  open,
  onClose,
  onConfirmar,
  equipo,
  deshabilitado,
}: ModalEliminarEquipoProps) {
  if (!equipo) return null

  const identificador = [equipo.num_serie, equipo.nombre_tipo, equipo.modelo_equipo]
    .filter(Boolean)
    .join(" · ") || equipo.num_serie

  return (
    <Modal open={open} onClose={onClose} title="Eliminar equipo">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-red-400 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <div>
            <p className="text-red-300 font-semibold">Acción peligrosa</p>
            <p className="text-sm text-red-400/80">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
        <p className="text-zinc-300">
          ¿Estás seguro de que deseas eliminar el equipo{" "}
          <span className="font-semibold text-white">{identificador}</span>?
        </p>
        <p className="text-sm text-zinc-400">
          Se eliminarán los datos de este equipo de forma permanente.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={deshabilitado}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={deshabilitado}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer"
          >
            {deshabilitado ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ModalEliminarEquipo
