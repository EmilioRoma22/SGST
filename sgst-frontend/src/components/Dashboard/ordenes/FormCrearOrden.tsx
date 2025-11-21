import React, { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { type Usuarios, type DatosCrearOrden } from "../../../services/interfaces";
import { AnimatePresence } from "motion/react";
import { SeleccionarCliente } from "./SeleccionarCliente";
import { ModalCrearCliente } from "../clientes/ModalCrearCliente";
import { useTaller } from "../../../contexts/TallerContext";
import { mostrarToast } from "../../../utils/MostrarToast";
import { Toaster } from "react-hot-toast";
import { crearOrdenTaller, obtenerUltimoClienteTaller, obtenerUltimoEquipoTaller, obtenerUsuariosTaller } from "../../../services/api";
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
    const { taller } = useTaller()
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
    const InputBaseStyle =
        "w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none transition duration-150";
    const buttonBaseStyle =
        "py-2 px-4 bg-gray-900 hover:bg-gray-700 rounded-lg text-white transition duration-150 flex items-center justify-center shrink-0 cursor-pointer"

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
        fecha.toLocaleDateString("es-MX");

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

        const respuesta = await crearOrdenTaller(ordenData)

        if (respuesta.ok) {
            mostrarToast(respuesta.message, "success");
            ordenCreada()
        } else {
            mostrarToast(respuesta.message, "error")
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
            <div className="space-y-8 w-full max-w-full">
                <form onSubmit={enviarFormulario} className="space-y-8">
                    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6 border border-gray-200">
                        <div className="flex justify-between border-b border-gray-300 pb-3">
                            <h2 className="text-xl font-bold text-gray-800">
                                Detalles Generales
                            </h2>
                            <h2 className="text-xl font-bold text-gray-800">
                                Fecha: {new Date().toLocaleDateString("es-MX")}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <span className="block mb-1 text-sm font-semibold text-gray-700">
                                    Cliente
                                </span>
                                <div className="flex space-x-2">
                                    <span
                                        className={`${InputBaseStyle} grow appearance-none cursor-pointer ${errores.id_cliente ? "border-red-500" : ""}`}
                                        onClick={() => { setModalSeleccionarClienteVisible(true) }}
                                    >
                                        {nombreClienteSeleccionado ? nombreClienteSeleccionado : "Seleccione un cliente"}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => { manejarAgregarNuevo("cliente") }}
                                        className={buttonBaseStyle}
                                        aria-label={`Agregar nuevo cliente`}
                                    >
                                        <PlusCircle size={20} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="id_equipo" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Equipo
                                </label>
                                <div className="flex space-x-2">
                                    <span
                                        className={`${InputBaseStyle} grow appearance-none cursor-pointer ${errores.id_equipo ? "border-red-500" : ""}`}
                                        onClick={() => { setModalSeleccionarEquipoVisible(true) }}
                                    >
                                        {nombreEquipoSeleccionado ? nombreEquipoSeleccionado : "Seleccione un equipo"}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => { manejarAgregarNuevo("equipo") }}
                                        className={buttonBaseStyle}
                                        aria-label={`Agregar nuevo equipo`}
                                    >
                                        <PlusCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="accesorios" className="block mb-1 text-sm font-semibold text-gray-700">
                                Accesorios Entregados
                            </label>
                            <textarea
                                id="accesorios"
                                name="accesorios"
                                value={ordenData.accesorios}
                                onChange={cambiarValor}
                                placeholder="Ej: Cargador, funda, cable HDMI..."
                                className={InputBaseStyle}
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3">
                            Falla y Solución
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="falla" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Falla reportada por el cliente
                                </label>

                                <textarea
                                    id="falla"
                                    name="falla"
                                    value={ordenData.falla}
                                    onChange={cambiarValor}
                                    placeholder="Descripción detallada de la falla..."
                                    className={InputBaseStyle}
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label htmlFor="diagnostico_inicial" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Diagnóstico inicial del técnico
                                </label>

                                <textarea
                                    id="diagnostico_inicial"
                                    name="diagnostico_inicial"
                                    value={ordenData.diagnostico_inicial}
                                    onChange={cambiarValor}
                                    placeholder="Evaluación inicial..."
                                    className={InputBaseStyle}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="solucion_aplicada" className="block mb-1 text-sm font-semibold text-gray-700">
                                Solución aplicada
                            </label>

                            <textarea
                                id="solucion_aplicada"
                                name="solucion_aplicada"
                                value={ordenData.solucion_aplicada}
                                onChange={cambiarValor}
                                placeholder="Acciones correctivas, piezas reemplazadas..."
                                className={InputBaseStyle}
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3">
                            Seguimiento y Finanzas
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="id_prioridad" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Prioridad
                                </label>
                                <select
                                    id="id_prioridad"
                                    name="id_prioridad"
                                    value={ordenData.id_prioridad}
                                    onChange={cambiarValor}
                                    className={`${InputBaseStyle} appearance-none`}
                                >
                                    <option value="1">Baja</option>
                                    <option value="2">Normal</option>
                                    <option value="3">Alta</option>
                                    <option value="4">Urgente</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="id_estado" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Estado de la Orden
                                </label>
                                <select
                                    id="id_estado"
                                    name="id_estado"
                                    value={ordenData.id_estado}
                                    onChange={cambiarValor}
                                    className={`${InputBaseStyle} appearance-none`}
                                >
                                    <option value="1">Recibido</option>
                                    <option value="2">En reparación</option>
                                    <option value="3">Finalizado</option>
                                    <option value="4">Entregado</option>
                                    <option value="5">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tecnico_asignado" className="block mb-1 text-sm font-semibold text-gray-700">
                                    asignado
                                </label>
                                <select
                                    id="tecnico_asignado"
                                    name="tecnico_asignado"
                                    value={ordenData.tecnico_asignado}
                                    onChange={cambiarValor}
                                    className={`${InputBaseStyle} appearance-none`}
                                >
                                    {loadingTecnicos ? (
                                        <option value="0">Cargando...</option>
                                    ) : (
                                        tecnicos.map((tecnico) => (
                                            <option key={tecnico.id_usuario} value={tecnico.id_usuario}>
                                                {tecnico.nombre_usuario + " " + tecnico.apellidos_usuario}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fecha_estimada_de_fin" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Fecha estimada de fin
                                </label>
                                <input
                                    id="fecha_estimada_de_fin"
                                    type="date"
                                    name="fecha_estimada_de_fin"
                                    value={ordenData.fecha_estimada_de_fin}
                                    onChange={cambiarValor}
                                    className={`${InputBaseStyle} ${errores.fecha_estimada_de_fin ? "border-red-500" : ""}`}
                                />
                            </div>

                            <div>
                                <label htmlFor="costo_total" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Costo total (MXN)
                                </label>
                                <input
                                    id="costo_total"
                                    type="number"
                                    name="costo_total"
                                    value={ordenData.costo_total}
                                    onChange={cambiarValor}
                                    className={InputBaseStyle}
                                    placeholder="0"
                                    step="1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3">
                            Opciones de Garantía
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="es_por_garantia" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Es por garantía (re-ingreso)
                                </label>
                                <select
                                    id="es_por_garantia"
                                    name="es_por_garantia"
                                    value={ordenData.es_por_garantia}
                                    onChange={cambiarValor}
                                    className={`${InputBaseStyle} appearance-none`}
                                >
                                    <option value="0">No</option>
                                    <option value="1">Sí</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="meses_garantia" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Meses de garantía
                                </label>
                                <input
                                    id="meses_garantia"
                                    type="number"
                                    name="meses_garantia"
                                    value={ordenData.meses_garantia}
                                    onChange={cambiarValor}
                                    className={`${InputBaseStyle} ${errores.meses_garantia ? "border-red-500" : ""}`}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label htmlFor="fecha_fin" className="block mb-1 text-sm font-semibold text-gray-700">
                                    Fecha del final de la garantía
                                </label>
                                {fechaFinGarantiaCalculada ? (
                                    <p className="text-2xl text-gray-600 mt-1 py-1">
                                        <strong>{formatearFechaMX(fechaFinGarantiaCalculada)}</strong>
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Ingrese los meses de la garantía para obtener la fecha fin de la misma
                                    </p>
                                )}
                            </div>
                        </div>

                        {Number(ordenData.es_por_garantia) === 1 && (
                            <div>
                                <label htmlFor="id_orden_origen" className="block mb-1 text-sm font-semibold text-gray-700">
                                    ID de la Orden de Origen (Garantía)
                                </label>
                                <input
                                    id="id_orden_origen"
                                    type="number"
                                    name="id_orden_origen"
                                    value={ordenData.id_orden_origen}
                                    onChange={cambiarValor}
                                    placeholder="ID de la orden original"
                                    className={InputBaseStyle}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-3 rounded-xl text-xl font-bold hover:bg-gray-700 transition duration-300 shadow-lg shadow-gray-900/40 transform hover:scale-[1.005]"
                    >
                        Crear Orden de Servicio
                    </button>
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