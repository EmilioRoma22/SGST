import { z } from "zod"

export const licenciaDtoSchema = z.object({
  id_licencia: z.number(),
  nombre_licencia: z.string(),
  descripcion: z.string().nullable(),
  precio_mensual: z.string(),
  precio_anual: z.string(),
  max_talleres: z.number(),
  max_usuarios: z.number(),
})

export const suscripcionDtoSchema = z.object({
  id_suscripcion: z.number(),
  id_empresa: z.number(),
  id_licencia: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string().nullable(),
  activa: z.boolean(),
})

export const verificacionSuscripcionSchema = z.object({
  tiene_suscripcion: z.boolean(),
  suscripcion: suscripcionDtoSchema.nullable(),
  licencia: licenciaDtoSchema.nullable(),
})

export type VerificacionSuscripcionValidado = z.infer<
  typeof verificacionSuscripcionSchema
>
