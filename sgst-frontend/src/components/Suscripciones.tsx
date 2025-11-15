import logo_sgst from '../assets/sgst_logo_black.svg'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Licencias } from "../services/interfaces";
import { obtenerLicencias, seleccionarLicencia, verificarSuscripcion } from "../services/api";
import { LogOut } from "lucide-react";
import { AnimatePresence } from "motion/react";
import ModalCerrarSesion from "./ModalCerrarSesion";
import { mostrarToast } from "../utils/MostrarToast";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "../contexts/AuthContext";
import { Loading } from "./Loading";

export const Suscripciones = () => {
    const navigate = useNavigate();
    const { usuario, loading } = useAuth()
    const [licencias, setLicencias] = useState<Licencias[]>([]);
    const [_loading, setLoading] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false)

    useEffect(() => {
        const verificar = async () => {
            if (!usuario) {
                navigate("/")
                return
            }
            
            if (usuario.id_empresa === 0) {
                navigate("/crear_empresa");
                return;
            }

            const respuesta = await verificarSuscripcion(usuario.id_empresa);
            if (respuesta.suscripcion_activa) navigate("/dashboard_talleres");
        };

        const obtLicencias = async () => {
            setLoading(true);
            try {
                const _licencias = await obtenerLicencias();
                setLicencias(_licencias || []);
            } catch (error: any) {
                navigate("/error_servidor");
            } finally {
                setLoading(false);
            }
        };

        obtLicencias();
        verificar()
    }, []);

    async function handleInputLicencia(licencia: Licencias) {
        try {
            setLoading(true)

            if (!usuario){
                mostrarToast("Hubo un error", "error")
                return
            }

            const respuesta = await seleccionarLicencia(usuario.id_empresa, licencia.id_licencia);

            if (respuesta.ok) {
                navigate("/dashboard_talleres")
            } else {
                mostrarToast("No se ha podido seleccionar la licencia. Inténtelo de nuevo más tarde.", "error")
            }
        } catch (error: any) {
            console.error("Error al seleccionar la licencia: ", error.message)
        }finally {
            setLoading(false)
        }
    }

    return (
        <>
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
            <div className="min-h-screen px-6 py-12 bg-white">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-gray-900">
                        Planes y Suscripciones
                    </h2>
                    <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
                        Elige el plan que mejor se adapte a las necesidades de tu empresa.
                    </p>
                </div>

                {_loading ? (
                    <p className="text-center text-gray-500">Cargando licencias...</p>
                ) : (
                    <div className="container mx-auto grid gap-10 lg:grid-cols-2 xl:grid-cols-3">
                        {licencias.map((licencia, index) => (
                            <div
                                key={index}
                                className="relative p-8 border border-gray-200 rounded-2xl shadow-sm flex flex-col bg-white"
                            >
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {licencia.nombre_licencia}
                                    </h3>

                                    <p className="mt-4 flex items-baseline text-gray-900">
                                        <span className="text-5xl font-extrabold tracking-tight">
                                            ${licencia.precio_mensual}
                                        </span>
                                        <span className="ml-1 text-xl font-semibold">/mes</span>
                                    </p>

                                    {licencia.precio_anual && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            o ${licencia.precio_anual} por año
                                        </p>
                                    )}

                                    <p className="mt-6 text-gray-600">{licencia.descripcion}</p>

                                    <ul role="list" className="mt-6 space-y-4 text-gray-700">
                                        <li className="flex">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="shrink-0 w-6 h-6 text-gray-900"
                                                aria-hidden="true"
                                            >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span className="ml-3">
                                                Hasta {licencia.max_talleres === 0 ? "infinitos" : licencia.max_talleres} talleres
                                            </span>
                                        </li>

                                        <li className="flex">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="shrink-0 w-6 h-6 text-gray-900"
                                                aria-hidden="true"
                                            >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span className="ml-3">
                                                Hasta {licencia.max_usuarios === 0 ? "infinitos" : licencia.max_usuarios} usuarios
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handleInputLicencia(licencia)}
                                    className="bg-gray-900 hover:bg-gray-800 text-white hover:scale-[1.02] mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium transition cursor-pointer"
                                >
                                    Elegir este plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {mostrarModal && (
                    <ModalCerrarSesion
                        cerrarModal={() => { setMostrarModal(false) }}
                    />
                )}
            </AnimatePresence>

            <Toaster />
            
            {loading && (
                <Loading />
            )}
        </>
    );
};
