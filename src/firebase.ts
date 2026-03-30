import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZ2sW5qKVZw7V7aqR12W4kxAyuYOXHJ6I",
  authDomain: "lugha47.firebaseapp.com",
  projectId: "lugha47",
  storageBucket: "lugha47.firebasestorage.app",
  messagingSenderId: "470488484415",
  appId: "1:470488484415:web:17841b6049973cfd89068a",
  measurementId: "G-VE1GLG2S2G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
