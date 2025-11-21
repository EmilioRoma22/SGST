import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarTaller from "./Sidebar";
import Clientes from "./clientes/Clientes";
import Ordenes from "./ordenes/Ordenes";
import Finanzas from "./Finanzas";
import Configuracion from "./Configuracion";
import Seguimiento from "./Seguimiento";
import Reportes from "./Reportes";
import Calendario from "./Calendario";
import Equipos from "./equipos/Equipos";
import { useAuth } from "../../contexts/AuthContext";
import { useTaller } from "../../contexts/TallerContext";
import { AnimatePresence } from "motion/react";
import { ModalCerrarSesionTaller } from "./ModalCerrarSesionTaller";
import { OrdenesLayout } from "./ordenes/OrdenesLayout";

export const Dashboard = () => {
    const navigate = useNavigate()
    const { loading_taller, taller, rol_taller, setTaller, setRolTaller } = useTaller()
    const [ModalCerrarSesion, setModalCerrarSesion] = useState(false)
    const [active, setActive] = useState("NADA");
    const { usuario, cerrarSesionUsuario } = useAuth()

    const renderContent = () => {
        switch (active) {
            case "Clientes":
                return <Clientes />;
            case "Órdenes de servicio":
                return <OrdenesLayout />;
            case "Finanzas":
                return <Finanzas />;
            case "Configuración":
                return <Configuracion />;
            case "Seguimiento y garantías":
                return <Seguimiento />;
            case "Reportes":
                return <Reportes />;
            case "Calendario":
                return <Calendario />;
            case "Gestión de equipos":
                return <Equipos />;
            default:
                return <p>Selecciona un módulo</p>;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("tallerActivo");
        localStorage.removeItem("rolActivo")
        setTaller(null)
        setRolTaller(null)

        if (usuario?.id_empresa === 0) {
            cerrarSesionUsuario()
            navigate('/')
        }

        navigate("/dashboard_talleres")
    };

    useEffect(() => {
        if (!loading_taller) if (!taller && !rol_taller) {
        }
    }, [loading_taller, taller, rol_taller])

    return (
        <div className="flex h-screen">
            <SidebarTaller onSelect={setActive} active={active} onLogout={()=>setModalCerrarSesion(true)} />
            <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                {renderContent()}
            </main>

            <AnimatePresence>
                {ModalCerrarSesion && (
                    <ModalCerrarSesionTaller
                        cerrarModal={() => {setModalCerrarSesion(false)}}
                        cerrarSesion={handleLogout}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}