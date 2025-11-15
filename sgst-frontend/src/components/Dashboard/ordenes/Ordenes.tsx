import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import type { Orden } from "../../../services/interfaces";

export default function OrdenesCuadros() {
  const [ordenes, setOrdenes] = useState<Orden[]>();
  const [modalCrearOrdenVisible, setModalCrearOrdenVisible] = useState(false)

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Órdenes de Servicio</h3>
          <button
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            onClick={() => {
              // Logica para mostrar el modal de crear orden
              
            }}
          >
            Nueva Orden
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(ordenes ?? []).map((o) => (
            <div
              key={o.id}
              className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 gap-4 transition hover:shadow-lg ${!o.visible && "opacity-60"
                }`}
            >
              <div className="flex-1 flex flex-col gap-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  Orden #{o.num_orden} - {o.cliente}
                </h4>
                <p className="text-gray-600">Equipo: {o.equipo}</p>
                <p className="text-gray-600">Falla: {o.falla}</p>
                <p className="text-gray-600">Diagnóstico: {o.diagnostico}</p>
                <p className="text-gray-600">Solución: {o.solucion}</p>
              </div>

              <div className="flex flex-col gap-1 text-right md:text-left">
                <p className="text-gray-800 font-semibold">Prioridad: {o.prioridad}</p>
                <p className="text-gray-600">Técnico: {o.tecnico}</p>
                <p className="text-gray-600">Fecha estimada: {o.fecha_estimada}</p>
                <p className="text-gray-600">Estado: {o.estado}</p>
                <p className="text-gray-800 font-semibold">Costo: {o.costo}</p>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
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

      <AnimatePresence>
        {modalCrearOrdenVisible && (
          <>
          
          </>
        )}
      </AnimatePresence>

    </React.Fragment>
  );
}
