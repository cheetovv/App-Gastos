// src/main.js

// ── IMPORTS ──────────────────────────────────────────────
import { crearTarjeta, obtenerTarjetas, actualizarTarjeta, borrarTarjeta } from "./services/tarjetas.js";
import { crearMovimiento, obtenerMovimientos, obtenerMovimientosDelMes, actualizarMovimiento, borrarMovimiento } from "./services/movimientos.js";
import { crearDeuda, obtenerDeudas, registrarPagoCuota } from "./services/deudas.js";
import { obtenerTraslados, crearTraslado } from "./services/traslados.js";
import { crearObjetoDeuda } from "./models/deuda.js";
import { crearObjetoTraslado } from "./models/traslado.js";
import { renderTarjetas, renderMovimientos, renderItemsTemporal, renderDeudas, renderTraslados } from "./ui/render.js";
import { calcularTotalesDelMes } from "./utils/calculos.js";
import { auth, proveedorGoogle } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// ── ESTADO EN MEMORIA ────────────────────────────────────
let itemsActuales = [];
let idTarjetaEnEdicion = null;
let idMovimientoEnEdicion = null;

// ── REFERENCIAS AL DOM ───────────────────────────────────
// Tarjetas
const form = document.getElementById("form-tarjeta");
const listaTarjetas = document.getElementById("lista-tarjetas");

// Movimientos
const formMovimiento = document.getElementById("form-movimiento");
const listaMovimientos = document.getElementById("lista-movimientos");
const listaItemsTemp = document.getElementById("lista-items-temporal");
const totalTemp = document.getElementById("total-temporal");
const selectTarjeta = document.getElementById("tarjeta");

// Resumen mensual
const selectorMes = document.getElementById("selector-mes");
const listaMes = document.getElementById("lista-movimientos-mes");
const totalIngresos = document.getElementById("total-ingresos");
const totalEgresos = document.getElementById("total-egresos");
const balanceMes = document.getElementById("balance-mes");

// Deudas
const formDeuda = document.getElementById("form-deuda");
const listaDeudas = document.getElementById("lista-deudas");
const selectTarjetaDeuda = document.getElementById("deuda-tarjeta");

// Traslados
const formTraslado = document.getElementById("form-traslado");
const listaTraslados = document.getElementById("lista-traslados");

// Auth
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const usuarioActual = document.getElementById("usuario-actual");

// ── FUNCIONES: TARJETAS ──────────────────────────────────
async function mostrarTarjetas() {
  const tarjetas = await obtenerTarjetas();
  renderTarjetas(tarjetas, listaTarjetas);
}

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

// ── FUNCIONES: MOVIMIENTOS ───────────────────────────────
async function mostrarMovimientos() {
  const movimientos = await obtenerMovimientos();
  renderMovimientos(movimientos, listaMovimientos);
}

// ── FUNCIONES: RESUMEN MENSUAL ───────────────────────────
async function mostrarResumenMes() {
  if (!selectorMes.value) return;

  const movimientos = await obtenerMovimientosDelMes(selectorMes.value);
  renderMovimientos(movimientos, listaMes);

  const { ingresos, egresos, balance } = calcularTotalesDelMes(movimientos);
  totalIngresos.textContent = ingresos;
  totalEgresos.textContent = egresos;
  balanceMes.textContent = balance;
}

// ── FUNCIONES: DEUDAS ────────────────────────────────────
async function mostrarDeudas() {
  const deudas = await obtenerDeudas();
  renderDeudas(deudas, listaDeudas);
}

async function cargarSelectTarjetaDeuda() {
  const tarjetas = await obtenerTarjetas();
  selectTarjetaDeuda.innerHTML = `<option value="">Sin tarjeta</option>`;
  tarjetas.forEach((tarjeta) => {
    const option = document.createElement("option");
    option.value = tarjeta.id;
    option.textContent = tarjeta.alias;
    selectTarjetaDeuda.appendChild(option);
  });
}

// ── FUNCIONES: TRASLADOS ─────────────────────────────────
async function mostrarTraslados() {
  const traslados = await obtenerTraslados();
  renderTraslados(traslados, listaTraslados);
}

async function cargarSelectsTraslado() {
  const tarjetas = await obtenerTarjetas();
  const opciones = tarjetas.map((t) => `<option value="${t.alias}">${t.alias}</option>`).join("");
  document.getElementById("cuenta-origen").innerHTML = opciones;
  document.getElementById("cuenta-destino").innerHTML = opciones;
}

// ── LISTENERS: TARJETAS ──────────────────────────────────
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

    idTarjetaEnEdicion = id;
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
    idTarjetaEnEdicion = null;
  } else {
    await crearTarjeta(datosTarjeta);
  }

  form.reset();
  mostrarTarjetas();
});

// ── LISTENERS: MOVIMIENTOS ───────────────────────────────
document.getElementById("btn-agregar-item").addEventListener("click", () => {
  const nombre = document.getElementById("item-nombre").value;
  const precio = Number(document.getElementById("item-precio").value);

  if (!nombre || !precio) return;

  itemsActuales.push({ nombre, precio });
  renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);

  document.getElementById("item-nombre").value = "";
  document.getElementById("item-precio").value = "";
});

listaItemsTemp.addEventListener("click", (evento) => {
  if (evento.target.dataset.indice !== undefined) {
    const indice = Number(evento.target.dataset.indice);
    itemsActuales.splice(indice, 1);
    renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);
  }
});

formMovimiento.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const montoManual = Number(document.getElementById("monto-manual").value);
  const hayItemsDelCarrito = itemsActuales.length > 0;

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

    itemsActuales = [...mov.items];
    renderItemsTemporal(itemsActuales, listaItemsTemp, totalTemp);

    idMovimientoEnEdicion = id;
  }
});

// ── LISTENERS: RESUMEN MENSUAL ───────────────────────────
selectorMes.addEventListener("change", mostrarResumenMes);

// ── LISTENERS: DEUDAS ─────────────────────────────────────
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

listaDeudas.addEventListener("click", async (evento) => {
  const boton = evento.target;

  if (boton.dataset.accion === "pagar-cuota") {
    const id = boton.dataset.id;
    const deudas = await obtenerDeudas();
    const deuda = deudas.find((d) => d.id === id);

    await crearMovimiento({
      tipo: "egreso",
      categoria: "pago de deuda",
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: `Cuota ${deuda.cuotasPagadas + 1}/${deuda.numeroCuotas} - ${deuda.descripcion}`,
      tarjetaId: deuda.tarjetaId,
      items: [{ nombre: deuda.descripcion, precio: deuda.valorCuota }],
      monto: deuda.valorCuota
    });

    await registrarPagoCuota(id, deuda.cuotasPagadas);

    mostrarDeudas();
    mostrarMovimientos();
  }
});

// ── LISTENERS: TRASLADOS ─────────────────────────────────
formTraslado.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nuevoTraslado = crearObjetoTraslado({
    cuentaOrigen: document.getElementById("cuenta-origen").value,
    cuentaDestino: document.getElementById("cuenta-destino").value,
    monto: Number(document.getElementById("monto-traslado").value),
    fecha: document.getElementById("fecha-traslado").value,
    nota: document.getElementById("nota-traslado").value
  });

  await crearTraslado(nuevoTraslado);
  formTraslado.reset();
  mostrarTraslados();
});

// ── LISTENERS: AUTH ───────────────────────────────────────
btnLogin.addEventListener("click", async () => {
  await signInWithPopup(auth, proveedorGoogle);
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

// ── ARRANQUE ──────────────────────────────────────────────
onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    usuarioActual.textContent = `Sesión iniciada como: ${usuario.email}`;
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline";

    mostrarTarjetas();
    cargarSelectTarjetas();
    mostrarMovimientos();
    cargarSelectTarjetaDeuda();
    mostrarDeudas();
    mostrarTraslados();
    cargarSelectsTraslado();
  } else {
    usuarioActual.textContent = "No has iniciado sesión";
    btnLogin.style.display = "inline";
    btnLogout.style.display = "none";
  }
});