import React from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

interface LoadingProps {
    mensaje?: string;
}

export const Loading: React.FC<LoadingProps> = ({ mensaje = "Cargando..." }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white/0 p-4 rounded-xl flex items-center gap-6">
                    <LoaderCircle className="h-8 w-8 animate-spin text-white"/>
                    <span className="text-white font-semibold text-xl">{mensaje}</span>
                </div>
            </div>
        </motion.div>
    );
}