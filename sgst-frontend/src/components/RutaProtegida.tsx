import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Loading } from "./Loading";
import { useAuth } from "../contexts/AuthContext";

export default function RutaProtegida() {
    const navigate = useNavigate();
    const { usuario, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!usuario) {
                navigate("/", { replace: true });
                return;
            }
        }
    }, [usuario, loading, navigate]);

    if (loading) return <Loading />;
    if (!usuario) return null;

    return <Outlet />;
}