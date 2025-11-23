import { useState } from "react"
import { FormCrearOrden } from "./FormCrearOrden"
import { useTaller } from "../../../contexts/TallerContext"
import { Toaster } from "react-hot-toast"
import { OrdenesDeServicio } from "./OrdenesServicio"

export const OrdenesLayout = () => {
    const { taller, rol_taller } = useTaller()
    const [enCrearOrden, setEnCrearOrden] = useState(false)
    const [nombreClienteSeleccionado, setNombreClienteSeleccionado] = useState<string>()
    const [nombreEquipoSeleccionado, setNombreEquipoSeleccionado] = useState<string>()
    const [ordenData, setOrdenData] = useState({
        id_taller: taller?.id_taller ?? 0,
        id_cliente: 0,
        id_equipo: 0,
        accesorios: "",
        falla: "",
        diagnostico_inicial: "",
        solucion_aplicada: "",
        id_prioridad: 1,
        tecnico_asignado: 0,
        fecha_estimada_de_fin: "",
        id_estado: 1,
        costo_total: 0,
        meses_garantia: 0,
        fecha_fin_garantia: "",
        es_por_garantia: 0,
        id_orden_origen: 0,
    });

    const titulo = enCrearOrden
        ? "Nueva Orden de Servicio"
        : "Órdenes de Servicio"

    const subTitulo = enCrearOrden
        ? "Complete la información para registrar un nuevo servicio"
        : "Gestiona y monitorea las reparaciones de tu taller"

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">{titulo}</h3>
                {rol_taller !== "TECNICO" && (
                    <button
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                        onClick={() => setEnCrearOrden(!enCrearOrden)}
                    >
                        {enCrearOrden ? "Regresar" : "Nueva Orden"}
                    </button>
                )}
            </div>

            <p className="text-gray-500 mt-1">{subTitulo}</p>

            <div className="mt-6">
                {!enCrearOrden ? (
                    <OrdenesDeServicio />
                ) : (
                    <FormCrearOrden
                        ordenCreada={() => {
                            setEnCrearOrden(false)
                        }}
                        ordenData={ordenData}
                        setOrdenData={setOrdenData}
                        nombreClienteSeleccionado={nombreClienteSeleccionado}
                        setNombreClienteSeleccionado={setNombreClienteSeleccionado}
                        nombreEquipoSeleccionado={nombreEquipoSeleccionado}
                        setNombreEquipoSeleccionado={setNombreEquipoSeleccionado}
                    />
                )}
            </div>

            <Toaster />
        </>
    )
}