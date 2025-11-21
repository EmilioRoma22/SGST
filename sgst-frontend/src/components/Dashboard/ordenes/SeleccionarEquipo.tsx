import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Search } from "lucide-react";
import type { Equipos } from "../../../services/interfaces";
import { obtenerEquiposTaller } from "../../../services/api";
import { useTaller } from "../../../contexts/TallerContext";

type Props = {
    setNombreEquipoSeleccionado: React.Dispatch<React.SetStateAction<string | undefined>>
    setIdEquipo: React.Dispatch<React.SetStateAction<number>>
    cerrarModal: () => void
};

export const SeleccionarEquipo = ({ setNombreEquipoSeleccionado, cerrarModal, setIdEquipo }: Props) => {
    const [equipos, setEquipos] = useState<Equipos[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const { taller } = useTaller();

    useEffect(() => {
        const obtEquipos = async () => {
            try {
                if (taller?.id_taller) {
                    const equipos = await obtenerEquiposTaller(taller.id_taller);
                    setEquipos(equipos);
                }
            } catch (error) {
                setError("Hubo un error al obtener los equipos");
            } finally {
                setLoading(false);
            }
        };

        obtEquipos();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cerrarModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const equiposFiltrados = equipos.filter((e) => {
        const nombreCompleto = `${e.nombre_tipo}`.toLowerCase();
        const marcaCompleto = `${e.marca_equipo}`.toLowerCase();
        const modeloCompleto = `${e.modelo_equipo}`.toLowerCase();
        const numSerieCompleto = `${e.num_serie}`.toLowerCase();
        return nombreCompleto.includes(busqueda.toLowerCase()) || marcaCompleto.includes(busqueda.toLowerCase()) || modeloCompleto.includes(busqueda.toLowerCase()) || numSerieCompleto.includes(busqueda.toLowerCase());
    });

    return (
        <motion.div
            className="modal-background fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal()
                }
            }}
        >
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ type: "tween", stiffness: 120, duration: 0.2 }}
                className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-5 border border-gray-900/10"
            >
                <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-900/20">
                    <h2 className="text-xl font-semibold text-gray-900">Seleccionar equipo</h2>
                    <button
                        onClick={() => cerrarModal()}
                        className="p-2 hover:bg-gray-900/10 rounded-full transition"
                    >
                        <X size={20} className="text-gray-900" />
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl mb-4 border border-gray-900/20">
                    <Search size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar equipo..."
                        className="bg-transparent outline-none flex-1 text-gray-900"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="max-h-80 overflow-y-auto pr-1">
                    {loading && (
                        <p className="text-gray-500 text-center py-4">Cargando clientes...</p>
                    )}

                    {error && <p className="text-red-500 text-center py-4">{error}</p>}

                    {!loading && equiposFiltrados.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No se encontraron equipos</p>
                    )}

                    {!loading &&
                        equiposFiltrados.map((equipo) => (
                            <button
                                key={equipo.id_equipo}
                                onClick={() => {
                                    setNombreEquipoSeleccionado(equipo.nombre_tipo + ' ' + equipo.marca_equipo + ' ' + equipo.modelo_equipo)
                                    setIdEquipo(equipo.id_equipo)
                                    cerrarModal()
                                }}
                                className="w-full text-left p-3 mb-2 bg-gray-100 hover:bg-gray-900/10 rounded-xl border border-gray-900/10 transition shadow-sm"
                            >
                                <p className="font-medium text-gray-900">{equipo.marca_equipo + ' ' + equipo.modelo_equipo}</p>
                                {equipo.num_serie && (
                                    <p className="text-sm text-gray-600">{equipo.num_serie}</p>
                                )}
                                {equipo.nombre_tipo && (
                                    <p className="text-sm text-gray-600">{equipo.nombre_tipo}</p>
                                )}
                            </button>
                        ))}
                </div>
            </motion.div>
        </motion.div>
    );
};