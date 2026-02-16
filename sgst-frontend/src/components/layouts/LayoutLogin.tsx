import { Outlet, Link, useLocation } from "react-router-dom"

function LayoutLogin() {
  const ubicacion = useLocation()
  const esRegistro = ubicacion.pathname === "/registro"

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950/40 via-zinc-900 to-purple-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        <img
          src="/sgst_logo_white.svg"
          alt="SGST"
          className="w-80 relative z-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.15)]"
        />
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-2">
            <img src="/sgst_logo_white.svg" alt="SGST" className="w-36" />
          </div>

          <Outlet />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-950 text-zinc-500">
                {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to={esRegistro ? "/login" : "/registro"}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {esRegistro ? "Iniciar sesión" : "Regístrate aquí"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutLogin
