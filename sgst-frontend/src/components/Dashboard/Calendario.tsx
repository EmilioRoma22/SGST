import { useState, useEffect } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTaller } from "../../contexts/TallerContext";
import { obtenerOrdenesTaller } from "../../services/api";
import type { OrdenServicio } from "../../services/interfaces";
import { mostrarToast } from "../../utils/MostrarToast";
import { useAuth } from "../../contexts/AuthContext";
import VerOrden from "./ordenes/VerOrden";

export default function CalendarioTaller() {
  const { taller, rol_taller } = useTaller();
  const { usuario } = useAuth();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOrdenVisible, setModalOrdenVisible] = useState(false);
  const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    cargarOrdenes();
  }, [taller]);

  const cargarOrdenes = async () => {
    if (!taller) return;
    try {
      setLoading(true);
      const data = await obtenerOrdenesTaller(taller.id_taller);
      if (rol_taller === "TECNICO") {
        const ordenesTecnico = data.filter(orden => orden.id_tecnico === usuario?.id_usuario && orden.id_estado !== 3)
        setOrdenes(ordenesTecnico)
      } else {
        setOrdenes(data.filter(orden => orden.id_estado !== 3))
      }
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
      mostrarToast("Error al cargar las órdenes del calendario", "error");
    } finally {
      setLoading(false);
    }
  };

  const siguienteMes = () => setFechaActual(addMonths(fechaActual, 1));
  const mesAnterior = () => setFechaActual(subMonths(fechaActual, 1));

  const parsearFechaLocal = (fechaString: string | null | undefined) => {
    if (!fechaString) return null;
    if (fechaString.includes('T')) return parseISO(fechaString);

    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const ordenesDelDia = ordenes.filter(orden => {
    const fechaOrden = parsearFechaLocal(orden.fecha_estimada_de_fin);
    if (!fechaOrden) return false;

    return isSameDay(fechaOrden, fechaSeleccionada);
  });

  const tieneOrdenes = (dia: Date) => {
    return ordenes.some(orden => {
      const fechaOrden = parsearFechaLocal(orden.fecha_estimada_de_fin);
      if (!fechaOrden) return false;
      return isSameDay(fechaOrden, dia);
    });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-8 px-2">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          <CalendarIcon className="w-6 h-6 text-gray-800" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {format(fechaActual, "MMMM yyyy", { locale: es })}
          </h2>
          <p className="text-gray-500 text-sm">Gestión de entregas y servicios</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={mesAnterior}
          className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-all hover:scale-105 active:scale-95 border border-gray-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={siguienteMes}
          className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-all hover:scale-105 active:scale-95 border border-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDias = () => {
    const dias = [];
    const fechaInicio = startOfWeek(fechaActual, { locale: es });

    for (let i = 0; i < 7; i++) {
      dias.push(
        <div key={i} className="text-center font-medium text-gray-400 uppercase text-xs tracking-wider py-2">
          {format(addDays(fechaInicio, i), "EEE", { locale: es })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{dias}</div>;
  };

  const renderCeldas = () => {
    const mesInicio = startOfMonth(fechaActual);
    const mesFin = endOfMonth(mesInicio);
    const fechaInicio = startOfWeek(mesInicio, { locale: es });
    const fechaFin = endOfWeek(mesFin, { locale: es });

    const filas = [];
    let dias = [];
    let dia = fechaInicio;
    let fechaFormateada = "";

    while (dia <= fechaFin) {
      for (let i = 0; i < 7; i++) {
        fechaFormateada = format(dia, "d");
        const cloneDia = dia;
        const estaSeleccionado = isSameDay(dia, fechaSeleccionada);
        const esMesActual = isSameMonth(dia, mesInicio);
        const hayOrdenes = tieneOrdenes(dia);
        const esHoy = isSameDay(dia, new Date());

        dias.push(
          <div
            key={dia.toString()}
            onClick={() => setFechaSeleccionada(cloneDia)}
            className={`relative h-24 p-2 border border-gray-50 cursor-pointer transition-all duration-200 
              ${!esMesActual ? "bg-gray-50/30 text-gray-300" : "bg-white"} 
              ${estaSeleccionado ? "ring-2 ring-gray-500 ring-inset z-10 rounded-xl" : "hover:bg-gray-50"} 
              ${i === 0 ? "rounded-l-xl" : ""} 
              ${i === 6 ? "rounded-r-xl" : ""}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${estaSeleccionado ? "bg-gray-600 text-white" : esHoy ? "bg-gray-300 text-gray-700" : "text-gray-700"}`}
              >
                {fechaFormateada}
              </span>
              {hayOrdenes && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-gray-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                </span>
              )}
            </div>

            <div className="mt-2 space-y-1">
              {ordenes.filter(o => {
                const fecha = parsearFechaLocal(o.fecha_estimada_de_fin);
                return fecha && isSameDay(fecha, dia);
              }).slice(0, 2).map((orden, idx) => (
                <div key={idx} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-100">
                  {orden.nombre_tipo}
                </div>
              ))}
              {ordenes.filter(o => {
                const fecha = parsearFechaLocal(o.fecha_estimada_de_fin);
                return fecha && isSameDay(fecha, dia);
              }).length > 2 && (
                  <div className="text-[10px] text-gray-400 pl-1">
                    +{ordenes.filter(o => {
                      const fecha = parsearFechaLocal(o.fecha_estimada_de_fin);
                      return fecha && isSameDay(fecha, dia);
                    }).length - 2} más
                  </div>
                )}
            </div>
          </div>
        );
        dia = addDays(dia, 1);
      }
      filas.push(
        <div className="grid grid-cols-7" key={dia.toString()}>
          {dias}
        </div>
      );
      dias = [];
    }
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">{filas}</div>;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            {renderHeader()}
            {renderDias()}
            {renderCeldas()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Entregas Programadas
              </h3>
              <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {format(fechaSeleccionada, "d MMM", { locale: es })}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar h-full">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : ordenesDelDia.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {ordenesDelDia.map((orden) => (
                    <motion.div
                      key={orden.id_orden}
                      onClick={() => {
                        setIdOrdenSeleccionada(orden.id_orden)
                        setModalOrdenVisible(true)
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                          #{orden.num_orden}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                          ${orden.descripcion_estado === 'Finalizado' ? 'bg-green-100 text-green-700' :
                              orden.descripcion_estado === 'En Reparación' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-200 text-gray-700'}`}
                        >
                          {orden.descripcion_estado}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {orden.nombre_tipo}
                      </h4>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{orden.nombre_cliente} {orden.apellidos_cliente}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Wrench className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{orden.falla}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Prioridad</span>
                        <span className={`text-xs font-medium flex items-center gap-1
                        ${orden.descripcion_prioridad === 'Alta' || orden.descripcion_prioridad === 'Urgente' ? 'text-red-600' : 'text-gray-600'}`}>
                          {orden.descripcion_prioridad === 'Alta' || orden.descripcion_prioridad === 'Urgente' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {orden.descripcion_prioridad}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3">
                    <CalendarIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Sin entregas para este día</p>
                  <p className="text-xs text-gray-400 mt-1">Selecciona otra fecha en el calendario</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOrdenVisible && (
          <VerOrden
            idOrden={idOrdenSeleccionada ?? 0}
            cerrarModal={() => {
              setIdOrdenSeleccionada(null)
              setModalOrdenVisible(false)
            }}
            alActualizar={() => {
              setIdOrdenSeleccionada(null)
              setModalOrdenVisible(false)
              cargarOrdenes()
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
