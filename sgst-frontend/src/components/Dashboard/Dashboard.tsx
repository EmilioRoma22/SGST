import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarTaller from "./Sidebar";
import Clientes from "./clientes/Clientes";
import Finanzas from "./Finanzas";
import Configuracion from "./Configuracion";
import Calendario from "./Calendario";
import Equipos from "./equipos/Equipos";
import { useAuth } from "../../contexts/AuthContext";
import { useTaller } from "../../contexts/TallerContext";
import { AnimatePresence } from "motion/react";
import { ModalCerrarSesionTaller } from "./ModalCerrarSesionTaller";
import { OrdenesLayout } from "./ordenes/OrdenesLayout";
import Garantias from "./ordenes/Garantias";
import VerOrden from "./ordenes/VerOrden";
import { obtenerOrdenesTaller } from "../../services/api";
import { mostrarToast } from "../../utils/MostrarToast";

export const Dashboard = () => {
    const navigate = useNavigate()
    const { loading_taller, taller, rol_taller, setTaller, setRolTaller } = useTaller()
    const [ModalCerrarSesion, setModalCerrarSesion] = useState(false)
    const [active, setActive] = useState("NADA");
    const { usuario, cerrarSesionUsuario } = useAuth()
    const [modalOrdenVisible, setModalOrdenVisible] = useState(false)
    const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<number | null>(null)
    const barcodeBuffer = useRef<string>("")
    const barcodeTimeout = useRef<number | null>(null)

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
            case "Garantías":
                return <Garantias />;
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

    useEffect(() => {
        const handleKeyPress = async (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if (event.key === 'Enter') {
                if (barcodeBuffer.current.length > 0) {
                    const numOrden = parseInt(barcodeBuffer.current);

                    if (!isNaN(numOrden) && taller?.id_taller) {
                        try {
                            const ordenes = await obtenerOrdenesTaller(taller.id_taller);
                            const orden = ordenes.find(o => o.id_orden === numOrden);

                            if (orden) {
                                setIdOrdenSeleccionada(orden.id_orden);
                                setModalOrdenVisible(true);
                            } else {
                                mostrarToast(`No se encontró la orden #${numOrden}`, "error");
                            }
                        } catch (error) {
                            console.error("Error al buscar orden:", error);
                            mostrarToast("Error al buscar la orden", "error");
                        }
                    }

                    barcodeBuffer.current = "";
                }
                return;
            }

            if (/^[0-9]$/.test(event.key)) {
                barcodeBuffer.current += event.key;

                if (barcodeTimeout.current) {
                    clearTimeout(barcodeTimeout.current);
                }
                barcodeTimeout.current = setTimeout(() => {
                    barcodeBuffer.current = "";
                }, 100);
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (barcodeTimeout.current) {
                clearTimeout(barcodeTimeout.current);
            }
        };
    }, [taller])

    return (
        <div className="flex h-screen">
            <SidebarTaller onSelect={setActive} active={active} onLogout={() => setModalCerrarSesion(true)} />
            <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                {renderContent()}
            </main>

            <AnimatePresence>
                {ModalCerrarSesion && (
                    <ModalCerrarSesionTaller
                        cerrarModal={() => { setModalCerrarSesion(false) }}
                        cerrarSesion={handleLogout}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalOrdenVisible && (
                    <VerOrden
                        idOrden={idOrdenSeleccionada ?? 0}
                        cerrarModal={() => {
                            setIdOrdenSeleccionada(null)
                            setModalOrdenVisible(false)
                        }}
                        alActualizar={() => {
                            setIdOrdenSeleccionada(null)
                            setModalOrdenVisible(false)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}