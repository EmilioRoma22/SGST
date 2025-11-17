import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { calcularDiasRestantesGarantia } from "../../../utils/calcularDiasGarantia";
import { obtenerOrdenes } from "../../../services/api";
import { type OrdenServicioAPI } from "../../../services/interfaces";

interface Orden {
  id: number;
  num_orden: number;
  cliente: string;
  equipo: string;
  falla: string;
  diagnostico: string;
  solucion: string;
  prioridad: string;
  tecnico: string;
  fecha_estimada: string;
  fecha_entrega: string;
  estado: string;
  costo: string;
  visible: boolean;

  // Garantía
  meses_garantia?: number;
  fecha_fin_garantia?: string | null;
  es_por_garantia?: boolean;
}

export default function OrdenesServicio() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const tallerActivoRaw = localStorage.getItem("tallerActivo");

        if (!tallerActivoRaw) {
          console.warn("No hay taller activo.");
          setCargando(false);
          return;
        }

        const tallerActivo = JSON.parse(tallerActivoRaw);
        const id_taller = tallerActivo.id_taller || tallerActivo.id;

        if (!id_taller) {
          console.warn("No se encontró id_taller en el taller activo");
          setCargando(false);
          return;
        }

        const datos: OrdenServicioAPI[] = await obtenerOrdenes(id_taller);
        
        const ordenesAdaptadas: Orden[] = datos.map((o, index) => ({
          id: o.id_orden ?? index + 1,
          num_orden: o.num_orden,
          cliente: o.cliente,
          equipo: o.equipo,
          falla: o.falla,
          diagnostico: o.diagnostico,
          solucion: o.solucion,
          prioridad: o.prioridad,
          tecnico: o.tecnico || "Sin técnico asignado",
          fecha_estimada: o.fecha_estimada || "",
          fecha_entrega: o.fecha_entrega || "",
          estado: o.estado,
          costo: o.costo,
          visible: true,
          meses_garantia: o.meses_garantia,
          fecha_fin_garantia: o.fecha_fin_garantia,
          es_por_garantia: o.es_por_garantia,
        }));

        setOrdenes(ordenesAdaptadas);
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarOrdenes();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Órdenes de Servicio</h3>
        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          Nueva Orden
        </button>
      </div>

      {cargando && <p className="text-gray-500">Cargando órdenes...</p>}

      {!cargando && ordenes.length === 0 && (
        <p className="text-gray-500">No hay órdenes registradas para este taller.</p>
      )}

      <div className="flex flex-col gap-4">
        {ordenes.map((o) => {
          const diasGarantia = calcularDiasRestantesGarantia(o.fecha_fin_garantia ?? null);

          return (
            <div
              key={o.id}
              className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 gap-4 transition hover:shadow-lg ${
                !o.visible && "opacity-60"
              }`}
            >
              {/* Columna izquierda: info principal */}
              <div className="flex-1 flex flex-col gap-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  Orden #{o.num_orden} - {o.cliente}
                </h4>
                <p className="text-gray-600">Equipo: {o.equipo}</p>
                <p className="text-gray-600">Falla: {o.falla}</p>
                <p className="text-gray-600">Diagnóstico: {o.diagnostico}</p>
                <p className="text-gray-600">Solución: {o.solucion}</p>
              </div>

              {/* Columna derecha: estado, costo y garantía */}
              <div className="flex flex-col gap-1 text-right md:text-left">
                <p className="text-gray-800 font-semibold">Prioridad: {o.prioridad}</p>
                <p className="text-gray-600">Técnico: {o.tecnico}</p>
                <p className="text-gray-600">Fecha estimada: {o.fecha_estimada}</p>
                <p className="text-gray-600">Estado: {o.estado}</p>
                <p className="text-gray-800 font-semibold">Costo: {o.costo}</p>

                {/* INFORMACIÓN DE GARANTÍA */}
                {diasGarantia !== null && (
                  <>
                    {diasGarantia > 0 ? (
                      <p className="text-sm font-semibold text-emerald-600">
                        Garantía restante: {diasGarantia} día(s)
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-red-500">
                        Garantía vencida
                      </p>
                    )}
                  </>
                )}

                {o.es_por_garantia && (
                  <p className="text-xs font-medium text-blue-500">
                    Orden atendida por garantía
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-2 mt-4 md:mt-0">
                <button className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition">
                  <Edit size={16} /> Editar
                </button>
                <button className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition">
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
