import { useState } from "react";
import { FileText, BarChart3, Download, Calendar, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface Reporte {
  id: number;
  tipo: string;
  nombre: string;
  fecha: string;
  generadoPor: string;
}

export default function Reportes() {
  const [reportes, setReportes] = useState<Reporte[]>([
    { id: 1, tipo: "Finanzas", nombre: "reporte_financiero_octubre.pdf", fecha: "2025-10-28", generadoPor: "Admin" },
    { id: 2, tipo: "Órdenes de servicio", nombre: "ordenes_servicio_semana_43.pdf", fecha: "2025-10-27", generadoPor: "Sofía Torres" },
    { id: 3, tipo: "Clientes activos", nombre: "clientes_activos_octubre.pdf", fecha: "2025-10-26", generadoPor: "Carlos Ramírez" },
    { id: 4, tipo: "Inventario", nombre: "reporte_inventario_actual.pdf", fecha: "2025-10-25", generadoPor: "Juan Pérez" },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reportes del Taller</h2>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          Generar nuevo reporte
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col items-start gap-2"
        >
          <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl">
            <BarChart3 size={22} />
          </div>
          <p className="text-sm text-gray-500">Reportes totales</p>
          <h3 className="text-xl font-semibold text-gray-800">{reportes.length}</h3>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col items-start gap-2"
        >
          <div className="bg-yellow-100 text-yellow-700 p-3 rounded-xl">
            <FileText size={22} />
          </div>
          <p className="text-sm text-gray-500">Reportes financieros</p>
          <h3 className="text-xl font-semibold text-gray-800">3</h3>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col items-start gap-2"
        >
          <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
            <PieChart size={22} />
          </div>
          <p className="text-sm text-gray-500">Promedio por mes</p>
          <h3 className="text-xl font-semibold text-gray-800">6 reportes</h3>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col items-start gap-2"
        >
          <div className="bg-rose-100 text-rose-700 p-3 rounded-xl">
            <Activity size={22} />
          </div>
          <p className="text-sm text-gray-500">Último generado</p>
          <h3 className="text-xl font-semibold text-gray-800">{reportes[0].fecha}</h3>
        </motion.div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-600 font-semibold text-sm">Tipo de reporte</th>
              <th className="text-left px-6 py-3 text-gray-600 font-semibold text-sm">Nombre del archivo</th>
              <th className="text-left px-6 py-3 text-gray-600 font-semibold text-sm">Fecha de generación</th>
              <th className="text-left px-6 py-3 text-gray-600 font-semibold text-sm">Generado por</th>
              <th className="text-center px-6 py-3 text-gray-600 font-semibold text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <motion.tr
                key={reporte.id}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className="border-t border-gray-200"
              >
                <td className="px-6 py-4 text-gray-800 font-medium">{reporte.tipo}</td>
                <td className="px-6 py-4 text-gray-600">{reporte.nombre}</td>
                <td className="px-6 py-4 text-gray-500">{reporte.fecha}</td>
                <td className="px-6 py-4 text-gray-600">{reporte.generadoPor}</td>
                <td className="px-6 py-4 text-center">
                  <button className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition mx-auto">
                    <Download size={18} />
                    Descargar
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
