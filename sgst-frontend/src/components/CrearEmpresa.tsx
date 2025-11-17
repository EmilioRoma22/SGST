import { ArrowRight, BookCheck, BuildingIcon, LogOut, Mail, MapPinHouse, Phone } from "lucide-react"
import { useEffect, useState } from "react"
import logo_sgst from '../assets/sgst_logo_black.svg'
import ModalCerrarSesion from "./ModalCerrarSesion"
import { AnimatePresence } from "motion/react"
import { crearEmpresa } from "../services/api"
import { mostrarToast } from "../utils/MostrarToast"
import { Toaster } from 'react-hot-toast';
import { Loading } from "./Loading"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export const CrearEmpresa = () => {
    const navigate = useNavigate()
    const { loadingUsuario, usuario, setUsuario } = useAuth()
    const [formEmpresa, setFormEmpresa] = useState({
        nombre_empresa: "",
        correo_empresa: "",
        direccion_empresa: "",
        rfc_empresa: "",
        telefono_empresa: ""
    })
    const [errores, setErrores] = useState({
        nombre_empresa: "",
        correo_empresa: "",
        direccion_empresa: "",
        rfc_empresa: "",
        telefono_empresa: ""
    })

    const [loading, setLoading] = useState(false)
    const [mostrarModal, setMostrarModal] = useState(false)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormEmpresa(prev => ({
            ...prev,
            [name]: value
        }));
    }

    useEffect(() => {
        if (!loadingUsuario) {
            if (usuario === null) {
                navigate("/")
                return
            }

            if (usuario.id_empresa !== 0) navigate("/suscripciones")
        }
    }, [loadingUsuario])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const nuevosErrores = {
            nombre_empresa: "",
            correo_empresa: "",
            direccion_empresa: "",
            rfc_empresa: "",
            telefono_empresa: ""
        };

        if (formEmpresa.nombre_empresa.trim() === "") nuevosErrores.nombre_empresa = "El nombre de la empresa es obligatorio";
        if (formEmpresa.nombre_empresa.trim() === "") nuevosErrores.correo_empresa = "El correo es obligatorio";
        if (formEmpresa.nombre_empresa.trim() === "") nuevosErrores.direccion_empresa = "La dirección es obligatoria";
        if (formEmpresa.nombre_empresa.trim() === "") nuevosErrores.rfc_empresa = "El RFC es obligatorio";
        if (formEmpresa.nombre_empresa.trim() === "") nuevosErrores.telefono_empresa = "El telefono es obligatorio";
        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setLoading(false)
            return;
        }

        try {
            const respuesta = await crearEmpresa(formEmpresa);

            if (respuesta.ok && respuesta.id_empresa) {
                mostrarToast(respuesta.message, "success")
                if (!usuario) return;

                setUsuario(prev =>
                    prev ? {
                        ...prev,
                        id_empresa: respuesta.id_empresa!
                    } : null
                );

                navigate("/suscripciones")
            } else {
                mostrarToast(respuesta.message, "error");
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            mostrarToast("Hubo un error al registrar su empresa. Por favor, intenta más tarde.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="min-h-screen bg-linear-to-br bg-white text-white">
                <header className="flex items-center justify-between px-10 py-5 border-b text-black border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <img src={logo_sgst} className="text-purple-400 w-8 h-8" />
                        <h1 className="text-2xl font-bold tracking-wide hidden md:block">Sistema de Gestión de Servicios Técnicos</h1>
                    </div>
                    <button
                        className="flex items-center gap-2 text-red-500 hover:text-red-800 cursor-pointer transition"
                        onClick={() => { setMostrarModal(true) }}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Cerrar sesión</span>
                    </button>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-20 mt-4">
                    <div className="max-w-2xl w-full">
                        <h2 className="text-4xl font-bold mb-2 text-black">Registra tu empresa</h2>
                        <p className="text-gray-400 mb-10">
                            Ingresa los datos de tu empresa para continuar con la configuración del sistema.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col">
                                <label htmlFor="nombre_empresa" className="text-sm mb-2 text-black">Nombre de la empresa</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        id="nombre_empresa"
                                        name="nombre_empresa"
                                        value={formEmpresa.nombre_empresa}
                                        onChange={handleInputChange}
                                        placeholder="Ej. Sistemas Innovadores S.A. de C.V."
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic"
                                    />
                                    <BuildingIcon className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                                </div>
                                {errores.nombre_empresa && (
                                    <div
                                        key="correo_usuario_error"
                                    >
                                        <p className="text-red-600 text-sm p-1">
                                            {errores.nombre_empresa}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2 text-black">Correo de contacto</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="email"
                                        name="correo_empresa"
                                        value={formEmpresa.correo_empresa}
                                        onChange={handleInputChange}
                                        placeholder="empresa@correo.com"
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic"
                                    />
                                    <Mail className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                                </div>
                                {errores.correo_empresa && (
                                    <div
                                        key="correo_usuario_error"
                                    >
                                        <p className="text-red-600 text-sm p-1">
                                            {errores.correo_empresa}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2 text-black">Dirección</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        name="direccion_empresa"
                                        value={formEmpresa.direccion_empresa}
                                        onChange={handleInputChange}
                                        placeholder="Calle, número, ciudad, estado"
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic"
                                    />
                                    <MapPinHouse className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                                </div>
                                {errores.direccion_empresa && (
                                    <div
                                        key="correo_usuario_error"
                                    >
                                        <p className="text-red-600 text-sm p-1">
                                            {errores.direccion_empresa}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2 text-black">RFC</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        name="rfc_empresa"
                                        value={formEmpresa.rfc_empresa}
                                        onChange={handleInputChange}
                                        placeholder="Ej. ABCD123456XYZ"
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic"
                                        maxLength={13}
                                    />
                                    <BookCheck className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                                </div>
                                {errores.rfc_empresa && (
                                    <div
                                        key="correo_usuario_error"
                                    >
                                        <p className="text-red-600 text-sm p-1">
                                            {errores.rfc_empresa}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2 text-black">Teléfono</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="tel"
                                        name="telefono_empresa"
                                        value={formEmpresa.telefono_empresa}
                                        onChange={handleInputChange}
                                        placeholder="Ej. 55 1234 5678"
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-10 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none placeholder:text-gray-500 placeholder:italic"
                                        maxLength={10}
                                    />
                                    <Phone className="text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                                </div>
                                {errores.telefono_empresa && (
                                    <div
                                        key="correo_usuario_error"
                                    >
                                        <p className="text-red-600 text-sm p-1">
                                            {errores.telefono_empresa}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="flex justify-center items-center hover:scale-[1.02] w-full gap-4 py-4 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none cursor-pointer transition-all ease-in-out duration-300"
                            >
                                Registrar Empresa
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {mostrarModal && (
                    <ModalCerrarSesion
                        cerrarModal={() => { setMostrarModal(false) }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(loading || loadingUsuario) && (
                    <Loading />
                )}
            </AnimatePresence>
            <Toaster />
        </div>
    );
}
