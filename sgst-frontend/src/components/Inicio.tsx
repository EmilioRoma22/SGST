import { useEffect, useState } from 'react';
import logo_sgst from '../assets/sgst_logo_white.svg'
import { Login } from './Login';
import { Registro } from './Registro';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { mostrarToast } from '../utils/MostrarToast';
import { useAuth } from '../contexts/AuthContext';

export const Inicio = () => {
    const navigate = useNavigate()
    const { usuario, loading } = useAuth()
    const [inicioSesionState, setInicioSesionState] = useState(true);
    const [formDatos, setFormDatos] = useState({
        correo_usuario: "",
        password_usuario: ""
    })
    const [formDatosRegistro, setFormDatosRegistro] = useState({
        nombre_usuario: "",
        apellidos_usuario: "",
        correo_usuario: "",
        telefono_usuario: "",
        password_usuario: "",
        confirmar_password_usuario: ""
    });

    useEffect(() => {
        if (!loading) {
            if (usuario) {
                if (usuario.id_empresa === 0) navigate('/crear_empresa')
                if (usuario.id_empresa !== 0) navigate("/dashboard_talleres")
            }
        }
    }, [])

    return (
        <div className='min-h-screen'>
            <div className="grid lg:grid-cols-5 md:grid-cols-2 items-center gap-y-4 h-full">
                <div className="max-md:order-1 lg:col-span-3 md:h-screen w-full bg-gray-900 md:rounded-tr-xl md:rounded-br-xl lg:p-12 p-8">
                    <img src={logo_sgst} className="lg:w-2/3 w-full h-full object-contain block mx-auto" alt="login-image" />
                </div>
                <div className="lg:col-span-2 w-full p-8 max-w-lg max-md:max-w-lg mx-auto">
                    <div
                        className="flex gap-x-2 mb-6 justify-center lg:justify-end lg:absolute lg:top-6 lg:right-8 md:top-6 md:right-6"
                    >
                        <button
                            className={`px-4 py-2 rounded-full transition-colors ease-in-out duration-300 cursor-pointer
                                ${inicioSesionState
                                    ? 'bg-gray-900 text-white'
                                    : 'hover:bg-gray-200'}`}
                            onClick={() => {
                                setInicioSesionState(true);
                            }}
                        >
                            Entrar
                        </button>

                        <button
                            className={`px-4 py-2 rounded-full transition-colors ease-in-out duration-300 cursor-pointer
                                ${!inicioSesionState
                                    ? 'bg-gray-900 text-white'
                                    : 'hover:bg-gray-200'}`}
                            onClick={() => {
                                setInicioSesionState(false);
                            }}
                        >
                            Registrarse
                        </button>
                    </div>

                    <div className='flex justify-center items-center'>
                        <div className='w-full max-w-3xl'>

                            <AnimatePresence>
                                {inicioSesionState ? (
                                    <div>
                                        <Login
                                            mostrarToast={mostrarToast}
                                            formDatos={formDatos}
                                            setFormDatos={setFormDatos}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <Registro
                                            registroCompleto={() => {
                                                setInicioSesionState(true);
                                                setFormDatosRegistro({
                                                    nombre_usuario: "",
                                                    apellidos_usuario: "",
                                                    correo_usuario: "",
                                                    telefono_usuario: "",
                                                    password_usuario: "",
                                                    confirmar_password_usuario: ""
                                                })
                                            }}
                                            mostrarToast={mostrarToast}
                                            formDatos={formDatosRegistro}
                                            setFormDatos={setFormDatosRegistro}
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <Toaster />
            </div>
        </div>
    );
}