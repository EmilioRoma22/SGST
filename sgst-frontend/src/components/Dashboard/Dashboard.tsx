import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarTaller from "./Sidebar";
import Clientes from "./Clientes";
import Ordenes from "./ordenes/Ordenes";
import Finanzas from "./Finanzas";
import Configuracion from "./Configuracion";
import Seguimiento from "./Seguimiento";
import Reportes from "./Reportes";
import Calendario from "./Calendario";
import Equipos from "./Equipos";
import { useAuth } from "../../contexts/AuthContext";

export const Dashboard = () => {
    const navigate = useNavigate()
    const [, setTaller] = useState<number>(0);
    const [active, setActive] = useState("NADA");
    const { usuario, cerrarSesionUsuario } = useAuth()

    const renderContent = () => {
        switch (active) {
            case "Clientes":
                return <Clientes />;
            case "Órdenes de servicio":
                return <Ordenes />;
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

        if (usuario?.id_empresa === 0) {
            cerrarSesionUsuario()
            navigate("/")
        }

        navigate("/dashboard_talleres")
    };

    useEffect(() => {
        const tallerGuardado = localStorage.getItem("tallerActivo");

        if (!tallerGuardado) {
            navigate("/dashboard_talleres");
            return;
        }

        const taller = JSON.parse(tallerGuardado);
        setTaller(taller);
    }, [])

    return (
        <div className="flex h-screen">
            <SidebarTaller onSelect={setActive} active={active} onLogout={handleLogout} />
            <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                {renderContent()}
            </main>
        </div>
    );
}