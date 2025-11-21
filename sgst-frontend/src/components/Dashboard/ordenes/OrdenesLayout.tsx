import { useState } from "react"
import { FormCrearOrden } from "./FormCrearOrden"
import { useTaller } from "../../../contexts/TallerContext"
import { mostrarToast } from "../../../utils/MostrarToast"
import { Toaster } from "react-hot-toast"

export const OrdenesLayout = () => {
    const { taller } = useTaller()
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
        ? "Crear nueva orden de servicio"
        : "Órdenes de Servicio"

    return (
        <>
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">{titulo}</h3>

                <button
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    onClick={() => setEnCrearOrden(!enCrearOrden)}
                >
                    {enCrearOrden ? "Regresar" : "Nueva Orden"}
                </button>
            </div>

            <div className="mt-6">
                {!enCrearOrden ? (
                    <ListaOrdenes />
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

const ListaOrdenes = () => (
    <div className="text-gray-600 italic">
        Aquí se mostrarán las órdenes…
    </div>
)

