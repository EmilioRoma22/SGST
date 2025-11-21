import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { TipoEquipo } from "../../../services/interfaces";
import { useTaller } from "../../../contexts/TallerContext";
import { crearEquipoTaller, crearTipoEquipoTaller, obtenerTipoEquipos } from "../../../services/api";

type formEquipo = {
    id_taller: number;
    id_tipo: number;
    num_serie: string;
    marca_equipo: string;
    modelo_equipo: string;
    descripcion_equipo: string;
}

type Props = {
    cerrarModal: () => void;
    mostrarToast: (mensaje: string, tipo: "success" | "error") => void;
    equipoCreado: () => void;
    formEquipo: formEquipo,
    setFormEquipo: React.Dispatch<React.SetStateAction<formEquipo>>
}

export const ModalCrearEquipo = ({ cerrarModal, mostrarToast, equipoCreado, formEquipo, setFormEquipo }: Props) => {
    const { taller } = useTaller()
    const [loading, setLoading] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [mostrarInputTipo, setMostrarInputTipo] = useState(false);
    const [nuevoTipo, setNuevoTipo] = useState("");
    const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>();
    const [errores, setErrores] = useState({
        id_tipo: "",
        num_serie: "",
        marca_equipo: "",
        modelo_equipo: "",
    });

    const obtTiposEquipo = async () => {
        setLoadingTipos(true);
        try {
            const respuesta = await obtenerTipoEquipos(taller?.id_taller ?? 0);
            setFormEquipo(prev => ({
                ...prev,
                id_tipo: respuesta[0].id_tipo
            }))
            setTiposEquipo(respuesta);
        } catch (error) {
            console.error("Error al obtener tipos de equipos:", error);
        } finally {
            setLoadingTipos(false);
        }
    }

    useEffect(() => {
        obtTiposEquipo();
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormEquipo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAgregarTipo = async () => {
        if (nuevoTipo.trim() === "") {
            mostrarToast("El nombre del tipo no puede estar vacío", "error");
            return;
        }

        try {
            const respuesta = await crearTipoEquipoTaller(taller?.id_taller ?? 0, nuevoTipo);
            obtTiposEquipo();
            mostrarToast(respuesta.message, "success");
            setNuevoTipo("");
            setMostrarInputTipo(false);
        } catch (error) {
            console.error("Error al crear tipo de equipo:", error);
            mostrarToast("Error al crear tipo de equipo", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const nuevosErrores = {
            id_tipo: "",
            num_serie: "",
            marca_equipo: "",
            modelo_equipo: "",
        };

        let hayErrores = false;

        if (!formEquipo.id_tipo) {
            nuevosErrores.id_tipo = "Selecciona un tipo de equipo";
            hayErrores = true;
        }
        if (formEquipo.num_serie.trim() === "") {
            nuevosErrores.num_serie = "El número de serie es obligatorio";
            hayErrores = true;
        }
        if (formEquipo.marca_equipo.trim() === "") {
            nuevosErrores.marca_equipo = "La marca es obligatoria";
            hayErrores = true;
        }
        if (formEquipo.modelo_equipo.trim() === "") {
            nuevosErrores.modelo_equipo = "El modelo es obligatorio";
            hayErrores = true;
        }

        setErrores(nuevosErrores);

        if (hayErrores) {
            setLoading(false);
            return;
        }

        try {
            const respuesta = await crearEquipoTaller(formEquipo);
            if (respuesta.ok) {
                equipoCreado();
                mostrarToast(respuesta.message, "success");
                cerrarModal();
            } else {
                mostrarToast(respuesta.message, "error");
            }
        } catch (error) {
            console.error("Error al crear equipo:", error);
            mostrarToast("Error al crear equipo", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cerrarModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <motion.div
            className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal();
                }
            }}
        >
            <motion.div
                className="relative bg-white p-6 rounded-2xl w-[500px] shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <button
                    onClick={() => cerrarModal()}
                    className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center transition-colors ease-in-out duration-300 cursor-pointer"
                >
                    <X />
                    <span className="sr-only">Close modal</span>
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <h1 className="text-slate-900 text-3xl font-bold">Nuevo Equipo</h1>
                        <p className="text-slate-500 text-sm mt-1">Ingresa los detalles del equipo a registrar.</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Tipo de Equipo</label>
                            <div className="flex gap-2 items-start">
                                <div className="w-full">
                                    <div className="relative">
                                        <select
                                            name="id_tipo"
                                            value={formEquipo.id_tipo}
                                            onChange={handleInputChange}
                                            className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none appearance-none"
                                        >
                                            {loadingTipos ? (
                                                <option value={0}>Cargando tipos...</option>
                                            ) : (
                                                (tiposEquipo || []).length > 0 ? (
                                                    (tiposEquipo || []).map(tipo => (
                                                        <option key={tipo.id_tipo} value={tipo.id_tipo}>
                                                            {tipo.nombre_tipo}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value={0}>No hay tipos disponibles</option>
                                                )
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                    {errores.id_tipo && (
                                        <p className="text-red-600 text-sm mt-1 ml-1">{errores.id_tipo}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMostrarInputTipo(!mostrarInputTipo)}
                                    className="bg-gray-900 hover:bg-gray-800 text-white p-3.5 rounded-md transition-colors"
                                    title="Agregar nuevo tipo"
                                >
                                    {mostrarInputTipo ? (
                                        <X size={20} />
                                    ) : (
                                        <Plus size={20} />
                                    )}
                                </button>
                            </div>

                            <AnimatePresence>
                                {mostrarInputTipo && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-3 flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={nuevoTipo}
                                            onChange={(e) => setNuevoTipo(e.target.value)}
                                            placeholder="Nombre del nuevo tipo"
                                            className="flex-1 text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-2.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAgregarTipo();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAgregarTipo}
                                            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Guardar
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Num Serie & Marca */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-slate-900 text-[15px] font-medium mb-2 block">No. Serie</label>
                                <input
                                    type="text"
                                    name="num_serie"
                                    value={formEquipo.num_serie}
                                    onChange={handleInputChange}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ej. SN12345678"
                                />
                                {errores.num_serie && (
                                    <p className="text-red-600 text-sm mt-1 ml-1">{errores.num_serie}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-slate-900 text-[15px] font-medium mb-2 block">Marca</label>
                                <input
                                    type="text"
                                    name="marca_equipo"
                                    value={formEquipo.marca_equipo}
                                    onChange={handleInputChange}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ej. Dell, HP, Apple"
                                />
                                {errores.marca_equipo && (
                                    <p className="text-red-600 text-sm mt-1 ml-1">{errores.marca_equipo}</p>
                                )}
                            </div>
                        </div>

                        {/* Modelo */}
                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Modelo</label>
                            <input
                                type="text"
                                name="modelo_equipo"
                                value={formEquipo.modelo_equipo}
                                onChange={handleInputChange}
                                className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                placeholder="Ej. Inspiron 15 3000"
                            />
                            {errores.modelo_equipo && (
                                <p className="text-red-600 text-sm mt-1 ml-1">{errores.modelo_equipo}</p>
                            )}
                        </div>

                        {/* Descripcion */}
                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Descripción (Opcional)</label>
                            <textarea
                                name="descripcion_equipo"
                                value={formEquipo.descripcion_equipo}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none resize-none"
                                placeholder="Detalles adicionales del equipo..."
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none cursor-pointer transition-colors ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Registrando..." : "Registrar Equipo"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}