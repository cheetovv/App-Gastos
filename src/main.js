// src/main.js
import { crearTarjeta, obtenerTarjetas } from "./services/tarjetas.js";
import { renderTarjetas } from "./ui/render.js";
import { crearMovimiento, obtenerMovimientos } from "./services/movimientos.js";
import { renderItemsTemporal, renderMovimientos, renderTraslados } from "./ui/render.js";
import { calcularTotalesDelMes } from "./utils/calculos.js";
import { obtenerMovimientosDelMes } from "./services/movimientos.js";
import { crearObjetoDeuda } from "./models/deuda.js";
import { crearDeuda, obtenerDeudas, registrarPagoCuota } from "./services/deudas.js";
import { renderDeudas } from "./ui/render.js";
import { actualizarTarjeta, borrarTarjeta } from "./services/tarjetas.js";
import { actualizarMovimiento, borrarMovimiento } from "./services/movimientos.js";
import { obtenerTraslados, crearTraslado} from "./services/traslados.js";
import { crearObjetoTraslado } from "./models/traslado.js"
import { auth, proveedorGoogle } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";



let itemsActuales = []; // el "carrito" en memoria
let idTarjetaEnEdicion = null;
let idMovimientoEnEdicion = null;

const formMovimiento = document.getElementById("form-movimiento");
const listaItemsTemp = document.getElementById("lista-items-temporal");
const totalTemp = document.getElementById("total-temporal");
const selectTarjeta = document.getElementById("tarjeta");
const listaMovimientos = document.getElementById("lista-movimientos");
const form = document.getElementById("form-tarjeta");
const listaTarjetas = document.getElementById("lista-tarjetas");
const selectorMes = document.getElementById("selector-mes");
const listaMes = document.getElementById("lista-movimientos-mes");
const totalIngresos = document.getElementById("total-ingresos");
const totalEgresos = document.getElementById("total-egresos");
const balanceMes = document.getElementById("balance-mes");
const formDeuda = document.getElementById("form-deuda");
const listaDeudas = document.getElementById("lista-deudas");
const selectTarjetaDeuda = document.getElementById("deuda-tarjeta");
const formTraslado = document.getElementById("form-traslado");
const listaTraslados = document.getElementById("lista-traslados");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const usuarioActual = document.getElementById("usuario-actual");

async function mostrarTarjetas() {
  const tarjetas = await obtenerTarjetas();
  renderTarjetas(tarjetas, listaTarjetas);
}

listaTarjetas.addEventListener("click", async (evento) => {
  const boton = evento.target;
  const id = boton.dataset.id;

  if (boton.dataset.accion === "borrar") {
    await borrarTarjeta(id);
    mostrarTarjetas();
  }

  if (boton.dataset.accion === "editar") {
    const tarjetas = await obtenerTarjetas();
    const tarjeta = tarjetas.find((t) => t.id === id);

    document.getElementById("alias").value = tarjeta.alias;
    document.getElementById("banco").value = tarjeta.banco;
    document.getElementById("cupo").value = tarjeta.cupo ?? "";

    idTarjetaEnEdicion = id; // activa el "modo edición"
  }
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datosTarjeta = {
    alias: document.getElementById("alias").value,
    banco: document.getElementById("banco").value,
    cupo: Number(document.getElementById("cupo").value) || null
  };

  if (idTarjetaEnEdicion) {
    await actualizarTarjeta(idTarjetaEnEdicion, datosTarjeta);
    idTarjetaEnEdicion = null; // vuelve a modo "crear"
  } else {
    await crearTarjeta(datosTarjeta);
  }

  form.reset();
  mostrarTarjetas();
});

// Llenar el <select> de tarjetas al cargar
async function cargarSelectTarjetas() {
  const tarjetas = await obtenerTarjetas();
  selectTarjeta.innerHTML = `<option value="">Sin tarjeta</option>`;
  tarjetas.forEach((tarjeta) => {
    const option = document.createElement("option");
    option.value = tarjeta.id;
    option.textContent = tarjeta.alias;
    selectTarjeta.appendChild(option);
  });
}

document.getElementById("btn-agregar-item").addEventListener("click", () => {
  const nombre = document.getElementById("item-nombre").value;
  const precio = Number(document.getElementById("item-precio").value);

  if (!nombre || !precio) return; // evita agregar items vacíos

  itemsActuales.push({ nombre, precio });
  renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);

  document.getElementById("item-nombre").value = "";
  document.getElementById("item-precio").value = "";
});

async function mostrarMovimientos() {
  const movimientos = await obtenerMovimientos();
  renderMovimientos(movimientos, listaMovimientos);
}

formMovimiento.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const montoManual = Number(document.getElementById("monto-manual").value);
  const hayItemsDelCarrito  = itemsActuales.length > 0;

   const itemsFinal = hayItemsDelCarrito
    ? itemsActuales
    : [{ nombre: document.getElementById("categoria").value, precio: montoManual }];

  const datosMovimiento = {
    tipo: document.getElementById("tipo").value,
    categoria: document.getElementById("categoria").value,
    fecha: document.getElementById("fecha").value,
    descripcion: document.getElementById("descripcion").value,
    tarjetaId: selectTarjeta.value || null,
    items: itemsFinal,
    monto: itemsFinal.reduce((suma, item) => suma + item.precio, 0)
  };

  if (idMovimientoEnEdicion) {
    await actualizarMovimiento(idMovimientoEnEdicion, datosMovimiento);
    idMovimientoEnEdicion = null;
  } else {
    await crearMovimiento(datosMovimiento);
  }

  formMovimiento.reset();
  itemsActuales = [];
  renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);
  mostrarMovimientos();
});

async function mostrarResumenMes() {
  if (!selectorMes.value) return; // aún no ha elegido mes

  const movimientos = await obtenerMovimientosDelMes(selectorMes.value);
  renderMovimientos(movimientos, listaMes);

  const { ingresos, egresos, balance } = calcularTotalesDelMes(movimientos);
  totalIngresos.textContent = ingresos;
  totalEgresos.textContent = egresos;
  balanceMes.textContent = balance;
}

selectorMes.addEventListener("change", mostrarResumenMes);

async function cargarSelectTarjetaDeuda() {
  const tarjetas = await obtenerTarjetas(); // ya lo tienes importado de antes
  selectTarjetaDeuda.innerHTML = `<option value="">Sin tarjeta</option>`;
  tarjetas.forEach((tarjeta) => {
    const option = document.createElement("option");
    option.value = tarjeta.id;
    option.textContent = tarjeta.alias;
    selectTarjetaDeuda.appendChild(option);
  });
}

async function mostrarDeudas() {
  const deudas = await obtenerDeudas();
  renderDeudas(deudas, listaDeudas);
}

formDeuda.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nuevaDeuda = crearObjetoDeuda({
    descripcion: document.getElementById("deuda-descripcion").value,
    tipo: document.getElementById("deuda-tipo").value,
    acreedor: document.getElementById("deuda-acreedor").value,
    tarjetaId: selectTarjetaDeuda.value,
    montoTotal: Number(document.getElementById("deuda-monto-total").value),
    numeroCuotas: Number(document.getElementById("deuda-numero-cuotas").value),
    tasaInteres: Number(document.getElementById("deuda-tasa-interes").value) || null,
    fechaInicio: document.getElementById("deuda-fecha-inicio").value,
    diaPago: Number(document.getElementById("deuda-dia-pago").value) || null
  });

  await crearDeuda(nuevaDeuda);
  formDeuda.reset();
  mostrarDeudas();
});

// Quitar un item del carrito antes de guardar
listaItemsTemp.addEventListener("click", (evento) => {
  if (evento.target.dataset.indice !== undefined) {
    const indice = Number(evento.target.dataset.indice);
    itemsActuales.splice(indice, 1); // elimina ese item del arreglo
    renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);
  }
});

// Editar o borrar un movimiento ya guardado
listaMovimientos.addEventListener("click", async (evento) => {
  const boton = evento.target;
  const id = boton.dataset.id;

  if (boton.dataset.accion === "borrar") {
    await borrarMovimiento(id);
    mostrarMovimientos();
  }

  if (boton.dataset.accion === "editar") {
    const movimientos = await obtenerMovimientos();
    const mov = movimientos.find((m) => m.id === id);

    document.getElementById("tipo").value = mov.tipo;
    document.getElementById("categoria").value = mov.categoria;
    document.getElementById("fecha").value = mov.fecha;
    document.getElementById("descripcion").value = mov.descripcion ?? "";
    selectTarjeta.value = mov.tarjetaId ?? "";
    document.getElementById("monto-manual").value = mov.items.length ? "" : mov.monto;

    itemsActuales = [...mov.items]; // copia los items al carrito
    renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);

    idMovimientoEnEdicion = id;
  }
});

listaDeudas.addEventListener("click", async (evento) => {
  const boton = evento.target;

  if (boton.dataset.accion === "pagar-cuota") {
    const id = boton.dataset.id;
    const deudas = await obtenerDeudas();
    const deuda = deudas.find((d) => d.id === id);

    // 1. Registrar el egreso como un Movimiento normal
    await crearMovimiento({
      tipo: "egreso",
      categoria: "pago de deuda",
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: `Cuota ${deuda.cuotasPagadas + 1}/${deuda.numeroCuotas} - ${deuda.descripcion}`,
      tarjetaId: deuda.tarjetaId,
      items: [{ nombre: deuda.descripcion, precio: deuda.valorCuota }],
      monto: deuda.valorCuota  // <-- agregado
    });

    // 2. Actualizar el progreso de la deuda
    await registrarPagoCuota(id, deuda.cuotasPagadas);

    mostrarDeudas();
    mostrarMovimientos();
  }
});

async function mostrarTraslados() {
  const traslados = await obtenerTraslados();
  renderTraslados(traslados, listaTraslados);
}

formTraslado.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nuevoTraslado = crearObjetoTraslado({
    cuentaOrigen : document.getElementById("cuenta-origen").value,
    cuentaDestino : document.getElementById("cuenta-destino").value,
    monto : Number(document.getElementById("monto-traslado").value),
    fecha : document.getElementById("fecha-traslado").value,
    nota : document.getElementById("nota-traslado").value
  });

  await crearTraslado(nuevoTraslado);
  formTraslado.reset();
  mostrarTraslados();
})

btnLogin.addEventListener("click", async () =>{
  await signInWithPopup(auth, proveedorGoogle);
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});


onAuthStateChanged(auth, (usuario) =>{
  if(usuario){
    usuarioActual.textContent = `Sesión iniciada como: ${usuario.email}`;
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline";

    mostrarTraslados();
    cargarSelectTarjetas();
    mostrarMovimientos();
    mostrarTarjetas();
    cargarSelectTarjetaDeuda();
    mostrarDeudas();
    cargarSelectsTraslado();
  } else {
    usuarioActual.textContent = "No has iniciado sesión";
    btnLogin.style.display = "inline";
    btnLogout.style.display = "none";
  }
});

async function cargarSelectsTraslado() {
  const tarjetas = await obtenerTarjetas();
  const opciones = tarjetas.map((t) => `<option value="${t.alias}">${t.alias}</option>`).join("");

  document.getElementById("cuenta-origen").innerHTML = opciones;
  document.getElementById("cuenta-destino").innerHTML = opciones;
}

