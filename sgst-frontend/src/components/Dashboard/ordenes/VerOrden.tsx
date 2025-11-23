import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, Save, Printer, User, Smartphone, Mail, MapPin, Cpu, Hash, FileText, AlertCircle, Clock, DollarSign, CheckCircle } from "lucide-react"
import { obtenerOrdenTaller, actualizarOrdenTaller, obtenerUsuariosTaller, enviarOrdenCorreo } from "../../../services/api"
import type { OrdenDetallada, DatosActualizarOrden, Usuarios } from "../../../services/interfaces"
import { useTaller } from "../../../contexts/TallerContext"
import { mostrarToast } from "../../../utils/MostrarToast"
import { generarPDFOrden } from "../../../utils/generarPDF";
import ModalPDF from "./ModalPDF";
import { ModalConfirmarTerminar } from "./ModalConfirmarTerminar"

interface VerOrdenProps {
    idOrden: number
    cerrarModal: () => void
    alActualizar: () => void
}

export default function VerOrden({ idOrden, cerrarModal, alActualizar }: VerOrdenProps) {
    const { taller } = useTaller()
    const [orden, setOrden] = useState<OrdenDetallada | null>(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [tecnicos, setTecnicos] = useState<Usuarios[]>([])
    const [diagnostico, setDiagnostico] = useState("")
    const [solucion, setSolucion] = useState("")
    const [falla, setFalla] = useState("")
    const [accesorios, setAccesorios] = useState("")
    const [costo, setCosto] = useState(0)
    const [idEstado, setIdEstado] = useState(0)
    const [idPrioridad, setIdPrioridad] = useState(0)
    const [idTecnico, setIdTecnico] = useState<number>(0)
    const [fechaEstimada, setFechaEstimada] = useState("")
    const [metodoPago, setMetodoPago] = useState("Efectivo")
    const [pdfModalAbierto, setPdfModalAbierto] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [modalConfirmarTerminarAbierto, setModalConfirmarTerminarAbierto] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [idOrden])

    const cargarDatos = async () => {
        if (!taller) return
        setCargando(true)
        try {
            const [ordenData, tecnicosData] = await Promise.all([
                obtenerOrdenTaller(idOrden),
                obtenerUsuariosTaller(taller.id_taller)
            ])

            setOrden(ordenData)
            setTecnicos(tecnicosData.filter(t => t.rol_taller === "TECNICO"))

            setDiagnostico(ordenData.diagnostico_inicial || "")
            setSolucion(ordenData.solucion_aplicada || "")
            setFalla(ordenData.falla || "")
            setAccesorios(ordenData.accesorios || "")
            setCosto(ordenData.costo_total || 0)
            setIdEstado(ordenData.id_estado)
            setIdPrioridad(ordenData.id_prioridad)
            setIdTecnico(ordenData.id_tecnico || 0)

            if (ordenData.fecha_estimada_de_fin) {
                const fecha = new Date(ordenData.fecha_estimada_de_fin)
                setFechaEstimada(fecha.toISOString().split('T')[0])
            }

        } catch (error) {
            console.error("Error al cargar orden:", error)
            mostrarToast("Error al cargar los detalles de la orden", "error")
            cerrarModal()
        } finally {
            setCargando(false)
        }
    }

    const handleGuardar = async () => {
        if (!orden) return

        setGuardando(true)
        const datosActualizar: DatosActualizarOrden = {
            id_orden: orden.id_orden,
            accesorios,
            falla,
            diagnostico_inicial: diagnostico,
            solucion_aplicada: solucion,
            id_prioridad: idPrioridad,
            tecnico_asignado: idTecnico,
            fecha_estimada_de_fin: fechaEstimada,
            id_estado: idEstado,
            costo_total: costo
        }

        const resultado = await actualizarOrdenTaller(datosActualizar)

        if (resultado.ok) {
            mostrarToast("Orden actualizada correctamente", "success")
            alActualizar()
            cerrarModal()
        } else {
            mostrarToast(resultado.message, "error")
        }
        setGuardando(false)
    }

    const handleGenerarPDF = async () => {
        if (!orden) return;
        try {
            const blob = await generarPDFOrden(orden);
            setPdfBlob(blob);
            setPdfModalAbierto(true);
        } catch (error) {
            console.error("Error generando PDF:", error);
            mostrarToast("Error al generar el PDF", "error");
        }
    };

    const handleEnviarCorreo = async (email: string) => {
        if (!orden || !pdfBlob) return;
        try {
            await enviarOrdenCorreo(email, pdfBlob, orden.num_orden);
            mostrarToast("Correo enviado exitosamente", "success");
        } catch (error) {
            console.error("Error enviando correo:", error);
            mostrarToast("Error al enviar el correo", "error");
        }
    };

    const handleTerminarServicio = async () => {
        if (!orden) return;

        if (!costo || costo <= 0) {
            mostrarToast("El costo total es obligatorio para terminar el servicio", "error");
            return;
        }

        setModalConfirmarTerminarAbierto(true)
    };

    if (!idOrden) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-background fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    if (pdfModalAbierto) {
                        setPdfModalAbierto(false);
                    } else {
                        cerrarModal();
                    }
                }
            }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-gray-900" />
                            Orden #{orden?.num_orden}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Creada el {orden?.fecha_creacion ? new Date(orden.fecha_creacion).toLocaleDateString() : ''}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleGenerarPDF}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Imprimir Orden"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={cerrarModal}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {cargando ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : orden ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-8">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-900" />
                                        Datos del Cliente
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <label className="text-gray-500 text-xs uppercase font-medium">Nombre</label>
                                            <p className="font-medium text-gray-900">{orden.nombre_cliente} {orden.apellidos_cliente}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Smartphone className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <p className="text-gray-700">{orden.telefono_cliente}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <p className="text-gray-700">{orden.correo_cliente}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <p className="text-gray-700">{orden.direccion_cliente}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-gray-900" />
                                        Datos del Equipo
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <label className="text-gray-500 text-xs uppercase font-medium">Equipo</label>
                                            <p className="font-medium text-gray-900">{orden.nombre_tipo} - {orden.marca_equipo} {orden.modelo_equipo}</p>
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs uppercase font-medium">No. Serie</label>
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                                <p className="text-gray-700 font-mono">{orden.num_serie}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-xs uppercase font-medium">Descripción</label>
                                            <p className="text-gray-700">{orden.descripcion_equipo}</p>
                                        </div>
                                    </div>
                                </div>

                                {orden.es_por_garantia ? (
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                        <div className="flex items-center gap-2 text-yellow-800 font-semibold">
                                            <AlertCircle className="w-5 h-5" />
                                            <span>Reingreso por Garantía</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                        <div className="flex items-center gap-2 text-green-800 font-semibold">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>No es por Garantía</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <fieldset disabled={orden?.id_estado === 3} className="lg:col-span-2 space-y-6 border-0 p-0 m-0 min-w-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <select
                                            value={idEstado}
                                            onChange={(e) => setIdEstado(Number(e.target.value))}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                        >
                                            <option value={1}>Recibido</option>
                                            <option value={2}>En Reparación</option>
                                            <option value={3}>Finalizado</option>
                                            <option value={5}>Cancelado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                        <select
                                            value={idPrioridad}
                                            onChange={(e) => setIdPrioridad(Number(e.target.value))}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                        >
                                            <option value={1}>Baja</option>
                                            <option value={2}>Normal</option>
                                            <option value={3}>Alta</option>
                                            <option value={4}>Urgente</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
                                        <select
                                            value={idTecnico}
                                            onChange={(e) => setIdTecnico(Number(e.target.value))}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                        >
                                            <option value={0}>Sin asignar</option>
                                            {tecnicos.map(tech => (
                                                <option key={tech.id_usuario} value={tech.id_usuario}>
                                                    {tech.nombre_usuario} {tech.apellidos_usuario}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Falla Reportada</label>
                                        <textarea
                                            value={falla}
                                            onChange={(e) => setFalla(e.target.value)}
                                            rows={3}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Técnico</label>
                                        <textarea
                                            value={diagnostico}
                                            onChange={(e) => setDiagnostico(e.target.value)}
                                            rows={3}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="Ingrese el diagnóstico detallado..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Solución Aplicada</label>
                                        <textarea
                                            value={solucion}
                                            onChange={(e) => setSolucion(e.target.value)}
                                            rows={3}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="Describa la solución o reparación realizada..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Accesorios Recibidos</label>
                                        <input
                                            type="text"
                                            value={accesorios}
                                            onChange={(e) => setAccesorios(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Costo Total</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={costo}
                                                onChange={(e) => setCosto(Number(e.target.value))}
                                                className="w-full pl-10 p-3 rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow font-medium text-lg disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Entrega</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={fechaEstimada}
                                                onChange={(e) => setFechaEstimada(e.target.value)}
                                                className="w-full pl-10 p-3 rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No se encontró la información de la orden.
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={cerrarModal}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        {orden?.id_estado === 3 ? "Cerrar" : "Cancelar"}
                    </button>

                    {orden?.id_estado !== 3 && (
                        <>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Método de Pago:</label>
                                <select
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>
                            <button
                                onClick={handleTerminarServicio}
                                disabled={guardando}
                                className="px-4 py-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                Terminar servicio
                            </button>
                            <button
                                onClick={handleGuardar}
                                disabled={guardando}
                                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                Guardar Cambios
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {pdfModalAbierto && (
                    <ModalPDF
                        onClose={() => setPdfModalAbierto(false)}
                        pdfBlob={pdfBlob}
                        onSendCorreo={handleEnviarCorreo}
                        defaultCorreo={orden?.correo_cliente || ""}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalConfirmarTerminarAbierto && (
                    <ModalConfirmarTerminar
                        cerrarModal={() => setModalConfirmarTerminarAbierto(false)}
                        id_orden={idOrden}
                        costo={costo}
                        metodoPago={metodoPago}
                        mostrarToast={mostrarToast}
                        alActualizar={alActualizar}
                        setGuardando={setGuardando}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}
