import { useEffect, useState } from "react"
import { obtenerTalleres, verificarSuscripcion } from "../../services/api"
import { useNavigate } from "react-router-dom"
import type { Talleres } from "../../services/interfaces"
import { LogOut, Mail, MapPin, Phone, PlusCircle, Wrench } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import logo_sgst from '../../assets/sgst_logo_black.svg'
import { ModalAgregarTaller } from "./ModalAgregarTaller"
import { Toaster } from "react-hot-toast"
import { mostrarToast } from "../../utils/MostrarToast"
import ModalCerrarSesion from "../ModalCerrarSesion"
import { Loading } from "../Loading"
import { useAuth } from "../../contexts/AuthContext"
import { useTaller } from "../../contexts/TallerContext"

export const DashboardTalleres = () => {
    const navigate = useNavigate()
    const { loading_taller, taller, rol_taller } = useTaller()
    const { setTaller, setRolTaller } = useTaller()
    const { usuario } = useAuth()
    const [id_licencia, setLicencia] = useState("")
    const [deshabilitarAgregarTaller, setDeshabilitarAgregarTaller] = useState(false)
    const [talleres, setTalleres] = useState<Talleres[]>([])
    const [mostrarModalAgregarTaller, setMostrarModalAgregarTaller] = useState(false)
    const [modalCerrarSesion, setModalCerrarSesion] = useState(false)
    const [formTaller, setFormTaller] = useState({
        nombre_taller: "",
        telefono_taller: "",
        correo_taller: "",
        direccion_taller: "",
        rfc_taller: "",
    })
    const [loading, setLoading] = useState(true)

    const obtTalleres = async () => {
        if (usuario) {
            const respuesta = await obtenerTalleres(usuario.id_empresa);
            setTalleres(respuesta)
        }
    }

    const verificar = async () => {
        if (usuario) {
            const respuesta = await verificarSuscripcion(usuario.id_empresa)

            if (respuesta.suscripcion_activa) {
                if (!respuesta.id_licencia) return
                else setLicencia(respuesta.id_licencia.toString())
            }
            else {
                navigate("/suscripciones")
            }
        }
    }

    useEffect(() => {
        if (!loading_taller) if (taller && rol_taller) {
            navigate("/dashboard")
        }
    
        Promise.all([
            verificar(),
            obtTalleres()
        ]).then(()=>{setLoading(false)})
    }, [loading_taller, taller, rol_taller])

    useEffect(() => {
        const verificarLimiteTalleres = () => {
            const id_licencia_num = parseInt(id_licencia);
            let max_talleres = 0;
            switch (id_licencia_num) {
                case 1:
                    max_talleres = 1;
                    break;
                case 2:
                    max_talleres = 2
                    break;
                case 3:
                    max_talleres = 0;
                    break;
                default:
                    max_talleres = 0;
            }

            setDeshabilitarAgregarTaller(talleres.length >= max_talleres && max_talleres !== 0);
        }

        verificarLimiteTalleres();
    }, [id_licencia, talleres]);

    return (
        <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 to-gray-100 text-gray-800">
            <header className="flex items-center justify-between px-10 py-5 border-b border-gray-200 backdrop-blur-sm bg-white/70 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={logo_sgst} className="w-10 h-10" />
                    <h1 className="text-2xl font-bold tracking-wide text-gray-900 hidden md:block">
                        Sistema de Gestión de Servicios Técnicos
                    </h1>
                </div>
                <button
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 transition cursor-pointer"
                    onClick={() => setModalCerrarSesion(true)}
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cerrar sesión</span>
                </button>
            </header>

            <main className="flex-1 px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-semibold tracking-tight">Mis Talleres</h2>
                    <button
                        onClick={() => {
                            if (!deshabilitarAgregarTaller) {
                                setMostrarModalAgregarTaller(true)
                            } else {
                                mostrarToast("Has alcanzado el límite de talleres permitidos por tu licencia actual.", "error")
                            }
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 bg-linear-to-r ${deshabilitarAgregarTaller ? "from-gray-400 to-gray-500" : "from-gray-700 to-gray-900"} text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform cursor-pointer`}
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Agregar Taller</span>
                    </button>
                </div>

                {talleres && talleres.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                        {talleres.map((taller, i) => (
                            <motion.div
                                key={taller.id_taller}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-transform transform hover:scale-[1.02] ease-in-out duration-300"
                                onClick={() => {
                                    localStorage.setItem("tallerActivo", taller.id_taller.toString())
                                    localStorage.setItem("rolActivo", "ADMIN")
                                    setTaller(taller)
                                    setRolTaller("ADMIN")
                                    navigate("/dashboard")
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-gray-100 p-3 rounded-xl">
                                        <Wrench className="text-gray-900 w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {taller.nombre_taller}
                                    </h3>
                                </div>
                                <div className="flex gap-2 itmems-center mb-2">
                                    <Phone className="inline-block w-4.5 h-4.5" />
                                    <p className="text-sm text-gray-600">
                                        {taller.telefono_taller}
                                    </p>
                                </div>
                                <div className="flex gap-2 itmems-center mb-2">
                                    <Mail className="inline-block w-4.5 h-4.5" />
                                    <p className="text-sm text-gray-600">
                                        {taller.correo_taller}
                                    </p>
                                </div>
                                <div className="flex gap-2 itmems-center mb-2">
                                    <MapPin className="inline-block w-4.5 h-4.5" />
                                    <p className="text-sm text-gray-600">
                                        {taller.direccion_taller}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <>
                        {!loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Wrench className="w-14 h-14 mb-4 text-gray-400" />
                                <p className="text-lg font-medium">Aún no tienes talleres registrados</p>
                                <p className="text-sm mb-6">Agrega tu primer taller para comenzar</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <AnimatePresence>
                {mostrarModalAgregarTaller && (
                    <ModalAgregarTaller
                        cerrarModal={() => setMostrarModalAgregarTaller(false)}
                        formTaller={formTaller}
                        setFormTaller={setFormTaller}
                        mostrarToast={mostrarToast}
                        tallerCreado={obtTalleres}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalCerrarSesion && (
                    <ModalCerrarSesion
                        cerrarModal={() => setModalCerrarSesion(false)}
                    />
                )}
            </AnimatePresence>

            <Toaster />

            {(loading || loading_taller) && (
                <Loading />
            )}
        </div>
    )
}
