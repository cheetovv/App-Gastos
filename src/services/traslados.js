import { db, auth } from "../firebase-config.js";
import { collection, addDoc, getDocs} from "firebase/firestore";



export async function crearTraslado(traslado) {
  const uid = auth.currentUser.uid;
  const coleccionTraslados = collection(db, "usuarios", uid, "traslados");
  await addDoc(coleccionTraslados, traslado);
}

export async function obtenerTraslados() {
  const uid = auth.currentUser.uid;
  const coleccionTraslados = collection(db, "usuarios", uid, "traslados")
  const snapshot = await getDocs(coleccionTraslados);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}