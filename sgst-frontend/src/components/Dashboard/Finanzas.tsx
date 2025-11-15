import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";

export default function FinanzasTaller() {
  const resumen = {
    ingresos: 18500,
    gastos: 9700,
    balance: 8800,
  };

  const datosMensuales = [
    { mes: "Ene", ingresos: 12000, gastos: 8000 },
    { mes: "Feb", ingresos: 15000, gastos: 9500 },
    { mes: "Mar", ingresos: 18000, gastos: 11000 },
    { mes: "Abr", ingresos: 20000, gastos: 12000 },
    { mes: "May", ingresos: 17000, gastos: 9000 },
    { mes: "Jun", ingresos: 22000, gastos: 15000 },
  ];

  const transacciones = [
    { id: 1, concepto: "Reparación Laptop Dell", tipo: "Ingreso", monto: 1200, fecha: "28 Oct 2025" },
    { id: 2, concepto: "Compra de refacciones", tipo: "Gasto", monto: 350, fecha: "27 Oct 2025" },
    { id: 3, concepto: "Servicio impresora HP", tipo: "Ingreso", monto: 900, fecha: "25 Oct 2025" },
    { id: 4, concepto: "Pago de energía eléctrica", tipo: "Gasto", monto: 500, fecha: "23 Oct 2025" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-4"
        >
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Ingresos</h3>
            <p className="text-2xl font-bold text-gray-800">
              ${resumen.ingresos.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-4"
        >
          <div className="bg-red-100 p-3 rounded-xl text-red-500">
            <ArrowDownCircle size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Gastos</h3>
            <p className="text-2xl font-bold text-gray-800">
              ${resumen.gastos.toLocaleString()}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-4"
        >
          <div className="bg-gray-900 p-3 rounded-xl text-white">
            <DollarSign size={28} />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Balance</h3>
            <p className="text-2xl font-bold text-gray-800">
              ${resumen.balance.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Flujo de ingresos y gastos
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gastos" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Transacciones recientes
        </h3>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2">Concepto</th>
              <th className="py-2">Tipo</th>
              <th className="py-2">Monto</th>
              <th className="py-2 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 text-gray-800">{t.concepto}</td>
                <td
                  className={`py-3 font-medium ${
                    t.tipo === "Ingreso" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {t.tipo}
                </td>
                <td className="py-3 text-gray-700">
                  ${t.monto.toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-500">{t.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
