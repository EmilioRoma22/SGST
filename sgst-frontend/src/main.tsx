import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import './index.css'
import { Inicio } from './components/Inicio'
import { CrearEmpresa } from './components/CrearEmpresa'
import RutaProtegida from './components/RutaProtegida'
import { DashboardTalleres } from './components/DashboardTalleres/DashboardTalleres'
import { Suscripciones } from './components/Suscripciones'
import { Error } from './components/errores/Error'
import { Dashboard } from './components/Dashboard/Dashboard'
import { AuthProvider } from './contexts/AuthContext'
import { TallerProvider } from './contexts/TallerContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TallerProvider>
        <BrowserRouter>
          <Routes>

            <Route path="/" element={<Inicio />} />

            <Route element={<RutaProtegida />}>
              <Route path="/crear_empresa" element={<CrearEmpresa />} />
              <Route path="/dashboard_talleres" element={<DashboardTalleres />} />
              <Route path="/suscripciones" element={<Suscripciones />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route path="/error_servidor" element={<Error />} />

          </Routes>
        </BrowserRouter>
      </TallerProvider>
    </AuthProvider>
  </StrictMode>,
)
