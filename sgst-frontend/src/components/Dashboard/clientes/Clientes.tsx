import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, LoaderCircle } from "lucide-react";
import type { Cliente } from "../../../services/interfaces";
import { ModalCrearCliente } from "./ModalCrearCliente";
import { mostrarToast } from "../../../utils/MostrarToast";
import { AnimatePresence } from "motion/react";
import { Toaster } from "react-hot-toast";
import { useTaller } from "../../../contexts/TallerContext";
import { obtenerClientesTaller } from "../../../services/api";
import { ModalModificarCliente } from "./ModalModificarCliente";
import { ModalEliminarCliente } from "./ModalEliminarCliente";

export default function ClientesTabla() {
  const { taller } = useTaller()
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalCrearCliente, setModalCrearCliente] = useState(false);
  const [modalModificarCliente, setModalModificarCliente] = useState(false)
  const [modalEliminarCliente, setModalEliminarCliente] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formDatos, setFormDatos] = useState({
    id_taller: taller?.id_taller ?? 0,
    nombre_cliente: "",
    apellidos_cliente: "",
    correo_cliente: "",
    telefono_cliente: "",
    direccion_cliente: "",
    notas_cliente: ""
  });
  const [formModificarCliente, setFormModificarCliente] = useState({
    id_taller: taller?.id_taller ?? 0,
    id_cliente: 0,
    nombre_cliente: "",
    apellidos_cliente: "",
    correo_cliente: "",
    telefono_cliente: "",
    direccion_cliente: "",
    notas_cliente: ""
  })
  const [clienteSeleccionado, setClienteSeleccionado] = useState({
    id_cliente: 0,
    nombre_cliente: "",
    apellidos_cliente: "",
  })

  const obtClientes = async () => {
    try {
      if (taller?.id_taller) {
        const clientes = await obtenerClientesTaller(taller?.id_taller)
        setClientes(clientes)
      }
    } catch (error) {
      mostrarToast("Hubo un error al obtener los clientes", "error")
    }
  }

  useEffect(() => {
    setLoading(true)

    Promise.all([
      obtClientes(),
    ]).then(() => { setLoading(false) })
  }, [])

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Clientes</h3>
          <button
            onClick={() => setModalCrearCliente(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus size={18} />
            Nuevo cliente
          </button>
        </div>

        <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!loading ? (
                clientes.length !== 0 ? (
                  clientes.map((c) => (
                    <tr key={c.id_cliente}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {c.nombre_cliente} {c.apellidos_cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.correo_cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.telefono_cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.direccion_cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 italic">{c.notas_cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-2">
                        <button
                          className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-200 transition"
                          onClick={() => {
                            setFormModificarCliente({
                              id_taller: c.id_taller,
                              id_cliente: c.id_cliente,
                              nombre_cliente: c.nombre_cliente,
                              apellidos_cliente: c.apellidos_cliente,
                              correo_cliente: c.correo_cliente,
                              direccion_cliente: c.direccion_cliente,
                              notas_cliente: c.notas_cliente,
                              telefono_cliente: c.telefono_cliente
                            })
                            setClienteSeleccionado({
                              id_cliente: c.id_cliente,
                              nombre_cliente: c.nombre_cliente,
                              apellidos_cliente: c.apellidos_cliente
                            })
                            setModalModificarCliente(true)
                          }}
                        >
                          <Edit size={14} /> Editar
                        </button>
                        <button 
                          className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200 transition"
                          onClick={() => {
                            setClienteSeleccionado({
                              nombre_cliente: c.nombre_cliente,
                              apellidos_cliente: c.apellidos_cliente,
                              id_cliente: c.id_cliente
                            })
                            setModalEliminarCliente(true)
                          }}
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400 font-semibold">
                      Aún no hay clientes
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400 font-semibold">
                    <div className="flex justify-center items-center gap-4">
                      <LoaderCircle className="animate-spin" />
                      <span>Cargando clientes</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toaster />

      <AnimatePresence>
        {modalCrearCliente && (
          <ModalCrearCliente
            cerrarModal={() => setModalCrearCliente(false)}
            formDatos={formDatos}
            setFormDatos={setFormDatos}
            mostrarToast={mostrarToast}
            cliente_creado={() => {
              obtClientes()
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalModificarCliente && (
          <ModalModificarCliente
            cerrarModal={() => setModalModificarCliente(false)}
            cliente_modificado={obtClientes}
            formModificarCliente={formModificarCliente}
            setFormModificarCliente={setFormModificarCliente}
            clienteSeleccionado={clienteSeleccionado}
            mostrarToast={mostrarToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEliminarCliente && (
          <ModalEliminarCliente 
            cerrarModal={() => setModalEliminarCliente(false)}
            clienteSeleccionado={clienteSeleccionado}
            cliente_eliminado={obtClientes}
            mostrarToast={mostrarToast}
          />
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
