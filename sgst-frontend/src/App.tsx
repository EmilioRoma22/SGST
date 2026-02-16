import { Navigate, Route, Routes } from "react-router-dom"
import LayoutLogin from "./components/layouts/LayoutLogin"
import FormularioLogin from "./modules/auth/components/FormularioLogin"
import FormularioRegistro from "./modules/auth/components/FormularioRegistro"

function App() {
  return (
    <Routes>
      <Route element={<LayoutLogin />}>
        <Route path="/login" element={<FormularioLogin />} />
        <Route path="/registro" element={<FormularioRegistro />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
