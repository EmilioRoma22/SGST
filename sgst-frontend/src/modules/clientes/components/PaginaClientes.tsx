import { useState, useEffect } from "react"
import { useClientes } from "../hooks/useClientes"
import { useCrearCliente } from "../hooks/useCrearCliente"
import { useActualizarCliente } from "../hooks/useActualizarCliente"
import { useEliminarCliente } from "../hooks/useEliminarCliente"
import { useCliente } from "../hooks/useCliente"
import ModalNuevoCliente from "./ModalNuevoCliente"
import ModalVerEditarCliente from "./ModalVerEditarCliente"
import ModalEliminarCliente from "./ModalEliminarCliente"
import TablaClientes from "./TablaClientes"
import type { CrearClienteDTO, ActualizarClienteDTO, ClienteDTO } from "../types/cliente.types"

function PaginaClientes() {
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [orderBy, setOrderBy] = useState<string | undefined>(undefined)
    const [orderDir, setOrderDir] = useState<"ASC" | "DESC">("ASC")
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
    const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteDTO | null>(null)

    const { data: respuestaClientes, isLoading } = useClientes({
        page,
        limit,
        order_by: orderBy,
        order_dir: orderDir,
        search: search || undefined,
    })

    const { data: clienteDetalle } = useCliente(
        modalEditarAbierto && clienteSeleccionado ? clienteSeleccionado.id_cliente : null
    )

    const crearCliente = useCrearCliente()
    const actualizarCliente = useActualizarCliente()
    const eliminarCliente = useEliminarCliente()

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

    const handleCrearCliente = (datos: CrearClienteDTO) => {
        crearCliente.mutate(datos, {
            onSuccess: () => {
                setModalNuevoAbierto(false)
            },
        })
    }

    const handleActualizarCliente = (datos: ActualizarClienteDTO) => {
        if (!clienteSeleccionado) return
        actualizarCliente.mutate(
            { id_cliente: clienteSeleccionado.id_cliente, datos },
            {
                onSuccess: () => {
                    setModalEditarAbierto(false)
                    setClienteSeleccionado(null)
                },
            }
        )
    }

    const handleEliminarCliente = () => {
        if (!clienteSeleccionado) return
        eliminarCliente.mutate(clienteSeleccionado.id_cliente, {
            onSuccess: () => {
                setModalEliminarAbierto(false)
                setClienteSeleccionado(null)
            },
        })
    }

    const handleClienteClick = (cliente: ClienteDTO) => {
        setClienteSeleccionado(cliente)
        setModalEditarAbierto(true)
    }

    const handleEliminarClick = (cliente: ClienteDTO) => {
        setClienteSeleccionado(cliente)
        setModalEliminarAbierto(true)
    }

    const clientes = respuestaClientes?.data || []
    const pagination = respuestaClientes?.pagination || {
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
                        <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
                        <p className="text-zinc-400 text-sm">
                            Gestiona los clientes de tu taller
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
                        Nuevo cliente
                    </button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar por nombre, apellidos, correo o teléfono..."
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
                </div>

                <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl overflow-hidden">
                    <TablaClientes
                        clientes={clientes}
                        isLoading={isLoading}
                        pagination={pagination}
                        orderBy={orderBy}
                        orderDir={orderDir}
                        onOrderChange={handleOrderChange}
                        onPageChange={setPage}
                        onClienteClick={handleClienteClick}
                        onEliminarClick={handleEliminarClick}
                    />
                </div>

                <ModalNuevoCliente
                    open={modalNuevoAbierto}
                    onClose={() => setModalNuevoAbierto(false)}
                    onSubmit={handleCrearCliente}
                    deshabilitado={crearCliente.isPending}
                />

                <ModalVerEditarCliente
                    open={modalEditarAbierto}
                    onClose={() => setModalEditarAbierto(false)}
                    onSubmit={handleActualizarCliente}
                    cliente={clienteDetalle || clienteSeleccionado}
                    deshabilitado={actualizarCliente.isPending}
                />

                <ModalEliminarCliente
                    open={modalEliminarAbierto}
                    onClose={() => setModalEliminarAbierto(false)}
                    onConfirmar={handleEliminarCliente}
                    cliente={clienteSeleccionado}
                    deshabilitado={eliminarCliente.isPending}
                />
            </div>
        </div>
    )
}

export default PaginaClientes
