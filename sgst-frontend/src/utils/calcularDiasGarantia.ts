export function calcularDiasRestantesGarantia(fechaFinGarantia: string | null | undefined): number | null {
  if (!fechaFinGarantia) return null;

  const hoy = new Date();
  const fin = new Date(fechaFinGarantia);

  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  const diffMs = fin.getTime() - hoy.getTime();
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return dias;
}
