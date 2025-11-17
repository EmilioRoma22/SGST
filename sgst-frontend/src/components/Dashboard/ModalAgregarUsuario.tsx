import { Eye, EyeClosed, Mail, Phone, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { DatosUsuarioRegistro } from "../../services/interfaces";
import { Loading } from "../Loading";
import { crearUsuarioTaller } from "../../services/api";
import { useTaller } from "../../contexts/TallerContext";

type Props = {
    cerrarModal: () => void;
    formDatos: DatosUsuarioRegistro
    setFormDatos: React.Dispatch<React.SetStateAction<DatosUsuarioRegistro>>;
    mostrarToast: (mensaje: string, tipo: "success" | "error") => void;
    usuario_creado: () => void
}

export const ModalAgregarUsuario = ({ cerrarModal, formDatos, setFormDatos, mostrarToast, usuario_creado }: Props) => {
    const [loading, setLoading] = useState(false)
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [mostrarContraseñaConfirmar, setMostrarContraseñaConfirmar] = useState(false);
    const { taller } = useTaller()
    const [rol, setRol] = useState(2)
    const [errores, setErrores] = useState({
        nombre_usuario: "",
        apellidos_usuario: "",
        correo_usuario: "",
        telefono_usuario: "",
        password_usuario: "",
        confirmar_password_usuario: ""
    });
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
            nombre_usuario: "",
            apellidos_usuario: "",
            correo_usuario: "",
            telefono_usuario: "",
            password_usuario: "",
            confirmar_password_usuario: ""
        };

        if (formDatos.nombre_usuario.trim() === "") nuevosErrores.nombre_usuario = "El nombre es obligatorio";
        if (formDatos.apellidos_usuario.trim() === "") nuevosErrores.apellidos_usuario = "Los apellidos son obligatorios";
        if (formDatos.correo_usuario.trim() === "") nuevosErrores.correo_usuario = "El correo es obligatorio";
        if (formDatos.telefono_usuario.trim() === "") nuevosErrores.telefono_usuario = "El teléfono es obligatorio";
        if (formDatos.password_usuario.trim() === "") nuevosErrores.password_usuario = "La contraseña es obligatoria";
        else if (formDatos.password_usuario.length < 6) nuevosErrores.password_usuario = "La contraseña debe tener al menos 6 caracteres";
        if (formDatos.confirmar_password_usuario.trim() === "") nuevosErrores.confirmar_password_usuario = "Debes confirmar la contraseña";
        else if (formDatos.password_usuario !== formDatos.confirmar_password_usuario) nuevosErrores.confirmar_password_usuario = "Las contraseñas no coinciden";
        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setLoading(false)
            return;
        }

        try {
            if (!taller) {
                mostrarToast("No se encontró el taller activo. Por favor, intenta de nuevo.", "error");
                setLoading(false);
                return;
            }
            const respuesta = await crearUsuarioTaller(Number(taller.id_taller), rol, formDatos);

            if (respuesta.ok) {
                mostrarToast(respuesta.message, "success")
                usuario_creado()
                cerrarModal()
            } else {
                mostrarToast(respuesta.message, "error");
            }

        } catch (error) {
            console.error("Error en el registro:", error);
            mostrarToast("Hubo un error al registrar el usuario. Por favor, intenta de nuevo.", "error");
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

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <h1 className="text-slate-900 text-3xl font-bold">Nuevo usuario</h1>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className='flex gap-4 mb-2'>
                                <div className='w-full'>
                                    <label htmlFor="nombre_usuario" className='text-slate-900 text-[15px] font-medium mb-2 block'>Nombre</label>
                                </div>
                                <div className='w-full'>
                                    <label htmlFor="apellidos_usuario" className='text-slate-900 text-[15px] font-medium mb-2 block'>Apellidos</label>
                                </div>
                            </div>
                            <div className='flex gap-6'>
                                <input
                                    type="text"
                                    id="nombre_usuario"
                                    name="nombre_usuario"
                                    onChange={handleInputChange}
                                    value={formDatos.nombre_usuario}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ingresa el nombre"
                                />

                                <input
                                    type="text"
                                    id="apellidos_usuario"
                                    name="apellidos_usuario"
                                    onChange={handleInputChange}
                                    value={formDatos.apellidos_usuario}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ingresa los apellidos"
                                />
                            </div>
                            <div className='flex gap-4'>
                                <div className='w-full'>
                                    {errores.nombre_usuario && (
                                        <div
                                            key="nombre_usuario_error"
                                        >
                                            <p className="text-red-600 text-sm p-2 rounded-md">
                                                {errores.nombre_usuario}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className='w-full'>
                                    {errores.apellidos_usuario && (
                                        <div
                                            key="apellidos_usuario_error"
                                        >
                                            <p className="text-red-600 text-sm p-2 rounded-md">
                                                {errores.apellidos_usuario}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-900 text-[15px] font-medium mb-2 block">Correo electrónico</label>
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    id="correo_usuario"
                                    name="correo_usuario"
                                    value={formDatos.correo_usuario}
                                    onChange={handleInputChange}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ingresa el correo electrónico"
                                />
                                <Mail className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                            </div>
                            {errores.correo_usuario && (
                                <div
                                    key="correo_usuario_error"
                                >
                                    <p className="text-red-600 text-sm p-2 rounded-md">
                                        {errores.correo_usuario}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="" className="text-slate-900 text-[15px] font-medium mb-2 block">Telefono</label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    id="telefono_usuario"
                                    name="telefono_usuario"
                                    onChange={handleInputChange}
                                    value={formDatos.telefono_usuario}
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    placeholder="Ingresa el telefono"
                                    maxLength={10}
                                    minLength={10}
                                />
                                <Phone className="text-gray-300 absolute right-3 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5" />
                            </div>

                            {errores.telefono_usuario && (
                                <div
                                    key="telefono_usuario_error"
                                >
                                    <p className="text-red-600 text-sm p-2 rounded-md">
                                        {errores.telefono_usuario}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="" className="text-slate-900 text-[15px] font-medium mb-2 block">Rol</label>
                            <div className="relative flex items-center">
                                <select
                                    name="rol_usuario"
                                    id="rol_usuario"
                                    className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                    onChange={(e) => {
                                        setRol(Number(e.target.value));
                                    }}
                                >
                                    <option value="2">Tecnico</option>
                                    <option value="3">Recepcionista</option>
                                    <option value="1">Administrador</option>
                                </select>
                            </div>

                            {errores.telefono_usuario && (
                                <div
                                    key="telefono_usuario_error"
                                >
                                    <p className="text-red-600 text-sm p-2 rounded-md">
                                        {errores.telefono_usuario}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex gap-4">
                                <div className="w-full">
                                    <label className="text-slate-900 text-[15px] font-medium mb-2 block">Contraseña</label>
                                </div>
                                <div className="w-full">
                                    <label className="text-slate-900 text-[15px] font-medium mb-2 block">Confirmar contraseña</label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative flex items-center">
                                    <input
                                        id="password_usuario"
                                        name="password_usuario"
                                        type={mostrarContraseña ? "text" : "password"}
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                        placeholder="Ingresa la contraseña"
                                        onChange={handleInputChange}
                                        value={formDatos.password_usuario}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarContraseña(prev => !prev); }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {mostrarContraseña ? <Eye className='text-gray-300 h-4.5 w-4.5 cursor-pointer' /> : <EyeClosed className='text-gray-300 h-4.5 w-4.5 cursor-pointer' />}
                                    </button>
                                </div>

                                <div className="relative flex items-center">
                                    <input
                                        id="confirmar_password_usuario"
                                        name="confirmar_password_usuario"
                                        type={mostrarContraseñaConfirmar ? "text" : "password"}
                                        className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                        placeholder="Confirma la contraseña"
                                        onChange={handleInputChange}
                                        value={formDatos.confirmar_password_usuario}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarContraseñaConfirmar(prev => !prev); }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {mostrarContraseñaConfirmar ? <Eye className='text-gray-300 h-4.5 w-4.5 cursor-pointer' /> : <EyeClosed className='text-gray-300 h-4.5 w-4.5 cursor-pointer' />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-full">
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
                                <div className="w-full">
                                    {errores.confirmar_password_usuario && (
                                        <div
                                            key="confirmar_password_usuario_error"
                                        >
                                            <p className="text-red-600 text-sm p-2 rounded-md">
                                                {errores.confirmar_password_usuario}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button type="submit" className="w-full py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none cursor-pointer transition-colors ease-in-out ">
                            Registrarme
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