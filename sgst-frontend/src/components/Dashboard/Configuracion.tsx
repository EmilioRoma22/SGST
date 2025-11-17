import { AnimatePresence, motion } from "framer-motion";
import { Settings, Bell, User, Shield, UserPlus, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Usuarios } from "../../services/interfaces";
import { mostrarToast } from "../../utils/MostrarToast";
import { Toaster } from "react-hot-toast";
import { ModalAgregarUsuario } from "./ModalAgregarUsuario";
import { obtenerUsuariosTaller } from "../../services/api";
import { useTaller } from "../../contexts/TallerContext";

export default function ConfiguracionTaller() {
  const { taller, rol_taller } = useTaller()
  const [usuariosTaller, setUsuariosTaller] = useState<Usuarios[]>()
  const [modalAgregarUsuario, setModalAgregarUsuario] = useState(false);
  const [formDatos, setFormDatos] = useState({
    nombre_usuario: "",
    apellidos_usuario: "",
    correo_usuario: "",
    telefono_usuario: "",
    password_usuario: "",
    confirmar_password_usuario: ""
  });
  const [loading, setLoading] = useState(false)

  const obtUsuariosTaller = async () => {
    if (!taller) return
    const respuesta = await obtenerUsuariosTaller(taller.id_taller)
    setUsuariosTaller(respuesta)

  }

  useEffect(() => {
    setLoading(true)

    Promise.all([
      obtUsuariosTaller(),
    ]).then(()=>{setLoading(false)})
  }, [])

  const usuario_creado = async () => {
    obtUsuariosTaller()
    setFormDatos({
      nombre_usuario: "",
      apellidos_usuario: "",
      correo_usuario: "",
      telefono_usuario: "",
      password_usuario: "",
      confirmar_password_usuario: ""
    })
  }

  return (
    <>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="bg-gray-900 text-white p-3 rounded-xl">
            <Settings size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Configuración del sistema</h2>
        </motion.div>

        {rol_taller === "ADMIN" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
            >
              <div className="relative flex justify-start">

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="text-gray-900" /> Gestión de usuarios
                </h3>
                <div className="absolute right-0 top-0">
                  <button onClick={() => setModalAgregarUsuario(true)}>
                    <UserPlus className="text-gray-900" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                Administra los usuarios que tienen acceso a este taller. Puedes agregar, eliminar o modificar permisos.
              </p>
              <div className="flex flex-col gap-4">
                {usuariosTaller && usuariosTaller.length > 0 ? (
                  usuariosTaller.map((usuario) => (
                    <div key={usuario.id_usuario} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{usuario.nombre_usuario} {usuario.apellidos_usuario}</p>
                        <p className="text-sm text-gray-600">{usuario.correo_usuario}</p>
                        <p className="text-sm text-gray-600">{usuario.rol_taller}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {loading ? (
                      <div className="flex gap-4">
                        <LoaderCircle className="h-6 w-6 animate-spin text-black" />
                        <span className="text-black font-semibold text-lg">Cargando usuarios del taller...</span>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <span className="text-black font-semibold text-lg">No hay usuarios en el taller.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="text-gray-900" /> Seguridad
          </h3>
          <p className="text-gray-600 mb-4">
            Mantén tu cuenta segura. Puedes cambiar tu contraseña.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition">
              Cambiar contraseña
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="text-gray-900" /> Notificaciones del sistema
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>Mantenimiento pendiente — 2 equipos requieren revisión esta semana.</p>
            <p>Nuevo reporte generado el 28 Oct 2025.</p>
            <p>Factura #F-120 enviada al cliente.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 text-sm pt-4"
        >
          © 2025 SGST — Sistema de Gestión de Servicios Técnicos.
          <span className="block">Versión 1.0.0</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {modalAgregarUsuario && (
          <ModalAgregarUsuario
            cerrarModal={() => setModalAgregarUsuario(false)}
            formDatos={formDatos}
            setFormDatos={setFormDatos}
            mostrarToast={mostrarToast}
            usuario_creado={usuario_creado}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </>
  );
}
