// src/ui/render.js
export function renderTarjetas(tarjetas, contenedor) {
  contenedor.innerHTML = "";
  tarjetas.forEach((tarjeta) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info">
        ${tarjeta.alias} - ${tarjeta.banco}
      </div>
      <div class="acciones">
        <button data-accion="editar" data-id="${tarjeta.id}">Editar</button>
        <button data-accion="borrar" data-id="${tarjeta.id}">Borrar</button>
      </div>
    `;
    contenedor.appendChild(li);
  });
}

export function renderTraslados(traslados, contenedor){
  contenedor.innerHTML = "";
  traslados.forEach((traslado) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info">
        ${traslado.cuentaOrigen} => ${traslado.cuentaDestino} : $${traslado.monto} (${traslado.fecha})
      </div>
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
    const claseMonto = mov.tipo === "ingreso" ? "ingreso" : "egreso";
    li.innerHTML = `
    <div class="info">
        ${mov.fecha} | ${mov.tipo} | ${mov.categoria}
        <span class="monto ${claseMonto}">$${mov.monto}</span>
      </div>
      <div class="acciones">
        <button data-accion="editar" data-id="${mov.id}">Editar</button>
        <button data-accion="borrar" data-id="${mov.id}">Borrar</button>
      </div>
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
      <div class="info">
        ${deuda.descripcion} (${deuda.acreedor}) | Cuota: $${deuda.valorCuota.toFixed(0)} | Pagadas: ${deuda.cuotasPagadas}/${deuda.numeroCuotas} | Saldo: $${saldoPendiente.toFixed(0)}
      </div>
      <div class="acciones">
        ${cuotasCompletas ? "<strong>PAGADA</strong>" : `<button data-accion="pagar-cuota" data-id="${deuda.id}">Pagar cuota</button>`}
      </div>
    `;
    contenedor.appendChild(li);
  });
}

