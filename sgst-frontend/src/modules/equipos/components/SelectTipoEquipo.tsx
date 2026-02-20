import { useState, useRef, useEffect } from "react"
import { ESTILO_INPUT, ESTILO_ETIQUETA } from "../../auth/helpers/auth.estilos"
import { useTiposEquipo } from "../hooks/useTiposEquipo"
import { useCrearTipoEquipo } from "../hooks/useCrearTipoEquipo"
import type { TipoEquipoDTO } from "../types/equipo.types"

interface SelectTipoEquipoProps {
  value: number | null
  onChange: (id_tipo: number | null, tipo?: TipoEquipoDTO) => void
  disabled?: boolean
  required?: boolean
}

function SelectTipoEquipo({
  value,
  onChange,
  disabled = false,
  required = false,
}: SelectTipoEquipoProps) {
  const [searchText, setSearchText] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [expandirCrear, setExpandirCrear] = useState(false)
  const [nuevoNombreTipo, setNuevoNombreTipo] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: tipos = [], isLoading } = useTiposEquipo()
  const crearTipo = useCrearTipoEquipo()

  const tipoSeleccionado = value != null ? tipos.find((t) => t.id_tipo === value) : null
  const textoFiltro = searchText.trim().toLowerCase()
  const opcionesFiltradas = textoFiltro
    ? tipos.filter((t) => t.nombre_tipo.toLowerCase().includes(textoFiltro))
    : tipos

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setExpandirCrear(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (tipo: TipoEquipoDTO) => {
    onChange(tipo.id_tipo, tipo)
    setSearchText("")
    setIsOpen(false)
  }

  const handleAgregarNuevo = () => {
    const nombre = nuevoNombreTipo.trim()
    if (!nombre) return
    crearTipo.mutate(
      { nombre_tipo: nombre },
      {
        onSuccess: (respuesta) => {
          const tipo = respuesta.data.tipo
          onChange(tipo.id_tipo, tipo)
          setNuevoNombreTipo("")
          setExpandirCrear(false)
          setIsOpen(false)
        },
      }
    )
  }

  const displayValue = isOpen ? searchText : tipoSeleccionado?.nombre_tipo ?? ""

  return (
    <div ref={containerRef} className="relative">
      <label className={ESTILO_ETIQUETA}>
        Tipo de equipo {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchText(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar o seleccionar tipo..."
          className={ESTILO_INPUT}
          disabled={disabled}
          required={required && value == null}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => {
            setExpandirCrear((prev) => !prev)
            if (!expandirCrear) setIsOpen(true)
          }}
          disabled={disabled}
          className="shrink-0 px-3 py-3 rounded-xl bg-zinc-700/80 border border-zinc-600/50 text-zinc-300 hover:bg-zinc-600/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          aria-label="Agregar tipo de equipo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-xl overflow-hidden">
          {expandirCrear && (
            <div className="p-3 border-b border-zinc-700/50 flex gap-2 items-center bg-zinc-800/50">
              <input
                type="text"
                value={nuevoNombreTipo}
                onChange={(e) => setNuevoNombreTipo(e.target.value)}
                placeholder="Nuevo tipo..."
                className={`${ESTILO_INPUT} flex-1 py-2`}
                disabled={crearTipo.isPending}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAgregarNuevo())}
              />
              <button
                type="button"
                onClick={handleAgregarNuevo}
                disabled={!nuevoNombreTipo.trim() || crearTipo.isPending}
                className="shrink-0 p-2 rounded-lg bg-green-600/80 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Crear tipo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </button>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="py-4 text-center text-zinc-400 text-sm">Cargando...</div>
            ) : opcionesFiltradas.length === 0 ? (
              <div className="py-4 text-center text-zinc-400 text-sm">
                {tipos.length === 0 ? "No hay tipos. Usa + para crear uno." : "Sin coincidencias."}
              </div>
            ) : (
              opcionesFiltradas.map((tipo) => (
                <button
                  type="button"
                  key={tipo.id_tipo}
                  onClick={() => handleSelect(tipo)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    value === tipo.id_tipo
                      ? "bg-blue-600/30 text-white"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {tipo.nombre_tipo}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectTipoEquipo
