import { motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useEffect } from "react";

export const ModalCerrarSesionTaller = ({ cerrarModal, cerrarSesion }: { cerrarModal: () => void, cerrarSesion: () => void}) => {
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
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                        <LogOut className="text-red-600 w-6 h-6" />
                    </div>
                    <p className="text-center text-gray-800 text-base mb-5">
                        ¿Deseas cerrar sesión?
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={async () => {
                                try {
                                    cerrarSesion()
                                } catch (error) {
                                    console.error(error);
                                }
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 shadow-sm transition-colors ease-in-out duration-300 cursor-pointer"
                            autoFocus
                        >
                            Cerrar sesión
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