export function crearObjetoDeuda({
  descripcion,
  tipo,              // "compra_credito" o "prestamo_personal"
  acreedor,           // ej. "Bancolombia" o "Mi hermano"
  tarjetaId,
  montoTotal,
  numeroCuotas,
  tasaInteres,
  fechaInicio,
  diaPago
}) {
  return {
    descripcion,
    tipo,
    acreedor,
    tarjetaId: tarjetaId || null,
    montoTotal,
    numeroCuotas,
    valorCuota: montoTotal / numeroCuotas,
    tasaInteres: tasaInteres || null,
    fechaInicio,
    diaPago: diaPago || null,
    cuotasPagadas: 0
  };
}