import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, ClipboardList, Wrench, RefreshCw, BarChart3,
  Calendar, DollarSign, Settings, LogOut, Menu
} from "lucide-react";
import { permisosSidebar } from "../../utils/rolesPermitidos";
import { useTaller } from "../../contexts/TallerContext";
import { Loading } from "../Loading";

export default function SidebarTaller({ onSelect, active, onLogout }: {
  onSelect: (module: string) => void,
  active: string,
  onLogout: () => void
}) {
  const { taller, rol_taller, loading_taller } = useTaller()  
  const [open, setOpen] = useState(true);

  const items = [
    { icon: <Users size={20} />, label: "Clientes" },
    { icon: <ClipboardList size={20} />, label: "Órdenes de servicio" },
    { icon: <Wrench size={20} />, label: "Gestión de equipos" },
    { icon: <RefreshCw size={20} />, label: "Seguimiento y garantías" },
    { icon: <BarChart3 size={20} />, label: "Reportes" },
    { icon: <Calendar size={20} />, label: "Calendario" },
    { icon: <DollarSign size={20} />, label: "Finanzas" },
    { icon: <Settings size={20} />, label: "Configuración" },
  ];

  const itemsPermitidos = permisosSidebar[(rol_taller ? rol_taller : "ADMIN") as "ADMIN" | "RECEPCIONISTA" | "TECNICO"] || [];

  return (
    <div className="h-screen flex bg-gray-50 text-gray-800">
      <motion.aside
        animate={{ width: open ? 250 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col justify-between shadow-md transition-all duration-300"
      >
        <div>
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
            <motion.h1
              animate={{ opacity: open ? 1 : 0 }}
              className={`text-lg font-bold text-gray-900 tracking-wide ${!open && "hidden"}`}
            >
              {taller ? taller.nombre_taller : "Taller"}
            </motion.h1>
            <button
              onClick={() => setOpen(!open)}
              className={`text-gray-900 hover:text-gray-800 transition ${!open && "rotate-180"}`}
            >
              <Menu size={22} />
            </button>
          </div>

          <nav className="flex flex-col mt-3">
            {items
              .filter(item => itemsPermitidos.includes(item.label))
              .map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(item.label)}
                  className={`flex items-center gap-3 px-5 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-300 ${active === item.label
                    ? "bg-gray-800 text-white font-medium border-l-4 border-gray-400"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <div>{item.icon}</div>
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
          </nav>

        </div>

        <div className="border-t border-gray-200 mt-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-3 px-5 py-4 mx-2 my-2 text-red-600 hover:bg-red-100 rounded-xl cursor-pointer transition"
          >
            <LogOut size={20} />
            {open && <span className="text-sm font-medium">Cerrar sesión</span>}
          </motion.div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {loading_taller && (
          <Loading />
        )}
      </AnimatePresence>
    </div>
  );
}
