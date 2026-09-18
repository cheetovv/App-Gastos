import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXIkR5dTNsPvMFORr0o2oR0IwazxZJdjE",
  authDomain: "gastos-app-cca7f.firebaseapp.com",
  projectId: "gastos-app-cca7f",
  storageBucket: "gastos-app-cca7f.firebasestorage.app",
  messagingSenderId: "1097533511988",
  appId: "1:1097533511988:web:9af4a86d76210b2f15ad61"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const proveedorGoogle = new GoogleAuthProvider();