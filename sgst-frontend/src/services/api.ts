import apiAxios from "./apiAxios";
import type { DatosCrearEmpresa, DatosCrearTaller, DatosUsuarioRegistro, Licencias, Talleres, Usuario, Usuarios } from "./interfaces";

export async function registrarUsuario(datosUsuario: DatosUsuarioRegistro): Promise<{ ok: boolean; message: string }> {
    try {
        const respuesta = await apiAxios.post("/usuarios/registrar_usuario", datosUsuario)

        return {
            ok: true,
            message: respuesta.data.message
        }



    } catch (error: any) {
        console.error("Error al registrar el usuario:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al registrar el usuario.";
        return {
            ok: false,
            message: message
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
            rol_en_taller: respuesta.data.rol_en_taller,
            taller: respuesta.data.taller,
            rol: respuesta.data.rol
        };

    } catch (error: any) {
        console.error("Error al iniciar sesión:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al iniciar sesion.";
        return {
            ok: false,
            message: message
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

    } catch (error: any) {
        console.error("Error al crear la empresa:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al crear la empresa.";
        return {
            ok: false,
            message: message
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

    } catch (error: any) {
        console.error("Error al verificar la sesion:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al verificar la suscripcion.";
        return {
            suscripcion_activa: false,
            message: message
        };
    }
};

export async function obtenerLicencias(): Promise<Licencias[]> {
    try {
        const respuesta = await apiAxios.get("/suscripciones/obtener_licencias")

        return respuesta.data.licencias
    } catch (error: any) {
        console.error("Error al obtener las licencias:", error.message);
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

    } catch (error: any) {
        console.error("Error al seleccionar la licencia:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al seleccionar la licencia.";
        return {
            ok: false,
            message: message
        };
    }
}

export async function obtenerTalleres(id_empresa: number): Promise<Talleres[]> {
    try {
        const respuesta = await apiAxios.get(`talleres/obtener_talleres?id_empresa=${id_empresa}`)

        return respuesta.data.talleres
    } catch (error: any) {
        console.error("Error al obtener los talleres:", error.message);
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

    } catch (error: any) {
        console.error("Error al crear el taller:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al crear el taller.";
        return {
            ok: false,
            message: message
        };
    }
}

export async function obtenerUsuariosTaller(id_taller: number): Promise<Usuarios[]> {
    try {
        const respuesta = await apiAxios.get(`/talleres/obtener_usuarios_taller?id_taller=${id_taller}`)

        return respuesta.data.usuarios
    } catch (error: any) {
        console.error("Error al obtener los usuarios:", error.message);
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

    } catch (error: any) {
        console.error("Error al crear el usuario:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al crear el usuario.";
        return {
            ok: false,
            message: message
        };
    }
}