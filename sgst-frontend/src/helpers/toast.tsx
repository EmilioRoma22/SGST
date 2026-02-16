import toast from "react-hot-toast"

type TipoToast = "success" | "error" | "warning"

const ICONOS: Record<TipoToast, React.ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  ),
}

const ESTILOS: Record<TipoToast, { borde: string; fondoIcono: string; colorIcono: string }> = {
  success: {
    borde: "border-l-emerald-500",
    fondoIcono: "bg-emerald-500/15",
    colorIcono: "text-emerald-400",
  },
  error: {
    borde: "border-l-red-500",
    fondoIcono: "bg-red-500/15",
    colorIcono: "text-red-400",
  },
  warning: {
    borde: "border-l-amber-500",
    fondoIcono: "bg-amber-500/15",
    colorIcono: "text-amber-400",
  },
}

function ToastPersonalizado({
  tipo,
  mensaje,
  visible,
}: {
  tipo: TipoToast
  mensaje: string
  visible: boolean
}) {
  const estilo = ESTILOS[tipo]

  return (
    <div
      className={`flex items-center gap-3 w-[380px] px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl border-l-4 ${estilo.borde}`}
      style={{
        transition: "all 0.25s ease-out",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
      }}
    >
      <div
        className={`w-8 h-8 shrink-0 rounded-full ${estilo.fondoIcono} flex items-center justify-center ${estilo.colorIcono}`}
      >
        {ICONOS[tipo]}
      </div>
      <p className="text-sm text-zinc-200 leading-snug">{mensaje}</p>
    </div>
  )
}

export const mostrarToast = {
  success: (mensaje: string) =>
    toast.custom((t) => (
      <ToastPersonalizado tipo="success" mensaje={mensaje} visible={t.visible} />
    )),
  error: (mensaje: string) =>
    toast.custom((t) => (
      <ToastPersonalizado tipo="error" mensaje={mensaje} visible={t.visible} />
    )),
  warning: (mensaje: string) =>
    toast.custom((t) => (
      <ToastPersonalizado tipo="warning" mensaje={mensaje} visible={t.visible} />
    )),
}
