import { Mail, MapPinHouse, MessageCircle, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Loading } from "../../Loading";
import type { DatosModificarCliente } from "../../../services/interfaces";
import { modificarClienteTaller } from "../../../services/api";

type clienteSeleccionado = {
    id_cliente: number,
    nombre_cliente: string,
    apellidos_cliente: string,
}

type Props = {
    cerrarModal: () => void;
    formModificarCliente: DatosModificarCliente,
    setFormModificarCliente: React.Dispatch<React.SetStateAction<DatosModificarCliente>>,
    clienteSeleccionado: clienteSeleccionado
    mostrarToast: (mensaje: string, tipo: "success" | "error") => void;
    cliente_modificado: () => void
}

export const ModalModificarCliente = ({ cerrarModal, formModificarCliente, setFormModificarCliente, mostrarToast, cliente_modificado, clienteSeleccionado }: Props) => {
    const [loading, setLoading] = useState(false)
    const [errores, setErrores] = useState({
        nombre_cliente: "",
        apellidos_cliente: "",
        correo_cliente: "",
        telefono_cliente: "",
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormModificarCliente(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const nuevosErrores = {
            nombre_cliente: "",
            apellidos_cliente: "",
            correo_cliente: "",
            telefono_cliente: "",
        };

        if (formModificarCliente.nombre_cliente.trim() === "") nuevosErrores.nombre_cliente = "El nombre es obligatorio";
        if (formModificarCliente.apellidos_cliente.trim() === "") nuevosErrores.apellidos_cliente = "Los apellidos son obligatorios";
        if (formModificarCliente.correo_cliente.trim() === "") nuevosErrores.correo_cliente = "El correo es obligatorio";
        if (formModificarCliente.telefono_cliente.trim() === "") nuevosErrores.telefono_cliente = "El teléfono es obligatorio";
        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");

        if (hayErrores) {
            setLoading(false)
            return;
        }

        try {
            const respuesta = await modificarClienteTaller(formModificarCliente);

            if (respuesta.ok) {
                mostrarToast(respuesta.message, "success")
                cliente_modificado()
                cerrarModal()
            } else {
                mostrarToast(respuesta.message, "error");
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            mostrarToast("Hubo un error al registrar el cliente. Por favor, intenta de nuevo.", "error");
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
                transition={{ duration: 0.2 }}
            >
                <button
                    onClick={() => cerrarModal()}
                    className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center transition-colors ease-in-out duration-300 cursor-pointer"
                >
                    <X />
                    <span className="sr-only">Cerrar modal</span>
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <h1 className="text-slate-900 text-3xl font-bold">Editar cliente</h1>
                        <h2 className="text-slate-800 text-sm">{clienteSeleccionado.nombre_cliente} {clienteSeleccionado.apellidos_cliente}</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className='flex gap-4 mb-2'>
                                <div className='w-full'>
                                    <label htmlFor="nombre_cliente" className='text-slate-900 text-[15px] font-medium mb-2 block'>Nombre</label>
                                </div>
                                <div className='w-full'>
                                    <label htmlFor="apellidos_cliente" className='text-slate-900 text-[15px] font-medium mb-2 block'>Apellidos</label>
                                </div>
                            </div>
                            <div className='flex gap-6'>
                                <input
                                    type="text"
                                    id="nombre_cliente"
                                    name="nombre_cliente"
                                    onChange={handleInputChange}
                                    value={formModificarCliente.nombre_cliente}
                                    className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border ${errores.nombre_cliente ? "border-red-600" : "border-gray-200"} focus:border-blue-600 outline-none`}
                                    placeholder="Ingresa el nombre"
                                />

                                <input
                                    type="text"
                                    id="apellidos_cliente"
                                    name="apellidos_cliente"
                                    onChange={handleInputChange}
                                    value={formModificarCliente.apellidos_cliente}
                                    className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border ${errores.apellidos_cliente ? "border-red-600" : "border-gray-200"} focus:border-blue-600 outline-none`}
                                    placeholder="Ingresa los apellidos"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Correo electrónico</label>
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    id="correo_cliente"
                                    name="correo_cliente"
                                    value={formModificarCliente.correo_cliente}
                                    onChange={handleInputChange}
                                    className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border ${errores.correo_cliente ? "border-red-600" : "border-gray-200"} focus:border-blue-600 outline-none`}
                                    placeholder="Ingresa el correo electrónico"
                                />
                                <Mail className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="" className="text-slate-900 text-[15px] font-medium mb-2 block">Telefono</label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    id="telefono_cliente"
                                    name="telefono_cliente"
                                    onChange={handleInputChange}
                                    value={formModificarCliente.telefono_cliente}
                                    className={`w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border ${errores.telefono_cliente ? "border-red-600" : "border-gray-200"} focus:border-blue-600 outline-none`}
                                    placeholder="Ingresa el telefono"
                                    maxLength={10}
                                    minLength={10}
                                />
                                <Phone className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Dirección</label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    id="direccion_cliente"
                                    name="direccion_cliente"
                                    value={formModificarCliente.direccion_cliente}
                                    onChange={handleInputChange}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ingresa la dirección"
                                />
                                <MapPinHouse className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Notas</label>
                            <div className="relative flex items-center">
                                <input
                                    type="textarea"
                                    id="notas_cliente"
                                    name="notas_cliente"
                                    value={formModificarCliente.notas_cliente}
                                    onChange={handleInputChange}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ingresa una nota al cliente"
                                />
                                <MessageCircle className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                            </div>
                        </div>

                        {Object.values(errores).some(error => error !== "") && (
                            <span className="block text-center text-red-600 text-sm">Ingresa la informacion faltante</span>
                        )}

                        <div className="mt-8">
                            <button type="submit" className="w-full py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none cursor-pointer transition-colors ease-in-out ">
                                Crear cliente
                            </button>
                        </div>
                    </div>
                </form>

                <AnimatePresence>
                    {loading && (
                        <Loading />
                    )}
                </AnimatePresence>

            </motion.div>
        </motion.div>
    );
}