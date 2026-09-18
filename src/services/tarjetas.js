// src/services/tarjetas.js
import { db, auth } from "../firebase-config.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";



export async function crearTarjeta(tarjeta) {
  const uid = auth.currentUser.uid;
  const coleccionTarjetas = collection(db, "usuarios", uid, "tarjetas");
  await addDoc(coleccionTarjetas, tarjeta);
}

export async function obtenerTarjetas() {
  const uid = auth.currentUser.uid;
  const coleccionTarjetas = collection(db, "usuarios", uid, "tarjetas");
  const snapshot = await getDocs(coleccionTarjetas);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function actualizarTarjeta(id, datos) {
  const uid = auth.currentUser.uid;
  const referencia = doc(db, "usuarios", uid, "tarjetas", id);
  await updateDoc(referencia, datos);
}

export async function borrarTarjeta(id) {
  const uid = auth.currentUser.uid;
  const referencia = doc(db, "usuarios", uid, "tarjetas", id);
  await deleteDoc(referencia);
}