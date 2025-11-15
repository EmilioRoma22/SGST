export interface DatosUsuarioRegistro {
    nombre_usuario: string,
    apellidos_usuario: string,
    correo_usuario: string,
    telefono_usuario: string,
    password_usuario: string,
    confirmar_password_usuario: string
}

export interface DatosUsuarioLogin {
    correo_usuario: string,
    password_usuario: string
}

export interface DatosCrearEmpresa {
    nombre_empresa: string,
    correo_empresa: string,
    direccion_empresa: string,
    rfc_empresa: string,
    telefono_empresa: string
}

export interface Usuario {
    id_usuario: number,
    id_empresa: number,
    nombre_usuario: string,
    apellidos_usuario: string,
    correo_usuario: string,
    taller: Talleres | null,
    rol_en_taller: boolean,
    rol: string | null
}

export interface Usuarios {
    id_usuario: number,
    nombre_usuario: string,
    apellidos_usuario: string,
    correo_usuario: string,
    id_taller: number,
    rol_taller: string
}

export interface Licencias {
    id_licencia: number,
    nombre_licencia: string,
    descripcion: string,
    precio_mensual: string,
    precio_anual: string,
    max_talleres: number,
    max_usuarios: number,
    activo: boolean
}

export interface Talleres {
    id_taller: number,
    id_empresa: number,
    nombre_taller: string,
    telefono_taller: string,
    correo_taller: string,
    direccion_taller: string,
    rfc_taller: string,
    ruta_logo: string | null,
    activo: boolean,
    fecha_creacion: string
}

export interface DatosCrearTaller {
    nombre_taller: string;
    telefono_taller: string;
    correo_taller: string;
    direccion_taller: string;
    rfc_taller: string;
}

export interface Orden {
    id_orden: number;
    id_taller: number,
    num_orden: number,
    id_cliente: number,
    id_equipo: number,
    accesorios: string,
    falla: string,
    diagnostico_inicial: string,
    solucion_aplicada: string,
    id_prioridad: number,
    tecnico_asignado: number,
    fecha_estimada_de_fin: string,
    fecha_entrega: string,
    id_estado: number,
    costo_total: number,
    fecha_creacion: string,
    ultima_actualizacion: string,
    creado_por: string,
    cerrado_por: string
}