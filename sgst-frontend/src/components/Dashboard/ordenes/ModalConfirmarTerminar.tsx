import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";
import { terminarServicioOrden } from "../../../services/api";

interface ModalConfirmarTerminarProps {
    cerrarModal: () => void,
    id_orden: number,
    costo: number,
    metodoPago: string,
    mostrarToast: (mensaje: string, tipo: "success" | "error") => void,
    alActualizar: () => void,
    setGuardando: (guardando: boolean) => void
}

export const ModalConfirmarTerminar = ({ cerrarModal, id_orden, costo, metodoPago, mostrarToast, alActualizar, setGuardando }: ModalConfirmarTerminarProps) => {
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
            transition={{ duration: 0.3 }}
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal()
                }
            }}
        >
            <motion.div
                className="relative bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    onClick={() => cerrarModal()}
                    className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center transition-colors ease-in-out duration-300 cursor-pointer"
                >
                    <X />
                    <span className="sr-only">Close modal</span>
                </button>

                <div className="flex flex-col items-center">
                    <div className="bg-gray-100 p-3 rounded-full mb-4">
                        <CheckCircle className="text-gray-900 w-6 h-6" />
                    </div>
                    <p className="text-center text-gray-800 text-base font-semibold mb-5">
                        ¿Deseas terminar la orden?
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={async () => {
                                try {
                                    const resultado = await terminarServicioOrden(id_orden, costo, metodoPago);

                                    if (resultado.ok) {
                                        mostrarToast("Servicio terminado correctamente", "success");
                                        alActualizar();
                                        cerrarModal();
                                    } else {
                                        mostrarToast(resultado.message, "error");
                                    }
                                    setGuardando(false);
                                } catch (error) {
                                    console.error(error);
                                }
                            }}
                            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 shadow-sm transition-colors ease-in-out duration-300 cursor-pointer"
                            autoFocus
                        >
                            Terminar
                        </button>
                        <button
                            onClick={() => cerrarModal()}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}