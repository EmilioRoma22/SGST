import { createContext, useContext, useState, useEffect } from "react";
import apiAxios from "../services/apiAxios";
import type { Talleres } from "../services/interfaces";

interface AuthContextProps {
    taller: Talleres | null;
    rol_taller: string | null
    loading_taller: boolean;
    setTaller: React.Dispatch<React.SetStateAction<Talleres | null>>;
    setRolTaller: React.Dispatch<React.SetStateAction<string | null>>
    cerrarSesionTaller: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    taller: null,
    rol_taller: null,
    loading_taller: true,
    setTaller: () => { },
    setRolTaller: () => { },
    cerrarSesionTaller: async () => { },
})

export const TallerProvider = ({ children }: { children: React.ReactNode }) => {
    const [taller, setTaller] = useState<Talleres | null>(null);
    const [rol_taller, setRolTaller] = useState<string | null>(null)
    const [loading_taller, setLoadingTaller] = useState(true);

    useEffect(() => {
        const verificarTaller = async () => {
            try {
                const id_taller = localStorage.getItem("tallerActivo")
                const rol = localStorage.getItem("rolActivo")
                if (!id_taller && !rol) return;

                const response = await apiAxios.get(`/talleres/obtener_taller?id_taller=${id_taller}`);
                setTaller(response.data.taller);
                setRolTaller(rol)
            } catch (error) {
                setTaller(null);
            } finally {
                setLoadingTaller(false);
            }
        };

        verificarTaller();
    }, []);

    const cerrarSesionTaller = async () => {
        try {
            localStorage.removeItem("tallerActivo")
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
        } finally {
            setTaller(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            taller,
            rol_taller,
            loading_taller,
            setTaller,
            setRolTaller,
            cerrarSesionTaller
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useTaller = () => useContext(AuthContext);
