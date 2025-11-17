import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Loading } from "./Loading";
import { useAuth } from "../contexts/AuthContext";

export default function RutaProtegida() {
    const navigate = useNavigate();
    const { usuario, loadingUsuario } = useAuth();

    useEffect(() => {
        if (!loadingUsuario) {
            if (!usuario) {
                navigate("/", { replace: true });
                return;
            }
        }
    }, [usuario, loadingUsuario, navigate]);

    if (loadingUsuario) return <Loading />;
    if (!usuario) return null;

    return <Outlet />;
}