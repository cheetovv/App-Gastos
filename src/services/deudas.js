import { db, auth } from "../firebase-config.js";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

export async function crearDeuda(deuda) {
  const uid = auth.currentUser.uid;
  const coleccionDeudas = collection (db, "usuarios", uid, "deudas");
  await addDoc(coleccionDeudas, deuda)
}

export async function obtenerDeudas() {
  const uid = auth.currentUser.uid;
  const coleccionDeudas = collection (db, "usuarios", uid, "deudas");
  const snapshot = await getDocs(coleccionDeudas);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function registrarPagoCuota(deudaId, cuotasPagadasActuales) {
  const uid = auth.currentUser.uid;
  const referenciaDeuda = doc(db, "usuarios", uid, "deudas", deudaId);
  await updateDoc(referenciaDeuda, {
    cuotasPagadas: cuotasPagadasActuales + 1
  });
}