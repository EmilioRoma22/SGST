import { useEffect, useState } from "react"
import type { OrdenServicio, Usuarios, Cliente, TipoEquipo } from "../../../services/interfaces"
import { obtenerOrdenesTaller, obtenerUsuariosTaller, obtenerClientesTaller, obtenerTipoEquipos } from "../../../services/api"
import { useTaller } from "../../../contexts/TallerContext"
import { mostrarToast } from "../../../utils/MostrarToast"
import { Calendar, DollarSign, Eye, Smartphone, User, Wrench, AlertCircle, UserCog, Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Loading } from "../../Loading"
import { AnimatePresence, motion } from "motion/react"
import VerOrden from "./VerOrden"
import { useAuth } from "../../../contexts/AuthContext"

export const OrdenesDeServicio = () => {
    const [loading, setLoading] = useState(false)
    const { taller, rol_taller } = useTaller()
    const { usuario } = useAuth()
    const [ordenes, setOrdenes] = useState<OrdenServicio[]>([])
    const [modalOrdenVisible, setModalOrdenVisible] = useState(false)
    const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<number | null>(null)
    const [tecnicos, setTecnicos] = useState<Usuarios[]>([])
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([])
    const [busqueda, setBusqueda] = useState("")
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [filtroTecnico, setFiltroTecnico] = useState<number | "">("")
    const [filtroCliente, setFiltroCliente] = useState<number | "">("")
    const [filtroEstado, setFiltroEstado] = useState<number | "">("")
    const [filtroPrioridad, setFiltroPrioridad] = useState<number | "">("")
    const [filtroTipoEquipo, setFiltroTipoEquipo] = useState<number | "">("")
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    const obtenerOrdenes = async () => {
        try {
            setLoading(true)
            const ordenes = await obtenerOrdenesTaller(taller?.id_taller ?? 0)
            if (rol_taller === "TECNICO") {
                const ordenesTecnico = ordenes.filter(orden => orden.id_tecnico === usuario?.id_usuario)
                setOrdenes(ordenesTecnico)
            } else {
                setOrdenes(ordenes)
            }
        } catch (error) {
            mostrarToast("Error al obtener las ordenes", "error")
        } finally {
            setLoading(false)
        }
    }

    const cargarDatosAuxiliares = async () => {
        if (!taller?.id_taller) return
        try {
            const [techs, clients, types] = await Promise.all([
                obtenerUsuariosTaller(taller.id_taller),
                obtenerClientesTaller(taller.id_taller),
                obtenerTipoEquipos(taller.id_taller)
            ])
            setTecnicos(techs.filter(t => t.rol_taller === "TECNICO"))
            setClientes(clients)
            setTiposEquipo(types)
        } catch (error) {
            console.error("Error cargando filtros", error)
        }
    }

    useEffect(() => {
        if (taller?.id_taller) {
            obtenerOrdenes()
            cargarDatosAuxiliares()
        }
    }, [taller])

    const obtenerColorEstado = (status: string) => {
        const statusLower = status.toLowerCase()
        if (statusLower.includes('completado') || statusLower.includes('entregado') || statusLower.includes('finalizado')) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        if (statusLower.includes('pendiente') || statusLower.includes('espera')) return 'bg-amber-100 text-amber-700 border-amber-200'
        if (statusLower.includes('proceso') || statusLower.includes('reparación')) return 'bg-blue-100 text-blue-700 border-blue-200'
        if (statusLower.includes('cancelado')) return 'bg-red-100 text-red-700 border-red-200'
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }

    const obtenerColorPrioridad = (priority: string) => {
        const priorityLower = priority.toLowerCase()
        if (priorityLower.includes('alta') || priorityLower.includes('urgente')) return 'text-red-600 bg-red-50'
        if (priorityLower.includes('media')) return 'text-amber-600 bg-amber-50'
        return 'text-blue-600 bg-blue-50'
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const ordenesFiltradas = ordenes.filter(orden => {
        const coincideBusqueda =
            orden.num_orden.toString().includes(busqueda) ||
            orden.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
            orden.apellidos_cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
            orden.marca_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
            orden.modelo_equipo.toLowerCase().includes(busqueda.toLowerCase());

        const fechaOrden = new Date(orden.fecha_creacion);
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : null;

        if (fechaFinDate) {
            fechaFinDate.setHours(23, 59, 59, 999);
        }

        const coincideFechaInicio = !fechaInicioDate || fechaOrden >= fechaInicioDate;
        const coincideFechaFin = !fechaFinDate || fechaOrden <= fechaFinDate;

        const coincideTecnico = !filtroTecnico || orden.id_tecnico === Number(filtroTecnico)
        const coincideCliente = !filtroCliente || orden.id_cliente === Number(filtroCliente)
        const coincideEstado = !filtroEstado || orden.id_estado === Number(filtroEstado)
        const coincidePrioridad = !filtroPrioridad || orden.id_prioridad === Number(filtroPrioridad)
        const coincideTipo = !filtroTipoEquipo || orden.id_tipo === Number(filtroTipoEquipo)

        return coincideBusqueda && coincideFechaInicio && coincideFechaFin &&
            coincideTecnico && coincideCliente && coincideEstado &&
            coincidePrioridad && coincideTipo;
    });

    const limpiarFiltros = () => {
        setBusqueda("")
        setFechaInicio("")
        setFechaFin("")
        setFiltroTecnico("")
        setFiltroCliente("")
        setFiltroEstado("")
        setFiltroPrioridad("")
        setFiltroTipoEquipo("")
    }

    const hayFiltrosActivos = busqueda || fechaInicio || fechaFin || filtroTecnico || filtroCliente || filtroEstado || filtroPrioridad || filtroTipoEquipo;

    if (loading) return <Loading />

    return (
        <div className="w-full max-w-full flex flex-col gap-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por orden, cliente o equipo..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto items-center justify-end">
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${mostrarFiltros || hayFiltrosActivos
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={18} />
                            Filtros
                            {mostrarFiltros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {hayFiltrosActivos && (
                            <button
                                onClick={limpiarFiltros}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                                <X size={16} /> Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {mostrarFiltros && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Desde</label>
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Hasta</label>
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Estado</label>
                                    <select
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value ? Number(e.target.value) : "")}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white"
                                    >
                                        <option value="">Todos</option>
                                        <option value="1">Recibido</option>
                                        <option value="2">En Reparación</option>
                                        <option value="3">Finalizado</option>
                                        <option value="5">Cancelado</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Prioridad</label>
                                    <select
                                        value={filtroPrioridad}
                                        onChange={(e) => setFiltroPrioridad(e.target.value ? Number(e.target.value) : "")}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white"
                                    >
                                        <option value="">Todas</option>
                                        <option value="1">Baja</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Alta</option>
                                        <option value="4">Urgente</option>
                                    </select>
                                </div>

                                {(rol_taller === "ADMIN" || rol_taller === "RECEPCIONISTA") && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Técnico</label>
                                        <select
                                            value={filtroTecnico}
                                            onChange={(e) => setFiltroTecnico(e.target.value ? Number(e.target.value) : "")}
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white"
                                        >
                                            <option value="">Todos</option>
                                            {tecnicos.map(tech => (
                                                <option key={tech.id_usuario} value={tech.id_usuario}>
                                                    {tech.nombre_usuario} {tech.apellidos_usuario}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Cliente</label>
                                    <select
                                        value={filtroCliente}
                                        onChange={(e) => setFiltroCliente(e.target.value ? Number(e.target.value) : "")}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white"
                                    >
                                        <option value="">Todos</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                                {cliente.nombre_cliente} {cliente.apellidos_cliente}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Tipo de Equipo</label>
                                    <select
                                        value={filtroTipoEquipo}
                                        onChange={(e) => setFiltroTipoEquipo(e.target.value ? Number(e.target.value) : "")}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white"
                                    >
                                        <option value="">Todos</option>
                                        {tiposEquipo.map(tipo => (
                                            <option key={tipo.id_tipo} value={tipo.id_tipo}>
                                                {tipo.nombre_tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {ordenesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        {ordenes.length === 0 ? (
                            <Wrench className="w-8 h-8 text-gray-400" />
                        ) : (
                            <Filter className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {ordenes.length === 0 ? "No hay órdenes registradas" : "No se encontraron resultados"}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {ordenes.length === 0
                            ? "Las nuevas órdenes de servicio aparecerán aquí"
                            : "Intenta ajustar tus filtros de búsqueda"}
                    </p>
                    {ordenes.length > 0 && (
                        <button
                            onClick={limpiarFiltros}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {ordenesFiltradas.map((orden) => (
                        <div
                            key={orden.id_orden}
                            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
                        >
                            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 md:w-1/4 flex flex-col justify-between gap-4">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-lg font-bold text-gray-900 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                                            #{orden.num_orden}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border w-fit ${obtenerColorEstado(orden.descripcion_estado)}`}>
                                            {orden.descripcion_estado}
                                        </span>
                                        <span className={`text-sm font-medium px-3 py-1.5 rounded-md w-fit ${obtenerColorPrioridad(orden.descripcion_prioridad)}`}>
                                            Prioridad {orden.descripcion_prioridad}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 mt-2">
                                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                                        <Smartphone size={20} className="text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 font-medium uppercase">Equipo</span>
                                        <span className="font-semibold text-gray-900" title={`${orden.marca_equipo} ${orden.modelo_equipo}`}>
                                            {orden.marca_equipo} {orden.modelo_equipo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col gap-6 justify-center">
                                <div className="flex items-start gap-4 bg-red-50 p-4 rounded-xl border border-red-100">
                                    <AlertCircle size={24} className="text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wide mb-1">Falla Reportada</p>
                                        <p className="text-gray-900 font-medium leading-relaxed">
                                            {orden.falla}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <User size={20} className="text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cliente</p>
                                            <p className="text-base font-medium text-gray-900">
                                                {orden.nombre_cliente} {orden.apellidos_cliente}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <UserCog size={20} className="text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Técnico Asignado</p>
                                            <p className={`text-base font-medium ${orden.id_tecnico && orden.id_tecnico !== 0 ? 'text-gray-900' : 'text-amber-600 italic'}`}>
                                                {orden.id_tecnico && orden.id_tecnico !== 0
                                                    ? `${orden.nombre_tecnico} ${orden.apellidos_tecnico}`
                                                    : 'Sin técnico asignado'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/30 md:w-1/5 flex flex-col justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar size={18} className="text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fecha Ingreso</p>
                                        <p className="text-sm text-gray-700">
                                            {new Date(orden.fecha_creacion).toLocaleDateString('es-MX', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex flex-col mb-4">
                                        <span className="text-xs text-gray-500 font-medium uppercase">Costo Total</span>
                                        <div className="flex items-center gap-1 text-gray-900 font-bold text-xl">
                                            <DollarSign size={20} />
                                            <span>{formatCurrency(orden.costo_total).replace('$', '')}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 transform duration-100"
                                        onClick={() => {
                                            setIdOrdenSeleccionada(orden.id_orden)
                                            setModalOrdenVisible(true)
                                        }}
                                    >
                                        <Eye size={18} />
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {modalOrdenVisible && (
                    <VerOrden
                        idOrden={idOrdenSeleccionada ?? 0}
                        cerrarModal={() => {
                            setIdOrdenSeleccionada(null)
                            setModalOrdenVisible(false)
                        }}
                        alActualizar={() => {
                            setIdOrdenSeleccionada(null)
                            setModalOrdenVisible(false)
                            obtenerOrdenes()
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}