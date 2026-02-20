import { useEffect } from "react"
import { Navigate, Route, Routes, useNavigate } from "react-router-dom"
import { navigationRef } from "./navigationRef"
import LayoutLogin from "./components/layouts/LayoutLogin"
import LayoutPrivado from "./components/layouts/LayoutPrivado"
import RutaProtegida from "./components/guards/RutaProtegida"
import RutaPublica from "./components/guards/RutaPublica"
import FormularioLogin from "./modules/auth/components/FormularioLogin"
import FormularioRegistro from "./modules/auth/components/FormularioRegistro"
import PaginaCrearEmpresa from "./modules/empresa/components/PaginaCrearEmpresa"
import PaginaSuscripciones from "./modules/suscripciones/components/PaginaSuscripciones"
import PaginaDashboard from "./modules/dashboard/components/PaginaDashboard"
import PaginaDashboardTalleres from "./modules/dashboard/components/PaginaDashboardTalleres"
import PaginaClientes from "./modules/clientes/components/PaginaClientes"
import PaginaEquipos from "./modules/equipos/components/PaginaEquipos"

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    navigationRef.current = (to, options) => navigate(to, options)
    return () => {
      navigationRef.current = null
    }
  }, [navigate])

  return (
    <Routes>
      <Route element={<RutaPublica />}>
        <Route element={<LayoutLogin />}>
          <Route path="/login" element={<FormularioLogin />} />
          <Route path="/registro" element={<FormularioRegistro />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida />}>
        <Route path="/empresa/crear" element={<PaginaCrearEmpresa />} />
        <Route path="/suscripciones" element={<PaginaSuscripciones />} />
        <Route path="/dashboard/talleres" element={<PaginaDashboardTalleres />} />
        
        <Route element={<LayoutPrivado />}>
          <Route path="/dashboard" element={<PaginaDashboard />} />
          <Route path="/dashboard/clientes" element={<PaginaClientes />} />
          <Route path="/dashboard/equipos" element={<PaginaEquipos />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
