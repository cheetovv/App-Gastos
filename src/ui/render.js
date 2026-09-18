// src/ui/render.js
export function renderTarjetas(tarjetas, contenedor) {
  contenedor.innerHTML = "";
  tarjetas.forEach((tarjeta) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${tarjeta.alias} - ${tarjeta.banco}
      <button data-accion="editar" data-id="${tarjeta.id}">Editar</button>
      <button data-accion="borrar" data-id="${tarjeta.id}">Borrar</button>
    `;
    contenedor.appendChild(li);
  });
}

export function renderTraslados(traslados, contenedor){
  contenedor.innerHTML = "";
  traslados.forEach((traslado) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${traslado.cuentaOrigen} => ${traslado.cuentaDestino} : $${traslado.monto} (${traslado.fecha})
    `;
    contenedor.appendChild(li); 
  })
}

export function renderItemsTemporal(items, contenedor, totalElemento) {
  contenedor.innerHTML = "";
  let total = 0;
  items.forEach((item, indice) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.nombre} - $${item.precio} <button data-indice="${indice}">Quitar</button>`;
    contenedor.appendChild(li);
    total += item.precio;
  });
  totalElemento.textContent = total;
}

export function renderMovimientos(movimientos, contenedor) {
  contenedor.innerHTML = "";
  movimientos.forEach((mov) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${mov.fecha} | ${mov.tipo} | ${mov.categoria} | $${mov.monto}
      <button data-accion="editar" data-id="${mov.id}">Editar</button>
      <button data-accion="borrar" data-id="${mov.id}">Borrar</button>
    `;
    contenedor.appendChild(li);
  });
}


export function renderDeudas(deudas, contenedor) {
  contenedor.innerHTML = "";
  deudas.forEach((deuda) => {
    const saldoPendiente = deuda.montoTotal - (deuda.cuotasPagadas * deuda.valorCuota);
    const cuotasCompletas = deuda.cuotasPagadas >= deuda.numeroCuotas;

    const li = document.createElement("li");
    li.innerHTML = `
      ${deuda.descripcion} (${deuda.acreedor}) | Cuota: $${deuda.valorCuota.toFixed(0)} | Pagadas: ${deuda.cuotasPagadas}/${deuda.numeroCuotas} | Saldo: $${saldoPendiente.toFixed(0)}
      ${cuotasCompletas ? "<strong>PAGADA</strong>" : `<button data-accion="pagar-cuota" data-id="${deuda.id}">Pagar cuota</button>`}
    `;
    contenedor.appendChild(li);
  });
}

