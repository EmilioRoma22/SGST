import { ALargeSmall, BookCheck, Mail, MapPin, Phone, Wrench, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { DatosCrearTaller } from "../../services/interfaces";
import { Loading } from "../Loading";
import { crearTaller } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
    cerrarModal: () => void;
    formTaller: DatosCrearTaller
    setFormTaller: React.Dispatch<React.SetStateAction<DatosCrearTaller>>;
    mostrarToast: (mensaje: string, tipo: "success" | "error") => void;
    tallerCreado: () => void
}

export const ModalAgregarTaller = ({ cerrarModal, formTaller, setFormTaller, mostrarToast, tallerCreado }: Props) => {
    const [loading, setLoading] = useState(false)
    const { usuario } = useAuth()
    const [errores, setErrores] = useState({
        nombre_taller: "",
        telefono_taller: "",
        correo_taller: "",
        direccion_taller: "",
        rfc_taller: "",
    })

    const handleCrearTaller = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)

        const nuevosErrores = {
            nombre_taller: "",
            telefono_taller: "",
            correo_taller: "",
            direccion_taller: "",
            rfc_taller: "",
        }

        if (formTaller.nombre_taller.trim() === "") nuevosErrores.nombre_taller = "El nombre del taller es obligatorio."
        if (formTaller.correo_taller.trim() === "") nuevosErrores.correo_taller = "El correo electrónico es obligatorio."
        if (formTaller.telefono_taller.trim() === "") nuevosErrores.telefono_taller = "El teléfono es obligatorio."
        if (formTaller.direccion_taller.trim() === "") nuevosErrores.direccion_taller = "La dirección es obligatoria."
        if (formTaller.rfc_taller.trim() === "") nuevosErrores.rfc_taller = "El RFC es obligatorio."
        setErrores(nuevosErrores)

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setLoading(false)
            mostrarToast("Por favor, rellena la información faltante en el formulario.", "error");
            return;
        }

        try {
            if (!usuario) return
            const respuesta = await crearTaller(usuario.id_empresa, formTaller)
            
            if (respuesta.ok) {
                mostrarToast("Su taller ha sido creado exitosamente.", "success");
                tallerCreado();
                setFormTaller({
                    nombre_taller: "",
                    telefono_taller: "",
                    correo_taller: "",
                    direccion_taller: "",
                    rfc_taller: "",
                })
                cerrarModal();
            }else {
                mostrarToast("No se ha podido crear el taller. Inténtelo de nuevo más tarde.", "error");
            }
        } catch (error) {
            console.error("Error en la creación del taller:", error);
            mostrarToast("Hubo un error al registrar su taller. Por favor, intenta más tarde.", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormTaller(prev => ({ ...prev, [name]: value }));
    }

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
    }, [cerrarModal]);

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
                className="relative bg-white p-6 rounded-2xl w-[400px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    onClick={() => cerrarModal()}
                    className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center transition-colors ease-in-out duration-300 cursor-pointer"
                >
                    <X />
                    <span className="sr-only">Close modal</span>
                </button>
                <div className="flex justify-center mb-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                        <Wrench className="text-gray-900 w-6 h-6" />
                    </div>
                </div>

                <form action="" className="space-y-4" onSubmit={handleCrearTaller}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-2">Nombre del taller</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formTaller.nombre_taller}
                                name="nombre_taller"
                                className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-2 rounded-md border ${errores.nombre_taller ? "border-red-400" : "border-gray-200"} focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic`}
                                placeholder="Ingresa el nombre de tu taller"
                                onChange={handleChange}
                            />
                            <ALargeSmall className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-2">Correo electrónico</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={formTaller.correo_taller}
                                name="correo_taller"
                                className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-2 rounded-md border ${errores.correo_taller ? "border-red-400" : "border-gray-200"} focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic`}
                                placeholder="Ingrese el correo electrónico"
                                onChange={handleChange}
                            />
                            <Mail className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-2">Teléfono</label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={formTaller.telefono_taller}
                                name="telefono_taller"
                                className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-2 rounded-md border ${errores.telefono_taller ? "border-red-400" : "border-gray-200"} focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic`}
                                placeholder="Ingrese el teléfono"
                                onChange={handleChange}
                                maxLength={10}
                            />
                            <Phone className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-2">Dirección</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formTaller.direccion_taller}
                                name="direccion_taller"
                                className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-2 rounded-md border ${errores.direccion_taller ? "border-red-400" : "border-gray-200"} focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic`}
                                placeholder="Ingrese la dirección del taller"
                                onChange={handleChange}
                            />
                            <MapPin className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-2">RFC</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formTaller.rfc_taller}
                                name="rfc_taller"
                                className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-2 rounded-md border ${errores.rfc_taller ? "border-red-400" : "border-gray-200"} focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic`}
                                placeholder="Ingrese el RFC del taller"
                                onChange={handleChange}
                                maxLength={13}
                            />
                            <BookCheck className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800  shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                            type='submit'
                        >
                            Crear
                        </button>
                        <button
                            type="button"
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                            onClick={cerrarModal}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

                {loading && (
                    <Loading />
                )}

            </motion.div>
        </motion.div>
    );
}