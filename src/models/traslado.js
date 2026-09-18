export function crearObjetoTraslado({
  cuentaOrigen,
  cuentaDestino,              
  monto,           
  fecha,
  nota
}) {
  return {
    cuentaOrigen,
    cuentaDestino,
    monto,
    fecha,
    nota: nota || null
  };
}