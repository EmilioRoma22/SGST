import { useEffect, useState } from "react";
import { Loading } from './Loading';
import { Eye, EyeClosed, Mail } from 'lucide-react';
import { loginUsuario } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

type FormDatos = {
    correo_usuario: string,
    password_usuario: string
}

type Props = {
    mostrarToast: (mensaje: string, tipo: "error" | "success") => void,
    formDatos: FormDatos;
    setFormDatos: React.Dispatch<React.SetStateAction<FormDatos>>;
}

export const Login = ({ mostrarToast, formDatos, setFormDatos }: Props) => {
    const navigate = useNavigate();
    const { setUsuario, usuario, loading } = useAuth()
    const [_loading, setLoading] = useState(false)
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [errores, setErrores] = useState({
        correo_usuario: "",
        password_usuario: "",
    });

    useEffect(() => {
        if (!loading && usuario) {
            if (usuario.id_empresa === 0) {
                if (usuario.rol_en_taller) {
                    localStorage.setItem("tallerActivo", JSON.stringify({ ...usuario.taller, rol_taller: usuario.rol }))
                    navigate("/dashboard")
                } else {
                    navigate('/crear_empresa')
                }
            }
            if (usuario.id_empresa !== 0) navigate("/dashboard_talleres")
        }
    }, [usuario, loading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormDatos(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const nuevosErrores = {
            correo_usuario: "",
            password_usuario: "",
        };

        if (formDatos.correo_usuario.trim() === "") nuevosErrores.correo_usuario = "El correo es obligatorio";
        if (formDatos.password_usuario.trim() === "") nuevosErrores.password_usuario = "La contraseña es obligatoria";
        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setLoading(false)
            return;
        }

        try {
            const respuesta = await loginUsuario(formDatos.correo_usuario, formDatos.password_usuario);

            if (respuesta.ok && respuesta.usuario) {
                setUsuario(respuesta.usuario)

                if (respuesta.usuario.id_empresa === 0) {
                    if (respuesta.rol_en_taller) {
                        localStorage.setItem("tallerActivo", JSON.stringify({ ...respuesta.taller, rol_taller: respuesta.rol }))
                        navigate("/dashboard")
                    } else {
                        navigate('/crear_empresa')
                    }
                }
                if (respuesta.usuario.id_empresa !== 0) navigate("/dashboard_talleres")

            } else {
                mostrarToast(respuesta.message, "error");
            }

        } catch (error) {
            console.error("Error en el inicio de sesion:", error);
            mostrarToast("Hubo un error al registrar el usuario. Por favor, intenta de nuevo.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            key={"motion-div"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-8">
                    <h1 className="text-slate-900 text-3xl font-bold">Iniciar sesión</h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-slate-900 text-[15px] font-medium mb-2 block">Correo electrónico</label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                id="correo_usuario"
                                name="correo_usuario"
                                value={formDatos.correo_usuario}
                                onChange={handleInputChange}
                                className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                placeholder="Ingresa tu correo electrónico"
                            />
                            <Mail className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                        </div>
                        {errores.correo_usuario && (
                            <div
                                key="correo_usuario_error"
                                className="mb-4"
                            >
                                <p className="text-red-600 text-sm p-2 rounded-md">
                                    {errores.correo_usuario}
                                </p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-slate-900 text-[15px] font-medium mb-2 block">Contraseña</label>
                        <div className="relative flex items-center">
                            <input
                                id="password_usuario"
                                name="password_usuario"
                                type={mostrarContraseña ? "text" : "password"}
                                className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                placeholder="Ingresa tu contraseña"
                                onChange={handleInputChange}
                            />
                            <button
                                type="button"
                                onClick={() => { setMostrarContraseña(prev => !prev); }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                {mostrarContraseña ? <Eye className='text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5' /> : <EyeClosed className='text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5' />}
                            </button>
                        </div>
                        {errores.password_usuario && (
                            <div
                                key="contraseña_usuario_error"
                            >
                                <p className="text-red-600 text-sm p-2 rounded-md">
                                    {errores.password_usuario}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <button type="submit" className="w-full py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none cursor-pointer transition-colors ease-in-out">
                        Iniciar sesión
                    </button>
                </div>
            </form>

            {(_loading || loading) && (
                <Loading />
            )}

        </motion.div>
    )
}