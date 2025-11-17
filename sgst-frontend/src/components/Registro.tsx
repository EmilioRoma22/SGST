import React, { useState } from "react";
import { Eye, EyeClosed, Mail, Phone } from 'lucide-react';
import { registrarUsuario } from '../services/api';
import { motion } from 'motion/react';

type FormDatos = {
    nombre_usuario: string,
    apellidos_usuario: string,
    correo_usuario: string,
    telefono_usuario: string,
    password_usuario: string,
    confirmar_password_usuario: string
}

type Props = {
    registroCompleto: () => void,
    mostrarToast: (mensaje: string, tipo: "error" | "success") => void,
    formDatos: FormDatos;
    setFormDatos: React.Dispatch<React.SetStateAction<FormDatos>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export const Registro = ({ mostrarToast, registroCompleto, formDatos, setFormDatos, setLoading }: Props) => {
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [mostrarContraseñaConfirmar, setMostrarContraseñaConfirmar] = useState(false);
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
            const respuesta = await registrarUsuario(formDatos);

            if (respuesta.ok) {
                mostrarToast(respuesta.message, "success")
                registroCompleto()
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

    return (
        <motion.div
            key={"motion-div"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <h1 className="text-slate-900 text-3xl font-bold">Regístrate</h1>
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
                                className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                placeholder="Ingresa tu nombre"
                            />

                            <input
                                type="text"
                                id="apellidos_usuario"
                                name="apellidos_usuario"
                                onChange={handleInputChange}
                                value={formDatos.apellidos_usuario}
                                className="w-full text-sm text-slate-900 bg-slate-100 focus:bg-transparent pl-4 pr-10 py-3.5 rounded-md border border-gray-200 focus:border-blue-600 outline-none"
                                placeholder="Ingresa tus apellidos"
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
                                placeholder="Ingresa tu correo electrónico"
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
                                placeholder="Ingresa tu telefono"
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
                                    placeholder="Ingresa tu contraseña"
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
                                    placeholder="Confirma tu contraseña"
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
        </motion.div>
    )
}