import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { calcularDiasRestantesGarantia } from "../../../utils/calcularDiasGarantia";
import { obtenerOrdenesTaller } from "../../../services/api";
import { type OrdenServicio } from "../../../services/interfaces";
import { useTaller } from "../../../contexts/TallerContext";
import { mostrarToast } from "../../../utils/MostrarToast";

export default function Garantias() {
  const { taller } = useTaller();
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarOrdenes = async () => {
      if (!taller) return;

      try {
        setLoading(true);
        const datos = await obtenerOrdenesTaller(taller.id_taller);
        setOrdenes(datos.filter(o => o.id_estado === 3));
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
        mostrarToast("Error al cargar las órdenes", "error");
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [taller]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Garantías de las ordenes</h3>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && ordenes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No hay órdenes registradas para este taller.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {ordenes.map((o) => {
          const diasGarantia = calcularDiasRestantesGarantia(o.fecha_fin_garantia ?? null);
          const esGarantiaActiva = diasGarantia !== null && diasGarantia > 0;

          return (
            <div
              key={o.id_orden}
              className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 gap-4 transition hover:shadow-md"
            >
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    #{o.num_orden}
                  </span>
                  {o.es_por_garantia ? (
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Garantía
                    </span>
                  ) : (
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> No es por garantía
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  {o.nombre_cliente} {o.apellidos_cliente}
                </h4>
                <p className="text-gray-600 font-medium">{o.nombre_tipo} {o.marca_equipo} {o.modelo_equipo}</p>
                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                  <p><span className="font-medium">Falla:</span> {o.falla}</p>
                  {o.diagnostico_inicial && <p><span className="font-medium">Diagnóstico:</span> {o.diagnostico_inicial}</p>}
                  {o.solucion_aplicada && <p><span className="font-medium">Solución:</span> {o.solucion_aplicada}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-right md:text-left min-w-[250px] w-[250px]">
                <div className="flex items-center justify-end md:justify-start gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${o.descripcion_prioridad === 'Alta' || o.descripcion_prioridad === 'Urgente' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {o.descripcion_prioridad}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${o.descripcion_estado === 'Finalizado' ? 'bg-green-50 text-green-700' :
                    o.descripcion_estado === 'En Reparación' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {o.descripcion_estado}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Técnico:</span> {(o.nombre_tecnico + " " + o.apellidos_tecnico) || "Sin asignar"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fecha final:</span> {new Date(o.fecha_fin_garantia).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) || "Pendiente"}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">${o.costo_total}</p>

                {diasGarantia !== null && (
                  <div className={`mt-2 text-sm font-medium flex items-center justify-end md:justify-start gap-1.5 ${esGarantiaActiva ? "text-emerald-600" : "text-red-500"
                    }`}>
                    {esGarantiaActiva ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {diasGarantia} días de garantía
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        Garantía vencida
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
