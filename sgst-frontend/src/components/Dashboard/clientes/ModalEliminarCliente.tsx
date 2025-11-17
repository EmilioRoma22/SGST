import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Loading } from "../../Loading";
import { eliminarClienteTaller } from "../../../services/api";

type clienteSeleccionado = {
    id_cliente: number,
    nombre_cliente: string,
    apellidos_cliente: string,
}

type Props = {
    cerrarModal: () => void
    mostrarToast: (mensaje: string, tipo: "success" | "error") => void;
    clienteSeleccionado: clienteSeleccionado
    cliente_eliminado: () => void
};

export const ModalEliminarCliente = ({ cerrarModal, mostrarToast, clienteSeleccionado, cliente_eliminado }: Props) => {
    const [loading, setLoading] = useState(false);

    async function confirmarEliminarUsuario(_event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        if (!clienteSeleccionado) {
            cerrarModal();
            return
        };
        setLoading(true);

        try {
            const respuesta = await eliminarClienteTaller(clienteSeleccionado.id_cliente);

            if (respuesta.ok) {
                mostrarToast(respuesta.message || "Se ha eliminado el cliente correctamente", "success");
                cliente_eliminado()
                cerrarModal();
            } else {
                mostrarToast(respuesta.message || "No se ha podido eliminar el cliente", "error");
                cerrarModal();
            }
        } catch (error) {
            mostrarToast("Error del servidor", "error");
        } finally {
            setLoading(false);
        }
    }

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

    return (
        <motion.div
            className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal();
                }
            }}
        >
            <motion.div
                className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <Trash2 className="text-red-600 w-6 h-6" />
                    </div>
                </div>

                <p className="text-center text-gray-800 text-base mb-5">
                    ¿Deseas eliminar al usuario <strong>{clienteSeleccionado?.nombre_cliente} {clienteSeleccionado?.apellidos_cliente}</strong>?
                    <br />
                    <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={confirmarEliminarUsuario}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                        autoFocus
                    >
                        Confirmar
                    </button>
                    <button
                        type="button"
                        onClick={() => cerrarModal()}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>

                {loading && (<Loading mensaje="Eliminando usuario..." />)}
            </motion.div>
        </motion.div>
    );
}