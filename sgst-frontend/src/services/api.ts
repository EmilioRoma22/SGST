import apiAxios from "./apiAxios";
import type { AxiosError } from "axios";
import type { Cliente, DatosCrearCliente, DatosCrearEmpresa, DatosCrearEquipo, DatosCrearOrden, DatosCrearTaller, DatosModificarCliente, DatosUsuarioRegistro, Equipos, Licencias, OrdenServicioAPI, Talleres, TipoEquipo, Usuario, Usuarios } from "./interfaces";

type ApiError = AxiosError<{
    detail?: { error?: string };
    error?: string;
    message?: string;
}>;

function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (error && typeof error === "object" && "isAxiosError" in error) {
        const apiError = error as ApiError;

        const data = apiError.response?.data;

        if (!data) return defaultMessage;

        if (typeof data.detail === "string") {
            return data.detail;
        }

        if (typeof data.detail === "object" && data.detail?.error) {
            return data.detail.error;
        }

        if (data.error) return data.error;
        if (data.message) return data.message;

        return defaultMessage;
    }

    return defaultMessage;
}

function logError(context: string, error: unknown): void {
    console.error(`Error ${context}:`, error);
}

export async function registrarUsuario(datosUsuario: DatosUsuarioRegistro): Promise<{ ok: boolean; message: string }> {
    try {
        const respuesta = await apiAxios.post("/usuarios/registrar_usuario", datosUsuario)

        return {
            ok: true,
            message: respuesta.data.message
        }

    } catch (error: unknown) {
        logError("al registrar el usuario", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al registrar el usuario.")
        };
    }
}

export async function loginUsuario(correo_usuario: string, password_usuario: string): Promise<{ ok: boolean; message: string; usuario?: Usuario, rol_en_taller?: boolean, taller?: Talleres, rol?: string }> {
    try {
        const respuesta = await apiAxios.post("/usuarios/iniciar_sesion", { correo_usuario, password_usuario })

        return {
            ok: true,
            message: respuesta.data.message,
            usuario: respuesta.data.usuario,
            rol_en_taller: respuesta.data.usuario.rol_en_taller,
            taller: respuesta.data.taller,
            rol: respuesta.data.rol
        };

    } catch (error: unknown) {
        logError("al iniciar sesión", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al iniciar sesion.")
        };
    }
}

export async function crearEmpresa(datosEmpresa: DatosCrearEmpresa): Promise<{ ok: boolean; message: string, id_empresa?: number }> {
    try {
        const respuesta = await apiAxios.post("/empresas/crear", datosEmpresa)

        return {
            ok: true,
            message: respuesta.data.message,
            id_empresa: respuesta.data.id_empresa
        }

    } catch (error: unknown) {
        logError("al crear la empresa", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear la empresa.")
        };
    }
}

export async function verificarSuscripcion(id_empresa: number): Promise<{ suscripcion_activa: boolean, message: string, id_licencia?: number }> {
    try {
        const respuesta = await apiAxios.post(`suscripciones/verificar_suscripcion_empresa?id_empresa=${id_empresa}`)

        if (respuesta.data.suscripcion_activa) {
            return {
                suscripcion_activa: respuesta.data.suscripcion_activa,
                message: respuesta.data.message,
                id_licencia: respuesta.data.id_licencia
            }
        }

        return {
            suscripcion_activa: respuesta.data.suscripcion_activa,
            message: respuesta.data.message
        }

    } catch (error: unknown) {
        logError("al verificar la suscripcion", error);
        return {
            suscripcion_activa: false,
            message: getErrorMessage(error, "Error al verificar la suscripcion.")
        };
    }
};

export async function obtenerLicencias(): Promise<Licencias[]> {
    try {
        const respuesta = await apiAxios.get("/suscripciones/obtener_licencias")

        return respuesta.data.licencias
    } catch (error: unknown) {
        logError("al obtener las licencias", error);
        throw error;
    }
}

export async function seleccionarLicencia(id_empresa: number, id_licencia: number): Promise<{ ok: boolean, message: string }> {
    try {
        const respuesta = await apiAxios.post(`/suscripciones/seleccionar_licencia?id_empresa=${id_empresa}&id_licencia=${id_licencia}`)


        return {
            ok: true,
            message: respuesta.data.message
        }

    } catch (error: unknown) {
        logError("al seleccionar la licencia", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al seleccionar la licencia.")
        };
    }
}

export async function obtenerTalleres(id_empresa: number): Promise<Talleres[]> {
    try {
        const respuesta = await apiAxios.get(`talleres/obtener_talleres?id_empresa=${id_empresa}`)

        return respuesta.data.talleres
    } catch (error: unknown) {
        logError("al obtener los talleres", error);
        throw error;
    }
}

export async function crearTaller(id_empresa: number, datosTaller: DatosCrearTaller): Promise<{ ok: boolean; message: string }> {
    try {
        const respuesta = await apiAxios.post(`talleres/crear_taller?id_empresa=${id_empresa}`, datosTaller)

        return {
            ok: true,
            message: respuesta.data.message
        };

    } catch (error: unknown) {
        logError("al crear el taller", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear el taller.")
        };
    }
}

export async function obtenerUsuariosTaller(id_taller: number): Promise<Usuarios[]> {
    try {
        const respuesta = await apiAxios.get(`/talleres/obtener_usuarios_taller?id_taller=${id_taller}`)

        return respuesta.data.usuarios
    } catch (error: unknown) {
        logError("al obtener los usuarios", error);
        throw error;
    }
}

export async function crearUsuarioTaller(id_taller: number, rol: number, datosUsuario: DatosUsuarioRegistro): Promise<{ ok: boolean; message: string }> {
    try {
        const respuesta = await apiAxios.post(`/usuarios/crear_usuario_taller?id_taller=${id_taller}&rol=${rol}`, datosUsuario)

        return {
            ok: true,
            message: respuesta.data.message
        };

    } catch (error: unknown) {
        logError("al crear el usuario", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear el usuario.")
        };
    }
}

export async function obtenerOrdenes(id_taller: number): Promise<OrdenServicioAPI[]> {
    try {
        const respuesta = await apiAxios.get(`/ordenes?id_taller=${id_taller}`)

        return respuesta.data as OrdenServicioAPI[];
    } catch (error: unknown) {
        logError("al obtener las ordenes", error);
        throw error;
    }
}

export async function obtenerClientesTaller(id_taller: number): Promise<Cliente[]> {
    try {
        const response = await apiAxios.get(`/clientes/obtener_clientes?id_taller=${id_taller}`)

        return response.data.clientes
    } catch (error: unknown) {
        logError("al obtener las ordenes", error);
        throw error;
    }
}

export async function obtenerUltimoClienteTaller(id_taller: number): Promise<Cliente> {
    try {
        const response = await apiAxios.get(`/clientes/obtener_ultimo_cliente?id_taller=${id_taller}`)

        return response.data.cliente
    } catch (error: unknown) {
        logError("al obtener las ordenes", error);
        throw error;
    }
}

export async function crearClienteTaller(dataCliente: DatosCrearCliente) {
    try {
        const respuesta = await apiAxios.post(`/clientes/crear_cliente`, dataCliente)

        return {
            ok: true,
            message: respuesta.data.message
        };

    } catch (error: unknown) {
        logError("al crear el cliente", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear el cliente.")
        };
    }
}

export async function modificarClienteTaller(dataCliente: DatosModificarCliente): Promise<{ ok: boolean, message: string }> {
    try {
        const respuesta = await apiAxios.put("/clientes/modificar_cliente", dataCliente)

        return {
            ok: true,
            message: respuesta.data.message
        }
    } catch (error: unknown) {
        logError("al modificar el cliente", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al modificar el cliente.")
        };
    }
}

export async function eliminarClienteTaller(id_cliente: number): Promise<{ ok: boolean, message: string }> {
    try {
        const respuesta = await apiAxios.delete(`/clientes/eliminar_cliente?id_cliente=${id_cliente}`)

        return {
            ok: true,
            message: respuesta.data.message
        }
    } catch (error: unknown) {
        logError("al modificar el cliente", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al modificar el cliente.")
        };
    }
}

export async function obtenerEquiposTaller(id_taller: number): Promise<Equipos[]> {
    try {
        const response = await apiAxios.get(`/equipos/obtener_equipos?id_taller=${id_taller}`)

        return response.data.equipos
    } catch (error: unknown) {
        logError("al obtener los equipos", error);
        throw error;
    }
}

export async function obtenerTipoEquipos(id_taller: number): Promise<TipoEquipo[]> {
    try {
        const response = await apiAxios.get(`/equipos/obtener_tipo_equipos?id_taller=${id_taller}`)

        return response.data.tipo_equipos
    } catch (error: unknown) {
        logError("al obtener los tipos de equipos", error);
        throw error;
    }
}

export async function crearTipoEquipoTaller(id_taller: number, nombre_tipo: string): Promise<{ ok: boolean, message: string }> {
    try {
        const respuesta = await apiAxios.post(`/equipos/crear_tipo_equipo?id_taller=${id_taller}&nombre_tipo=${nombre_tipo}`)

        return {
            ok: true,
            message: respuesta.data.message
        }
    } catch (error: unknown) {
        logError("al crear el tipo de equipo", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear el tipo de equipo.")
        };
    }
}

export async function crearEquipoTaller(dataEquipo: DatosCrearEquipo): Promise<{ ok: boolean, message: string }> {
    try {
        const respuesta = await apiAxios.post(`/equipos/crear_equipo`, dataEquipo)

        return {
            ok: true,
            message: respuesta.data.message
        }
    } catch (error: unknown) {
        logError("al crear el equipo", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear el equipo.")
        };
    }

}

export async function obtenerUltimoEquipoTaller(id_taller: number): Promise<Equipos> {
    try {
        const response = await apiAxios.get(`/equipos/
            ?id_taller=${id_taller}`)

        return response.data.ultimo_equipo
    } catch (error: unknown) {
        logError("al obtener el ultimo equipo", error);
        throw error;
    }
}

export async function crearOrdenTaller(dataOrden: DatosCrearOrden): Promise<{ ok: boolean, message: string }> {
    try {
        const respuesta = await apiAxios.post(`/ordenes/crear_orden`, dataOrden)

        return {
            ok: true,
            message: respuesta.data.message
        }
    } catch (error: unknown) {
        logError("al crear la orden", error);
        return {
            ok: false,
            message: getErrorMessage(error, "Error al crear la orden.")
        };
    }
}