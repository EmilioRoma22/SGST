export interface DatosUsuarioRegistro {
    nombre_usuario: string
    apellidos_usuario: string
    correo_usuario: string
    telefono_usuario: string
    password_usuario: string
    confirmar_password_usuario: string
}

export interface DatosUsuarioLogin {
    correo_usuario: string
    password_usuario: string
}

export interface DatosCrearEmpresa {
    nombre_empresa: string
    correo_empresa: string
    direccion_empresa: string
    rfc_empresa: string
    telefono_empresa: string
}

export interface Usuario {
    id_usuario: number
    id_empresa: number
    nombre_usuario: string
    apellidos_usuario: string
    correo_usuario: string
    rol_en_taller: boolean
    rol: string | null
}

export interface Usuarios {
    id_usuario: number
    nombre_usuario: string
    apellidos_usuario: string
    correo_usuario: string
    id_taller: number
    rol_taller: string
}

export interface Licencias {
    id_licencia: number
    nombre_licencia: string
    descripcion: string
    precio_mensual: string
    precio_anual: string
    max_talleres: number
    max_usuarios: number
    activo: boolean
}

export interface Talleres {
    id_taller: number
    id_empresa: number
    nombre_taller: string
    telefono_taller: string
    correo_taller: string
    direccion_taller: string
    rfc_taller: string
    ruta_logo: string | null
    activo: boolean
    fecha_creacion: string
}

export interface DatosCrearTaller {
    nombre_taller: string
    telefono_taller: string
    correo_taller: string
    direccion_taller: string
    rfc_taller: string
}

export interface Orden {
    id_orden: number
    id_taller: number
    num_orden: number
    id_cliente: number
    id_equipo: number
    accesorios: string
    falla: string
    diagnostico_inicial: string
    solucion_aplicada: string
    id_prioridad: number
    tecnico_asignado: number
    fecha_estimada_de_fin: string
    fecha_entrega: string
    id_estado: number
    costo_total: number
    fecha_creacion: string
    ultima_actualizacion: string
    creado_por: string
    cerrado_por: string
}

export interface Cliente {
    id_cliente: number
    id_taller: number
    nombre_cliente: string
    apellidos_cliente: string
    correo_cliente: string
    telefono_cliente: string
    direccion_cliente: string
    notas_cliente: string
    activo: boolean
    fecha_creacion: string
    ultima_actualizacion: string
}

export interface DatosCrearCliente {
    id_taller: number
    nombre_cliente: string
    apellidos_cliente: string
    correo_cliente: string
    telefono_cliente: string
    direccion_cliente: string
    notas_cliente: string
}

export interface DatosModificarCliente {
    id_cliente: number
    id_taller: number
    nombre_cliente: string
    apellidos_cliente: string
    correo_cliente: string
    telefono_cliente: string
    direccion_cliente: string
    notas_cliente: string
}

export interface DatosCrearOrden {
    id_taller: number,
    id_cliente: number,
    id_equipo: number,
    accesorios: string,
    falla: string,
    diagnostico_inicial: string,
    solucion_aplicada: string,
    id_prioridad: number,
    tecnico_asignado: number,
    fecha_estimada_de_fin: string,
    id_estado: number,
    costo_total: number,
    meses_garantia: number,
    fecha_fin_garantia: string,
    es_por_garantia: number,
    id_orden_origen: number
}

export interface DatosCrearEquipo {
    id_taller: number
    id_tipo: number
    num_serie: string
    marca_equipo: string
    modelo_equipo: string
    descripcion_equipo: string
}

export interface Equipos {
    id_equipo: number
    id_taller: number
    id_tipo: number
    num_serie: string
    marca_equipo: string
    modelo_equipo: string
    descripcion_equipo: string
    fecha_registro: string
    ultima_actualizacion: string
    nombre_tipo: string
}

export interface TipoEquipo {
    id_tipo: number
    nombre_tipo: string
}

export interface OrdenServicio {
    id_orden: number
    id_taller: number
    num_orden: number
    accesorios: string
    falla: string
    diagnostico_inicial: string
    solucion_aplicada: string
    fecha_estimada_de_fin: string
    fecha_entrega: string
    costo_total: number
    meses_garantia: number
    fecha_fin_garantia: string
    es_por_garantia: boolean
    fecha_creacion: string
    ultima_actualizacion: string
    creado_por: string
    cerrado_por: string
    id_cliente: number
    nombre_cliente: string
    apellidos_cliente: string
    id_equipo: number
    id_tipo: number
    marca_equipo: string
    modelo_equipo: string
    nombre_tipo: string
    apellidos_usuario: string
    correo_usuario: string
    rol_en_taller: boolean
    rol: string | null
}

export interface Usuarios {
    id_usuario: number
    nombre_usuario: string
    apellidos_usuario: string
    correo_usuario: string
    id_taller: number
    rol_taller: string
}

export interface Licencias {
    id_licencia: number
    nombre_licencia: string
    descripcion: string
    precio_mensual: string
    precio_anual: string
    max_talleres: number
    max_usuarios: number
    activo: boolean
}

export interface Talleres {
    id_taller: number
    id_empresa: number
    nombre_taller: string
    telefono_taller: string
    correo_taller: string
    direccion_taller: string
    rfc_taller: string
    ruta_logo: string | null
    activo: boolean
    fecha_creacion: string
}

export interface DatosCrearTaller {
    nombre_taller: string
    telefono_taller: string
    correo_taller: string
    direccion_taller: string
    rfc_taller: string
}

export interface Orden {
    id_orden: number
    id_taller: number
    num_orden: number
    id_cliente: number
    id_equipo: number
    accesorios: string
    falla: string
    diagnostico_inicial: string
    solucion_aplicada: string
    id_prioridad: number
    tecnico_asignado: number
    fecha_estimada_de_fin: string
    fecha_entrega: string
    id_estado: number
    costo_total: number
    fecha_creacion: string
    ultima_actualizacion: string
    creado_por: string
    cerrado_por: string
}

export interface OrdenServicioAPI {
    id_orden: number
    num_orden: number
    cliente: string
    equipo: string
    falla: string
    diagnostico: string
    solucion: string
    prioridad: string
    tecnico: string | null
    fecha_estimada: string | null
    fecha_estimada_de_fin?: string | null
    fecha_entrega: string | null
    estado: string
    costo: string
    meses_garantia?: number
    fecha_fin_garantia?: string | null
    es_por_garantia?: boolean
}

export interface Cliente {
    id_cliente: number
    id_taller: number
    nombre_cliente: string
    apellidos_cliente: string
    correo_cliente: string
    telefono_cliente: string
    direccion_cliente: string
    notas_cliente: string
    activo: boolean
    fecha_creacion: string
    ultima_actualizacion: string
}

export interface DatosCrearCliente {
    id_taller: number
    nombre_cliente: string
    apellidos_cliente: string
    correo_cliente: string
    telefono_cliente: string
    direccion_cliente: string
    notas_cliente: string
}

export interface DatosModificarCliente {
    id_cliente: number
    id_taller: number
    nombre_cliente: string
    apellidos_cliente: string
    correo_cliente: string
    telefono_cliente: string
    direccion_cliente: string
    notas_cliente: string
}

export interface DatosCrearOrden {
    id_taller: number,
    id_cliente: number,
    id_equipo: number,
    accesorios: string,
    falla: string,
    diagnostico_inicial: string,
    solucion_aplicada: string,
    id_prioridad: number,
    tecnico_asignado: number,
    fecha_estimada_de_fin: string,
    id_estado: number,
    costo_total: number,
    meses_garantia: number,
    fecha_fin_garantia: string,
    es_por_garantia: number,
    id_orden_origen: number
}

export interface DatosCrearEquipo {
    id_taller: number
    id_tipo: number
    num_serie: string
    marca_equipo: string
    modelo_equipo: string
    descripcion_equipo: string
}

export interface Equipos {
    id_equipo: number
    id_taller: number
    id_tipo: number
    num_serie: string
    marca_equipo: string
    modelo_equipo: string
    descripcion_equipo: string
    fecha_registro: string
    ultima_actualizacion: string
    nombre_tipo: string
}

export interface TipoEquipo {
    id_tipo: number
    nombre_tipo: string
}

export interface OrdenServicio {
    id_orden: number
    id_taller: number
    num_orden: number
    accesorios: string
    falla: string
    diagnostico_inicial: string
    solucion_aplicada: string
    fecha_estimada_de_fin: string
    fecha_entrega: string
    costo_total: number
    meses_garantia: number
    fecha_fin_garantia: string
    es_por_garantia: boolean
    fecha_creacion: string
    ultima_actualizacion: string
    creado_por: string
    cerrado_por: string
    id_cliente: number
    nombre_cliente: string
    apellidos_cliente: string
    id_equipo: number
    id_tipo: number
    marca_equipo: string
    modelo_equipo: string
    nombre_tipo: string
    id_prioridad: number,
    descripcion_prioridad: string,
    id_tecnico: number,
    nombre_tecnico: string,
    apellidos_tecnico: string,
    id_estado: number,
    descripcion_estado: string,
}

export interface OrdenDetallada extends OrdenServicio {
    telefono_cliente: string
    correo_cliente: string
    direccion_cliente: string
    num_serie: string
    descripcion_equipo: string
}

export interface DatosActualizarOrden {
    id_orden: number
    accesorios: string
    falla: string
    diagnostico_inicial: string
    solucion_aplicada: string
    id_prioridad: number
    tecnico_asignado: number
    fecha_estimada_de_fin: string
    id_estado: number
    costo_total: number
}

export interface DatosEditarEquipo {
    id_taller: number,
    id_equipo: number,
    id_tipo: number,
    num_serie: string,
    marca_equipo: string,
    modelo_equipo: string,
    descripcion_equipo: string
}