import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  LoaderCircle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Search
} from "lucide-react";
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
  const [busqueda, setBusqueda] = useState("");
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

  const clientesFiltrados = clientes.filter(cliente => {
    const termino = busqueda.toLowerCase();
    return (
      cliente.nombre_cliente.toLowerCase().includes(termino) ||
      cliente.apellidos_cliente.toLowerCase().includes(termino) ||
      cliente.telefono_cliente.toLowerCase().includes(termino) ||
      cliente.correo_cliente.toLowerCase().includes(termino) ||
      cliente.id_cliente.toString().includes(termino)
    );
  });

  return (
    <React.Fragment>
      <div className="flex flex-col gap-8 w-full max-w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Clientes</h3>
            <p className="text-gray-500 mt-1">Gestiona la información de tus clientes</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm hidden md:block">
              <span className="text-gray-500 text-sm font-medium">Total: </span>
              <span className="text-gray-900 font-bold">{clientesFiltrados.length}</span>
            </div>
            <button
              onClick={() => setModalCrearCliente(true)}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition cursor-pointer shadow-lg shadow-gray-900/20 active:scale-95 transform duration-100 w-full md:w-auto"
            >
              <Plus size={20} />
              Nuevo
            </button>
          </div>
        </div>

        {!loading ? (
          clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aún no hay clientes</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Comienza agregando tu primer cliente al sistema</p>
              <button
                onClick={() => setModalCrearCliente(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition cursor-pointer shadow-lg shadow-gray-900/20"
              >
                <Plus size={20} />
                Agregar Cliente
              </button>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3>
              <p className="text-gray-500 text-sm mt-1 mb-6">Intenta con otros términos de búsqueda</p>
              <button
                onClick={() => setBusqueda("")}
                className="text-gray-900 font-medium hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {clientesFiltrados.map((c) => (
                <div
                  key={c.id_cliente}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm shrink-0">
                        <User size={24} className="text-gray-700" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 line-clamp-1" title={`${c.nombre_cliente} ${c.apellidos_cliente}`}>
                          {c.nombre_cliente} {c.apellidos_cliente}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">Cliente #{c.id_cliente}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Correo Electrónico</p>
                        <p className="text-sm font-medium text-gray-900 truncate" title={c.correo_cliente}>
                          {c.correo_cliente}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Teléfono</p>
                        <p className="text-sm font-medium text-gray-900">
                          {c.telefono_cliente}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dirección</p>
                        <p className="text-sm text-gray-700 line-clamp-2" title={c.direccion_cliente}>
                          {c.direccion_cliente}
                        </p>
                      </div>
                    </div>

                    {c.notas_cliente && (
                      <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-1">
                        <FileText size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-0.5">Notas</p>
                          <p className="text-sm text-gray-700 line-clamp-2 italic">
                            "{c.notas_cliente}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm font-medium text-sm"
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
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all shadow-sm font-medium text-sm"
                      onClick={() => {
                        setClienteSeleccionado({
                          nombre_cliente: c.nombre_cliente,
                          apellidos_cliente: c.apellidos_cliente,
                          id_cliente: c.id_cliente
                        })
                        setModalEliminarCliente(true)
                      }}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-32">
            <LoaderCircle className="animate-spin text-gray-400 mb-4" size={40} />
            <p className="text-gray-500 font-medium">Cargando clientes...</p>
          </div>
        )}
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
