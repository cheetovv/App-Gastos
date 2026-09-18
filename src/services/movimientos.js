import { db, auth } from "../firebase-config.js";
import { collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";


export async function crearMovimiento(movimiento) {
  const uid = auth.currentUser.uid;
  const coleccionMovimientos = collection(db, "usuarios", uid, "movimientos");
  await addDoc(coleccionMovimientos, movimiento);
}

export async function obtenerMovimientos() {
  const uid = auth.currentUser.uid;
  const coleccionMovimientos = collection(db, "usuarios", uid, "movimientos");
  const consultaOrdenada = query(coleccionMovimientos, orderBy("fecha"));
  const snapshot = await getDocs(consultaOrdenada);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function obtenerMovimientosDelMes(anioMes) {
  const uid = auth.currentUser.uid;
  const coleccionMovimientos = collection(db, "usuarios", uid, "movimientos");
  const consulta = query(
    coleccionMovimientos,
    where("fecha", ">=", `${anioMes}-01`),
    where("fecha", "<=", `${anioMes}-31`),
    orderBy("fecha")
  );
  const snapshot = await getDocs(consulta);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function actualizarMovimiento(id, datos) {
  const uid = auth.currentUser.uid;
  const referencia = doc(db, "usuarios", uid, "movimientos", id);
  await updateDoc(referencia, datos);
}

export async function borrarMovimiento(id) {
  const uid = auth.currentUser.uid;
  const referencia = doc(db, "usuarios", uid, "movimientos", id);
  await deleteDoc(referencia);
}