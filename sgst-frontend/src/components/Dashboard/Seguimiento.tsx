import { useState } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Seguimiento {
  id: number;
  fecha: string;
  tipo: "Reparación" | "Diagnóstico" | "Garantía" | "Entrega";
  responsable: string;
  notas: string;
  estado: "Pendiente" | "En progreso" | "Completado";
}

export default function SeguimientoGarantias() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([
    {
      id: 1,
      fecha: "2025-10-25",
      tipo: "Diagnóstico",
      responsable: "Juan Pérez",
      notas: "Cliente reportó pantalla rota. Se realizó diagnóstico inicial.",
      estado: "Completado",
    },
    {
      id: 2,
      fecha: "2025-10-26",
      tipo: "Reparación",
      responsable: "María González",
      notas: "Reemplazo de pantalla en proceso.",
      estado: "En progreso",
    },
    {
      id: 3,
      fecha: "2025-10-28",
      tipo: "Garantía",
      responsable: "Carlos Ramírez",
      notas: "Verificación de garantía con proveedor.",
      estado: "Pendiente",
    },
  ]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "bg-emerald-100 text-emerald-700";
      case "En progreso":
        return "bg-yellow-100 text-yellow-700";
      case "Pendiente":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getIcono = (estado: string) => {
    switch (estado) {
      case "Completado":
        return <CheckCircle size={20} />;
      case "En progreso":
        return <Clock size={20} />;
      case "Pendiente":
        return <AlertCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-2xl font-bold text-gray-800">Seguimiento y Garantías</h3>

      <div className="relative border-l border-gray-200 ml-4">
        {seguimientos.map((s, i) => (
          <div key={s.id} className="mb-8 ml-6 flex flex-col gap-2">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 ${getEstadoColor(
                s.estado
              )}`}
            >
              {getIcono(s.estado)}
            </span>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">{s.tipo}</h4>
                <span className={`text-sm font-medium ${getEstadoColor(s.estado)}`}>{s.estado}</span>
              </div>
              <p className="text-gray-600 mt-1">{s.notas}</p>
              <p className="text-gray-500 text-sm mt-2">Responsable: {s.responsable}</p>
              <p className="text-gray-400 text-xs">{s.fecha}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
