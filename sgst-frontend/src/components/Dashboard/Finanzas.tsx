import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { ArrowUpCircle, DollarSign, Calendar, Filter } from "lucide-react";
import { useTaller } from "../../contexts/TallerContext";
import { obtenerFinanzas } from "../../services/api";
import { mostrarToast } from "../../utils/MostrarToast";

export default function FinanzasTaller() {
  const { taller } = useTaller();
  const [loading, setLoading] = useState(true);
  const [finanzas, setFinanzas] = useState<any>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    cargarDatos();
  }, [taller]);

  const cargarDatos = async () => {
    if (!taller) return;
    setLoading(true);
    try {
      const data = await obtenerFinanzas(taller.id_taller, fechaInicio, fechaFin);
      setFinanzas(data);
    } catch (error) {
      console.error("Error cargando finanzas:", error);
      mostrarToast("Error al cargar la información financiera", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    cargarDatos();
  };

  const handleLimpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    if (!taller) return;
    setLoading(true);
    obtenerFinanzas(taller.id_taller)
      .then(data => setFinanzas(data))
      .catch(error => {
        console.error(error);
        mostrarToast("Error al cargar finanzas", "error");
      })
      .finally(() => setLoading(false));
  };

  if (loading && !finanzas) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-sm text-gray-500">Resumen de ingresos y transacciones</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-sm text-gray-700 focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-sm text-gray-700 focus:outline-none"
            />
          </div>
          <button
            onClick={handleFiltrar}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          {(fechaInicio || fechaFin) && (
            <button
              onClick={handleLimpiarFiltros}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-4"
        >
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Total Ingresos</h3>
            <p className="text-2xl font-bold text-gray-800">
              ${finanzas?.total_ingresos?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        {Object.entries(finanzas?.ingresos_por_metodo || {}).map(([metodo, monto]: [string, any], index) => (
          <motion.div
            key={metodo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.1) }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-4"
          >
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <DollarSign size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Ingresos ({metodo})</h3>
              <p className="text-2xl font-bold text-gray-800">
                ${monto.toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ingresos en el tiempo
        </h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finanzas?.chart_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="fecha"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
              />
              <Bar
                dataKey="ingresos"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Transacciones Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 bg-gray-50/50">
                <th className="py-3 px-4 font-medium">Fecha</th>
                <th className="py-3 px-4 font-medium">Orden</th>
                <th className="py-3 px-4 font-medium">Cliente</th>
                <th className="py-3 px-4 font-medium">Método</th>
                <th className="py-3 px-4 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {finanzas?.transacciones?.length > 0 ? (
                finanzas.transacciones.map((t: any) => (
                  <tr
                    key={t.id_pago}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(t.fecha_pago).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(t.fecha_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      #{t.num_orden}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {t.nombre_cliente} {t.apellidos_cliente}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${t.metodo === 'Efectivo' ? 'bg-green-100 text-green-800' :
                          t.metodo === 'Tarjeta' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'}`}>
                        {t.metodo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600">
                      +${t.monto.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron transacciones en este periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
