import { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";

interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  notas: string;
  activo: boolean;
}

export default function ClientesTabla() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nombre: "Juan",
      apellidos: "Pérez",
      correo: "juan.perez@email.com",
      telefono: "555-123-4567",
      direccion: "Av. Siempre Viva 123",
      notas: "Cliente VIP, prefiere contacto por email",
      activo: true,
    },
    {
      id: 2,
      nombre: "María",
      apellidos: "González",
      correo: "maria.gonzalez@email.com",
      telefono: "555-987-6543",
      direccion: "Calle Falsa 456",
      notas: "Requiere seguimiento mensual",
      activo: true,
    },
    {
      id: 3,
      nombre: "Carlos",
      apellidos: "Ramírez",
      correo: "carlos.ramirez@email.com",
      telefono: "555-555-5555",
      direccion: "Boulevard Central 789",
      notas: "Cliente nuevo, interesado en paquete anual",
      activo: false,
    },
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Clientes</h3>
        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          <Plus size={18} />
          Nuevo cliente
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((c) => (
              <tr key={c.id} className={!c.activo ? "opacity-60" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {c.nombre} {c.apellidos}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.correo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.telefono}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.direccion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 italic">{c.notas}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                  <button className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-200 transition">
                    <Edit size={14} /> Editar
                  </button>
                  <button className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200 transition">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
