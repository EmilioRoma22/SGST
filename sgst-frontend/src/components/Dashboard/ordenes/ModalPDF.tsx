import React, { useEffect, useState } from 'react';
import { X, Printer, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ModalPDFProps {
    onClose: () => void;
    pdfBlob: Blob | null;
    onSendCorreo: (correo: string) => Promise<void>;
    defaultCorreo?: string;
}

export default function ModalPDF({ onClose, pdfBlob, onSendCorreo, defaultCorreo = "" }: ModalPDFProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showCorreoInput, setShowCorreoInput] = useState(false);
    const [correo, setCorreo] = useState(defaultCorreo);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [pdfBlob]);

    const handlePrint = () => {
        if (pdfUrl) {
            const printWindow = window.open(pdfUrl);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        }
    };

    const handleSendCorreo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!correo) return;

        try {
            setEnviando(true);
            await onSendCorreo(correo);
            setShowCorreoInput(false);
        } catch (error) {
            console.error("Error enviando correo:", error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-background fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    onClose();
                }
            }}
        >

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Vista Previa de Orden</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Printer size={18} />
                            <span>Imprimir</span>
                        </button>

                        <div className="relative">
                            {/* <button
                                onClick={() => setShowcorreoInput(!showcorreoInput)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showcorreoInput
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Mail size={18} />
                                <span>Enviar por Correo</span>
                            </button> */}

                            {showCorreoInput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-10"
                                >
                                    <form onSubmit={handleSendCorreo} className="flex flex-col gap-3">
                                        <label className="text-sm font-medium text-gray-700">Destinatario</label>
                                        <input
                                            type="correo"
                                            value={correo}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={enviando}
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            {enviando ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    Enviar
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full rounded-lg shadow-sm border border-gray-200"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Generando vista previa...
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
