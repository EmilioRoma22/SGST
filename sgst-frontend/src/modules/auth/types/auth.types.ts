export interface DatosLogin {
  correo_usuario: string
  password_usuario: string
}

export interface DatosRegistro {
  nombre_usuario: string
  apellidos_usuario: string
  correo_usuario: string
  telefono_usuario: string
  password_usuario: string
  confirmar_password_usuario: string
}

export interface RespuestaApi {
  message: string
}

export interface ErrorApi {
  error: {
    code: string
    message: string
  }
}
