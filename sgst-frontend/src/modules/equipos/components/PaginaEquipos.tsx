import { useState, useEffect } from "react"
import { useEquipos } from "../hooks/useEquipos"
import { useEquipo } from "../hooks/useEquipo"
import { useTiposEquipo } from "../hooks/useTiposEquipo"
import { useCrearEquipo } from "../hooks/useCrearEquipo"
import { useActualizarEquipo } from "../hooks/useActualizarEquipo"
import { useEliminarEquipo } from "../hooks/useEliminarEquipo"
import ModalVerEditarEquipo from "./ModalVerEditarEquipo"
import TablaEquipos from "./TablaEquipos"
import type { CrearEquipoDTO, ActualizarEquipoDTO, EquipoDTO } from "../types/equipo.types"
import ModalNuevoEquipo from "./ModalNuevoEquipo"
import ModalEliminarEquipo from "./ModalEliminarEquipo"

function PaginaEquipos() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined)
  const [orderDir, setOrderDir] = useState<"ASC" | "DESC">("ASC")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [idTipoFiltro, setIdTipoFiltro] = useState<number | undefined>(undefined)
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoDTO | null>(null)

  const { data: tipos = [] } = useTiposEquipo()
  const { data: respuestaEquipos, isLoading } = useEquipos({
    page,
    limit,
    order_by: orderBy,
    order_dir: orderDir,
    search: search || undefined,
    id_tipo: idTipoFiltro,
  })

  const { data: equipoDetalle } = useEquipo(
    modalEditarAbierto && equipoSeleccionado ? equipoSeleccionado.id_equipo : null
  )

  const crearEquipo = useCrearEquipo()
  const actualizarEquipo = useActualizarEquipo()
  const eliminarEquipo = useEliminarEquipo()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleOrderChange = (newOrderBy: string) => {
    if (newOrderBy.includes("_ASC") || newOrderBy.includes("_DESC")) {
      const parts = newOrderBy.split("_")
      const dir = parts.pop() as "ASC" | "DESC"
      const columna = parts.join("_")
      setOrderBy(columna)
      setOrderDir(dir)
    } else {
      setOrderBy(newOrderBy)
      setOrderDir("ASC")
    }
  }

  const handleCrearEquipo = (datos: CrearEquipoDTO) => {
    crearEquipo.mutate(datos, {
      onSuccess: () => setModalNuevoAbierto(false),
    })
  }

  const handleActualizarEquipo = (datos: ActualizarEquipoDTO) => {
    if (!equipoSeleccionado) return
    actualizarEquipo.mutate(
      { id_equipo: equipoSeleccionado.id_equipo, datos },
      {
        onSuccess: () => {
          setModalEditarAbierto(false)
          setEquipoSeleccionado(null)
        },
      }
    )
  }

  const handleEliminarEquipo = () => {
    if (!equipoSeleccionado) return
    eliminarEquipo.mutate(equipoSeleccionado.id_equipo, {
      onSuccess: () => {
        setModalEliminarAbierto(false)
        setEquipoSeleccionado(null)
      },
    })
  }

  const handleEquipoClick = (equipo: EquipoDTO) => {
    setEquipoSeleccionado(equipo)
    setModalEditarAbierto(true)
  }

  const handleEliminarClick = (equipo: EquipoDTO) => {
    setEquipoSeleccionado(equipo)
    setModalEliminarAbierto(true)
  }

  const equipos = respuestaEquipos?.data ?? []
  const pagination = respuestaEquipos?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  }

  return (
    <div className="w-full h-full p-6 lg:p-8">
      <div className="max-w-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Equipos</h1>
            <p className="text-zinc-400 text-sm">
              Gestiona los equipos y tipos de equipo de tu taller
            </p>
          </div>
          <button
            onClick={() => setModalNuevoAbierto(true)}
            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-zinc-950 cursor-pointer flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo equipo
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por número de serie, marca, modelo..."
              className="w-full px-4 py-3 pl-11 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <select
            value={idTipoFiltro ?? ""}
            onChange={(e) => {
              const v = e.target.value
              setIdTipoFiltro(v === "" ? undefined : Number(v))
              setPage(1)
            }}
            className="px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-200 min-w-[180px]"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.id_tipo} value={t.id_tipo}>
                {t.nombre_tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl overflow-hidden">
          <TablaEquipos
            equipos={equipos}
            isLoading={isLoading}
            pagination={pagination}
            orderBy={orderBy}
            orderDir={orderDir}
            onOrderChange={handleOrderChange}
            onPageChange={setPage}
            onEquipoClick={handleEquipoClick}
            onEliminarClick={handleEliminarClick}
          />
        </div>

        <ModalNuevoEquipo
          open={modalNuevoAbierto}
          onClose={() => setModalNuevoAbierto(false)}
          onSubmit={handleCrearEquipo}
          deshabilitado={crearEquipo.isPending}
        />

        <ModalVerEditarEquipo
          open={modalEditarAbierto}
          onClose={() => setModalEditarAbierto(false)}
          onSubmit={handleActualizarEquipo}
          equipo={equipoDetalle ?? equipoSeleccionado}
          deshabilitado={actualizarEquipo.isPending}
        />

        <ModalEliminarEquipo
          open={modalEliminarAbierto}
          onClose={() => setModalEliminarAbierto(false)}
          onConfirmar={handleEliminarEquipo}
          equipo={equipoSeleccionado}
          deshabilitado={eliminarEquipo.isPending}
        />
      </div>
    </div>
  )
}

export default PaginaEquipos
