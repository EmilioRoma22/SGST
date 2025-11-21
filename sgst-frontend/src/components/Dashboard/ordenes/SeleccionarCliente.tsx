import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Search } from "lucide-react";
import type { Cliente } from "../../../services/interfaces";
import { obtenerClientesTaller } from "../../../services/api";
import { useTaller } from "../../../contexts/TallerContext";

type Props = {
    setNombreClienteSeleccionado: React.Dispatch<React.SetStateAction<string | undefined>>
    setIdCliente: React.Dispatch<React.SetStateAction<number>>
    cerrarModal: () => void
};

export const SeleccionarCliente = ({ setNombreClienteSeleccionado, cerrarModal, setIdCliente }: Props) => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const { taller } = useTaller();

    useEffect(() => {
        const obtClientes = async () => {
            try {
                if (taller?.id_taller) {
                    const clientes = await obtenerClientesTaller(taller.id_taller);
                    setClientes(clientes);
                }
            } catch (error) {
                setError("Hubo un error al obtener los clientes");
            } finally {
                setLoading(false);
            }
        };

        obtClientes();
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

    const clientesFiltrados = clientes.filter((c) => {
        const nombreCompleto = `${c.nombre_cliente} ${c.apellidos_cliente}`.toLowerCase();
        return nombreCompleto.includes(busqueda.toLowerCase());
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
                    <h2 className="text-xl font-semibold text-gray-900">Seleccionar cliente</h2>
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
                        placeholder="Buscar cliente..."
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

                    {!loading && clientesFiltrados.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No se encontraron clientes</p>
                    )}

                    {!loading &&
                        clientesFiltrados.map((cliente) => (
                            <button
                                key={cliente.id_cliente}
                                onClick={() => {
                                    setNombreClienteSeleccionado(cliente.nombre_cliente + ' ' + cliente.apellidos_cliente)
                                    setIdCliente(cliente.id_cliente)
                                    cerrarModal()
                                }}
                                className="w-full text-left p-3 mb-2 bg-gray-100 hover:bg-gray-900/10 rounded-xl border border-gray-900/10 transition shadow-sm"
                            >
                                <p className="font-medium text-gray-900">{cliente.nombre_cliente} {cliente.apellidos_cliente}</p>
                                {cliente.correo_cliente && (
                                    <p className="text-sm text-gray-600">{cliente.correo_cliente}</p>
                                )}
                                {cliente.telefono_cliente && (
                                    <p className="text-sm text-gray-600">{cliente.telefono_cliente}</p>
                                )}
                            </button>
                        ))}
                </div>
            </motion.div>
        </motion.div>
    );
};