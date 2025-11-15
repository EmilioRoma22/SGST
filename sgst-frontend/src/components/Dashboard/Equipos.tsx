import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

interface Equipo {
  id_equipo: number;
  id_tipo: number;
  nombre: string;
  marca_equipo: string;
  modelo_equipo: string;
  descripcion_equipo: string;
  num_serie: string;
  cliente: string;
  fecha_registro: string;
  estado: string;
  visible: boolean;
}

export default function EquiposGridActualizado() {
  const tiposEquipos: Record<number, string> = {
    1: "Computadora portátil",
    2: "Teléfono móvil",
    3: "Impresora",
    4: "Tablet",
  };

  const [equipos, setEquipos] = useState<Equipo[]>([
    {
      id_equipo: 1,
      id_tipo: 1,
      nombre: "Laptop XPS 13",
      marca_equipo: "Dell",
      modelo_equipo: "XPS 13 9310",
      descripcion_equipo: "Laptop para uso personal y trabajo",
      num_serie: "DX13-001",
      cliente: "Juan Pérez",
      fecha_registro: "2025-10-25",
      estado: "En reparación",
      visible: true,
    },
    {
      id_equipo: 2,
      id_tipo: 2,
      nombre: "iPhone 14",
      marca_equipo: "Apple",
      modelo_equipo: "iPhone 14 Pro",
      descripcion_equipo: "Teléfono personal, pantalla rota",
      num_serie: "IP14-002",
      cliente: "María González",
      fecha_registro: "2025-10-28",
      estado: "Pendiente de diagnóstico",
      visible: true,
    },
    {
      id_equipo: 3,
      id_tipo: 3,
      nombre: "Impresora HP LaserJet",
      marca_equipo: "HP",
      modelo_equipo: "LaserJet M404",
      descripcion_equipo: "Impresora de oficina",
      num_serie: "HP-LJ404-003",
      cliente: "Carlos Ramírez",
      fecha_registro: "2025-10-20",
      estado: "Lista para entrega",
      visible: true,
    },
    {
      id_equipo: 4,
      id_tipo: 3,
      nombre: "Impresora HP LaserJet",
      marca_equipo: "HP",
      modelo_equipo: "LaserJet M404",
      descripcion_equipo: "Impresora de oficina",
      num_serie: "HP-LJ404-003",
      cliente: "Carlos Ramírez",
      fecha_registro: "2025-10-20",
      estado: "Lista para entrega",
      visible: true,
    },
    {
      id_equipo: 5,
      id_tipo: 3,
      nombre: "Impresora HP LaserJet",
      marca_equipo: "HP",
      modelo_equipo: "LaserJet M404",
      descripcion_equipo: "Impresora de oficina",
      num_serie: "HP-LJ404-003",
      cliente: "Carlos Ramírez",
      fecha_registro: "2025-10-20",
      estado: "Lista para entrega",
      visible: true,
    },
    {
      id_equipo: 6,
      id_tipo: 3,
      nombre: "Impresora HP LaserJet",
      marca_equipo: "HP",
      modelo_equipo: "LaserJet M404",
      descripcion_equipo: "Impresora de oficina",
      num_serie: "HP-LJ404-003",
      cliente: "Carlos Ramírez",
      fecha_registro: "2025-10-20",
      estado: "Lista para entrega",
      visible: true,
    },
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Gestión de Equipos</h3>
        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          Nuevo Equipo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos.map((e) => (
          <div
            key={e.id_equipo}
            className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between transition hover:shadow-lg ${
              !e.visible && "opacity-60"
            }`}
          >
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-semibold text-gray-900">{e.nombre}</h4>
              <p className="text-gray-600">Tipo: {tiposEquipos[e.id_tipo]}</p>
              <p className="text-gray-600">Marca: {e.marca_equipo}</p>
              <p className="text-gray-600">Modelo: {e.modelo_equipo}</p>
              <p className="text-gray-600">N. de serie: {e.num_serie}</p>
              <p className="text-gray-600">Cliente: {e.cliente}</p>
              <p className="text-gray-600">Fecha registro: {e.fecha_registro}</p>
              <p className="text-gray-800 font-semibold">Estado: {e.estado}</p>
              <p className="text-gray-600">Descripción: {e.descripcion_equipo}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition">
                <Edit size={16} /> Editar
              </button>
              <button className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition">
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
