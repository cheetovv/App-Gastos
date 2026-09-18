// src/utils/calculos.js
export function calcularTotalesDelMes(movimientos) {
  const ingresos = movimientos
    .filter((mov) => mov.tipo === "ingreso")
    .reduce((suma, mov) => suma + mov.monto, 0);

  const egresos = movimientos
    .filter((mov) => mov.tipo === "egreso")
    .reduce((suma, mov) => suma + mov.monto, 0);

  return { ingresos, egresos, balance: ingresos - egresos };
}