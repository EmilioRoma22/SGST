import { useEffect, useState } from "react";
import { Search, Plus, Laptop, Smartphone, Printer, Tablet, HardDrive, Monitor, Cpu, Calendar, Hash, FileText, Edit, PcCase } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Equipos, TipoEquipo } from "../../../services/interfaces";
import { mostrarToast } from "../../../utils/MostrarToast";
import { obtenerEquiposTaller, obtenerTipoEquipos } from "../../../services/api";
import { useTaller } from "../../../contexts/TallerContext";
import { ModalCrearEquipo } from "./ModalCrearEquipo";
import { ModalEditarEquipo } from "./ModalEditarEquipo";
import { Toaster } from "react-hot-toast";

export default function EquiposGridActualizado() {
  const { taller } = useTaller();
  const [equipos, setEquipos] = useState<Equipos[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalNuevoEquipoVisible, setModalNuevoEquipoVisible] = useState(false)
  const [modalEditarEquipoVisible, setModalEditarEquipoVisible] = useState(false)
  const [tiposEquipo, setTiposEquipo] = useState<TipoEquipo[]>([]);
  const [formEquipo, setFormEquipo] = useState({
    id_taller: taller?.id_taller ?? 0,
    id_tipo: 0,
    num_serie: "",
    marca_equipo: "",
    modelo_equipo: "",
    descripcion_equipo: ""
  })
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipos | null>(null)
  const [infoEquipo, setInfoEquipo] = useState({
    tipo_equipo: "",
    marca_equipo: "",
    modelo_equipo: ""
  })

  const obtTiposEquipo = async () => {
    try {
      const respuesta = await obtenerTipoEquipos(taller?.id_taller ?? 0);

      setTiposEquipo(respuesta);
    } catch (error) {
      console.error("Error al obtener tipos de equipos:", error);
    }
  }

  const obtenerEquipos = async () => {
    try {
      setLoading(true)
      const respuesta = await obtenerEquiposTaller(taller?.id_taller ?? 0);
      setEquipos(respuesta);
    } catch (error: unknown) {
      mostrarToast("Error al obtener los equipos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      obtenerEquipos(),
      obtTiposEquipo()
    ])
  }, []);

  const getIconoEquipo = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("laptop") || tipoLower.includes("portátil")) return <Laptop className="w-6 h-6" />;
    if (tipoLower.includes("celular") || tipoLower.includes("móvil") || tipoLower.includes("iphone")) return <Smartphone className="w-6 h-6" />;
    if (tipoLower.includes("impresora")) return <Printer className="w-6 h-6" />;
    if (tipoLower.includes("tablet")) return <Tablet className="w-6 h-6" />;
    if (tipoLower.includes("disco") || tipoLower.includes("almacenamiento")) return <HardDrive className="w-6 h-6" />;
    if (tipoLower.includes("monitor") || tipoLower.includes("pantalla")) return <Monitor className="w-6 h-6" />;
    if (tipoLower.includes("pc")) return <PcCase className="w-6 h-6" />;
    return <Cpu className="w-6 h-6" />;
  };

  const equiposFiltrados = equipos.filter(equipo =>
    equipo.marca_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
    equipo.modelo_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
    equipo.num_serie.toLowerCase().includes(busqueda.toLowerCase()) ||
    equipo.nombre_tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipos Registrados</h1>
          <p className="text-gray-500 mt-1">Gestiona el inventario de equipos del taller</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-full md:w-64"
            />
          </div>

          <button
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-gray-900/20"
            onClick={() => setModalNuevoEquipoVisible(true)}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Equipo</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      ) : equiposFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equiposFiltrados.map((equipo) => (
            <motion.div
              key={equipo.id_equipo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-gray-100" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-700 group-hover:bg-gray-600 group-hover:text-white transition-colors duration-300">
                    {getIconoEquipo(equipo.nombre_tipo)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEquipoSeleccionado(equipo)
                        setInfoEquipo({
                          tipo_equipo: equipo.nombre_tipo,
                          marca_equipo: equipo.marca_equipo,
                          modelo_equipo: equipo.modelo_equipo
                        })
                        setModalEditarEquipoVisible(true)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                    {equipo.nombre_tipo}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                    {equipo.marca_equipo}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {equipo.modelo_equipo}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono text-gray-700">{equipo.num_serie}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(equipo.fecha_registro).toLocaleDateString()}</span>
                  </div>
                  {equipo.descripcion_equipo && (
                    <div className="flex items-start gap-2 text-sm text-gray-500 mt-2">
                      <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="line-clamp-2 text-xs leading-relaxed">
                        {equipo.descripcion_equipo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No se encontraron equipos</h3>
          <p className="text-gray-500 mt-1">Intenta con otra búsqueda o registra un nuevo equipo.</p>
        </div>
      )}

      <AnimatePresence>
        {modalNuevoEquipoVisible && (
          <ModalCrearEquipo
            cerrarModal={() => setModalNuevoEquipoVisible(false)}
            formEquipo={formEquipo}
            setFormEquipo={setFormEquipo}
            hayNuevoTipo={() => obtTiposEquipo()}
            tiposEquipo={tiposEquipo}
            equipoCreado={() => obtenerEquipos()}
            mostrarToast={mostrarToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEditarEquipoVisible && (
          <ModalEditarEquipo
            cerrarModal={() => setModalEditarEquipoVisible(false)}
            hayNuevoTipo={() => obtTiposEquipo()}
            tiposEquipo={tiposEquipo}
            equipoActualizado={() => obtenerEquipos()}
            mostrarToast={mostrarToast}
            equipo={equipoSeleccionado}
            infoEquipo={infoEquipo}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
