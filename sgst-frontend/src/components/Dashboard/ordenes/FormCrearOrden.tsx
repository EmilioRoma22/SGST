import React, { useEffect, useState } from "react";
import { PlusCircle, User, Smartphone, Wrench, Calendar, DollarSign, Shield, FileText, CheckCircle2, ChevronDown, Search } from "lucide-react";
import { type Usuarios, type DatosCrearOrden, type TipoEquipo } from "../../../services/interfaces";
import { AnimatePresence } from "motion/react";
import { SeleccionarCliente } from "./SeleccionarCliente";
import { ModalCrearCliente } from "../clientes/ModalCrearCliente";
import { useTaller } from "../../../contexts/TallerContext";
import { mostrarToast } from "../../../utils/MostrarToast";
import { Toaster } from "react-hot-toast";
import { crearOrdenTaller, obtenerTipoEquipos, obtenerUltimoClienteTaller, obtenerUltimoEquipoTaller, obtenerUsuariosTaller } from "../../../services/api";
import { ModalCrearEquipo } from "../equipos/ModalCrearEquipo";
import { SeleccionarEquipo } from "./SeleccionarEquipo";

type Props = {
    ordenData: DatosCrearOrden
    setOrdenData: React.Dispatch<React.SetStateAction<DatosCrearOrden>>
    ordenCreada: () => void
    nombreClienteSeleccionado: string | undefined
    setNombreClienteSeleccionado: React.Dispatch<React.SetStateAction<string | undefined>>
    nombreEquipoSeleccionado: string | undefined
    setNombreEquipoSeleccionado: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const FormCrearOrden = ({ ordenData, setOrdenData, nombreClienteSeleccionado, setNombreClienteSeleccionado, ordenCreada, nombreEquipoSeleccionado, setNombreEquipoSeleccionado }: Props) => {
    const [idCliente, setIdCliente] = useState(0)
    const [idEquipo, setIdEquipo] = useState(0)
    const [modalCrearClienteVisible, setModalCrearClienteVisible] = useState(false)
    const [modalSeleccionarClienteVisible, setModalSeleccionarClienteVisible] = useState(false)
    const [modalSeleccionarEquipoVisible, setModalSeleccionarEquipoVisible] = useState(false)
    const [modalCrearEquipoVisible, setModalCrearEquipoVisible] = useState(false)
    const [tecnicos, setTecnicos] = useState<Usuarios[]>([])
    const [loadingTecnicos, setLoadingTecnicos] = useState(false)
    const [loading, setLoading] = useState(false)
    const { taller } = useTaller()
    const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([])
    const [formDatos, setFormDatos] = useState({
        id_taller: taller?.id_taller ?? 0,
        nombre_cliente: "",
        apellidos_cliente: "",
        correo_cliente: "",
        telefono_cliente: "",
        direccion_cliente: "",
        notas_cliente: ""
    });
    const [formEquipo, setFormEquipo] = useState({
        id_taller: taller?.id_taller ?? 0,
        id_tipo: 0,
        num_serie: "",
        marca_equipo: "",
        modelo_equipo: "",
        descripcion_equipo: ""
    })
    const [errores, setErrores] = useState({
        id_cliente: false,
        id_equipo: false,
        fecha_estimada_de_fin: false,
        meses_garantia: false,
    });

    const numericFields = [
        "id_cliente",
        "id_equipo",
        "id_prioridad",
        "tecnico_asignado",
        "id_estado",
        "costo_total",
        "meses_garantia",
        "es_por_garantia",
        "id_orden_origen"
    ];

    const labelStyle = "block text-sm font-medium text-gray-700 mb-1.5";
    const inputStyle = "w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 outline-none";
    const cardStyle = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow duration-300";
    const sectionHeaderStyle = "flex items-center gap-3 border-b border-gray-100 pb-4 mb-6";
    const sectionTitleStyle = "text-lg font-bold text-gray-900";

    const sumarMeses = (fecha: Date, meses: number) => {
        const nueva = new Date(fecha);
        nueva.setMonth(nueva.getMonth() + meses);
        return nueva;
    };

    const fechaHoy = new Date();

    const fechaFinGarantiaCalculada =
        ordenData.meses_garantia > 0
            ? sumarMeses(fechaHoy, ordenData.meses_garantia)
            : null;

    const formatearFechaMX = (fecha: Date) =>
        fecha.toLocaleDateString("es-MX", { day: 'numeric', month: 'long', year: 'numeric' });

    const formatearFechaSQL = (fecha: Date) =>
        fecha.toISOString().split("T")[0];

    const cambiarValor = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setOrdenData((prev) => ({
            ...prev,
            [name]: numericFields.includes(name) ? Number(value) : value,
        }));
    };

    const manejarAgregarNuevo = (tipo: "cliente" | "equipo") => {
        if (tipo === "cliente") setModalCrearClienteVisible(true)
        if (tipo === "equipo") setModalCrearEquipoVisible(true)
    };

    const enviarFormulario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taller) return;
        if (loading) return;

        const nuevosErrores = {
            id_cliente: ordenData.id_cliente === 0,
            id_equipo: ordenData.id_equipo === 0,
            fecha_estimada_de_fin: ordenData.fecha_estimada_de_fin === "",
            meses_garantia: ordenData.meses_garantia === 0,
        };

        setErrores(prev => ({ ...prev, ...nuevosErrores }));

        if (Object.values(nuevosErrores).some(Boolean)) {
            mostrarToast("Por favor, completa todos los campos obligatorios", "error");
            return;
        }

        setLoading(true)
        try {
            const respuesta = await crearOrdenTaller(ordenData)

            if (respuesta.ok) {
                mostrarToast(respuesta.message, "success");
                ordenCreada()
            } else {
                mostrarToast(respuesta.message, "error")
            }
        } catch (error) {
            mostrarToast("Error al crear la orden", "error")
        } finally {
            setLoading(false)
        }
    };

    const obtUltimoCliente = async () => {
        try {
            if (taller?.id_taller) {
                const respuesta = await obtenerUltimoClienteTaller(taller?.id_taller)

                setIdCliente(respuesta.id_cliente)
                setNombreClienteSeleccionado(respuesta.nombre_cliente + ' ' + respuesta.apellidos_cliente)
            }
        } catch (error) {
            mostrarToast("Hubo un error al asignar el nuevo cliente", "error")
        }
    }

    const obtUltimoEquipo = async () => {
        try {
            if (taller?.id_taller) {
                const respuesta = await obtenerUltimoEquipoTaller(taller?.id_taller)

                setIdEquipo(respuesta.id_equipo)
                setNombreEquipoSeleccionado(respuesta.nombre_tipo + ' ' + respuesta.marca_equipo + ' ' + respuesta.modelo_equipo)
            }
        } catch (error) {
            mostrarToast("Hubo un error al asignar el nuevo equipo", "error")
        }
    }

    const obtTiposEquipo = async () => {
        try {
            const respuesta = await obtenerTipoEquipos(taller?.id_taller ?? 0);

            setTiposEquipo(respuesta);
        } catch (error) {
            console.error("Error al obtener tipos de equipos:", error);
        }
    }

    const obtTecnicosTaller = async () => {
        setLoadingTecnicos(true)
        if (!taller) return
        const respuesta = await obtenerUsuariosTaller(taller.id_taller)
        setTecnicos(respuesta.filter(usuario => usuario.rol_taller === "TECNICO"))
        setLoadingTecnicos(false)
    }

    useEffect(() => {
        if (idCliente > 0) {
            setOrdenData(prev => ({
                ...prev,
                id_cliente: idCliente
            }))
        }

        if (idEquipo > 0) {
            setOrdenData(prev => ({
                ...prev,
                id_equipo: idEquipo
            }))
        }

        if (tecnicos.length > 0) {
            setOrdenData(prev => ({
                ...prev,
                tecnico_asignado: tecnicos[0].id_usuario
            }))
        }
    }, [idCliente, setIdCliente, idEquipo, setIdEquipo, tecnicos])

    useEffect(() => {
        obtTecnicosTaller()
        obtTiposEquipo()
    }, [])

    useEffect(() => {
        if (ordenData.meses_garantia > 0) {
            const fechaFinGarantia = sumarMeses(fechaHoy, ordenData.meses_garantia)
            setOrdenData(prev => ({
                ...prev,
                fecha_fin_garantia: formatearFechaSQL(fechaFinGarantia)
            }))
        }
    }, [ordenData.meses_garantia])

    return (
        <>
            <div className="w-full mx-auto">
                <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-600 font-medium mb-4">
                    <Calendar size={18} />
                    {new Date().toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <form onSubmit={enviarFormulario} className="space-y-8">
                    <div className={cardStyle}>
                        <div className={sectionHeaderStyle}>
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <User className="text-gray-600" size={24} />
                            </div>
                            <h2 className={sectionTitleStyle}>Información del Cliente y Equipo</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className={labelStyle}>Cliente</label>
                                <div className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden ${errores.id_cliente ? "border-red-300 bg-red-50" : "border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white"}`}>
                                    <div
                                        className="p-4 flex items-center justify-between"
                                        onClick={() => setModalSeleccionarClienteVisible(true)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${nombreClienteSeleccionado ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className={`font-medium ${nombreClienteSeleccionado ? "text-gray-900" : "text-gray-400"}`}>
                                                    {nombreClienteSeleccionado || "Seleccionar cliente"}
                                                </p>
                                                {nombreClienteSeleccionado && <p className="text-xs text-gray-500">Click para cambiar</p>}
                                            </div>
                                        </div>
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <div className="border-t border-gray-100 bg-gray-50 p-2 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                manejarAgregarNuevo("cliente");
                                            }}
                                            className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <PlusCircle size={16} /> Crear nuevo cliente
                                        </button>
                                    </div>
                                </div>
                                {errores.id_cliente && <p className="text-red-500 text-xs mt-1">Debe seleccionar un cliente</p>}
                            </div>

                            <div className="space-y-2">
                                <label className={labelStyle}>Equipo</label>
                                <div className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden ${errores.id_equipo ? "border-red-300 bg-red-50" : "border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white"}`}>
                                    <div
                                        className="p-4 flex items-center justify-between"
                                        onClick={() => setModalSeleccionarEquipoVisible(true)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${nombreEquipoSeleccionado ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"}`}>
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className={`font-medium ${nombreEquipoSeleccionado ? "text-gray-900" : "text-gray-400"}`}>
                                                    {nombreEquipoSeleccionado || "Seleccionar equipo"}
                                                </p>
                                                {nombreEquipoSeleccionado && <p className="text-xs text-gray-500">Click para cambiar</p>}
                                            </div>
                                        </div>
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <div className="border-t border-gray-100 bg-gray-50 p-2 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                manejarAgregarNuevo("equipo");
                                            }}
                                            className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <PlusCircle size={16} /> Crear nuevo equipo
                                        </button>
                                    </div>
                                </div>
                                {errores.id_equipo && <p className="text-red-500 text-xs mt-1">Debe seleccionar un equipo</p>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label htmlFor="accesorios" className={labelStyle}>Accesorios Recibidos</label>
                            <textarea
                                id="accesorios"
                                name="accesorios"
                                value={ordenData.accesorios}
                                onChange={cambiarValor}
                                placeholder="Ej: Cargador original, funda protectora, cable USB..."
                                className={`${inputStyle} min-h-[80px] resize-y`}
                            />
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <div className={sectionHeaderStyle}>
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <Wrench className="text-gray-600" size={24} />
                            </div>
                            <h2 className={sectionTitleStyle}>Detalles del Servicio</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="falla" className={labelStyle}>Falla Reportada</label>
                                <textarea
                                    id="falla"
                                    name="falla"
                                    value={ordenData.falla}
                                    onChange={cambiarValor}
                                    placeholder="Descripción detallada del problema reportado por el cliente..."
                                    className={`${inputStyle} min-h-[120px] resize-y`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="diagnostico_inicial" className={labelStyle}>Diagnóstico Inicial</label>
                                <textarea
                                    id="diagnostico_inicial"
                                    name="diagnostico_inicial"
                                    value={ordenData.diagnostico_inicial}
                                    onChange={cambiarValor}
                                    placeholder="Evaluación técnica preliminar..."
                                    className={`${inputStyle} min-h-[120px] resize-y`}
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label htmlFor="solucion_aplicada" className={labelStyle}>Solución Propuesta / Aplicada</label>
                            <textarea
                                id="solucion_aplicada"
                                name="solucion_aplicada"
                                value={ordenData.solucion_aplicada}
                                onChange={cambiarValor}
                                placeholder="Pasos a seguir o solución ya implementada..."
                                className={`${inputStyle} min-h-[80px] resize-y`}
                            />
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <div className={sectionHeaderStyle}>
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <DollarSign className="text-gray-600" size={24} />
                            </div>
                            <h2 className={sectionTitleStyle}>Seguimiento y Costos</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                                <label htmlFor="id_prioridad" className={labelStyle}>Prioridad</label>
                                <div className="relative">
                                    <select
                                        id="id_prioridad"
                                        name="id_prioridad"
                                        value={ordenData.id_prioridad}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} appearance-none cursor-pointer`}
                                    >
                                        <option value="1">Baja</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Alta</option>
                                        <option value="4">Urgente</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="id_estado" className={labelStyle}>Estado Inicial</label>
                                <div className="relative">
                                    <select
                                        id="id_estado"
                                        name="id_estado"
                                        value={ordenData.id_estado}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} appearance-none cursor-pointer`}
                                    >
                                        <option value="1">Recibido</option>
                                        <option value="2">En reparación</option>
                                        <option value="3">Finalizado</option>
                                        <option value="4">Entregado</option>
                                        <option value="5">Cancelado</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="tecnico_asignado" className={labelStyle}>Técnico Asignado</label>
                                <div className="relative">
                                    <select
                                        id="tecnico_asignado"
                                        name="tecnico_asignado"
                                        value={ordenData.tecnico_asignado}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} appearance-none cursor-pointer`}
                                    >
                                        {loadingTecnicos ? (
                                            <option value="0">Cargando...</option>
                                        ) : (
                                            tecnicos.length === 0 ? (
                                                <option value="0">No hay técnicos disponibles</option>
                                            ) : (
                                                tecnicos.map((tecnico) => (
                                                    <option key={tecnico.id_usuario} value={tecnico.id_usuario}>
                                                        {tecnico.nombre_usuario + " " + tecnico.apellidos_usuario}
                                                    </option>
                                                ))
                                            )
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="fecha_estimada_de_fin" className={labelStyle}>Fecha Estimada de Entrega</label>
                                <div className="relative">
                                    <input
                                        id="fecha_estimada_de_fin"
                                        type="date"
                                        name="fecha_estimada_de_fin"
                                        value={ordenData.fecha_estimada_de_fin}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} ${errores.fecha_estimada_de_fin ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                    />
                                </div>
                                {errores.fecha_estimada_de_fin && <p className="text-red-500 text-xs">Campo requerido</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="costo_total" className={labelStyle}>Costo Total Estimado</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                                    <input
                                        id="costo_total"
                                        type="number"
                                        name="costo_total"
                                        value={ordenData.costo_total}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} pl-8 font-semibold text-lg`}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">MXN</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cardStyle}>
                        <div className={sectionHeaderStyle}>
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <Shield className="text-gray-600" size={24} />
                            </div>
                            <h2 className={sectionTitleStyle}>Garantía</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="es_por_garantia" className={labelStyle}>Tipo de Ingreso</label>
                                <div className="relative">
                                    <select
                                        id="es_por_garantia"
                                        name="es_por_garantia"
                                        value={ordenData.es_por_garantia}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} appearance-none cursor-pointer`}
                                    >
                                        <option value="0">Servicio Normal</option>
                                        <option value="1">Reingreso por Garantía</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="meses_garantia" className={labelStyle}>Meses de Garantía</label>
                                <div className="relative">
                                    <input
                                        id="meses_garantia"
                                        type="number"
                                        name="meses_garantia"
                                        value={ordenData.meses_garantia}
                                        onChange={cambiarValor}
                                        className={`${inputStyle} ${errores.meses_garantia ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                        min="0"
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">Meses</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelStyle}>Vencimiento de Garantía</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500">
                                    {fechaFinGarantiaCalculada ? (
                                        <span className="font-semibold text-gray-900">{formatearFechaMX(fechaFinGarantiaCalculada)}</span>
                                    ) : (
                                        <span className="text-sm italic">Calculado automáticamente</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {Number(ordenData.es_por_garantia) === 1 && (
                            <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="id_orden_origen" className={labelStyle}>ID de Orden Original</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="id_orden_origen"
                                        type="number"
                                        name="id_orden_origen"
                                        value={ordenData.id_orden_origen}
                                        onChange={cambiarValor}
                                        placeholder="Número de la orden anterior"
                                        className={`${inputStyle} pl-10`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gray-900 text-white py-4 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all duration-300 shadow-xl shadow-gray-900/20 transform active:scale-[0.99] flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1"}`}
                        >
                            {loading ? (
                                <>Creando Orden...</>
                            ) : (
                                <>
                                    <CheckCircle2 size={24} />
                                    Crear Orden de Servicio
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <AnimatePresence>
                {modalSeleccionarClienteVisible && (
                    <SeleccionarCliente
                        setIdCliente={setIdCliente}
                        setNombreClienteSeleccionado={setNombreClienteSeleccionado}
                        cerrarModal={() => {
                            setModalSeleccionarClienteVisible(false)
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalCrearClienteVisible && (
                    <ModalCrearCliente
                        formDatos={formDatos}
                        setFormDatos={setFormDatos}
                        cerrarModal={() => { setModalCrearClienteVisible(false) }}
                        cliente_creado={() => {
                            obtUltimoCliente()
                        }}
                        mostrarToast={mostrarToast}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalCrearEquipoVisible && (
                    <ModalCrearEquipo
                        cerrarModal={() => { setModalCrearEquipoVisible(false) }}
                        mostrarToast={mostrarToast}
                        equipoCreado={() => {
                            obtUltimoEquipo()
                        }}
                        formEquipo={formEquipo}
                        setFormEquipo={setFormEquipo}
                        hayNuevoTipo={() => {
                            obtTiposEquipo()
                        }}
                        tiposEquipo={tiposEquipo}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalSeleccionarEquipoVisible && (
                    <SeleccionarEquipo
                        setIdEquipo={setIdEquipo}
                        setNombreEquipoSeleccionado={setNombreEquipoSeleccionado}
                        cerrarModal={() => {
                            setModalSeleccionarEquipoVisible(false)
                        }}
                    />
                )}
            </AnimatePresence>

            <Toaster />
        </>
    );
};