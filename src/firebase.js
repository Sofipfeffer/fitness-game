import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA13XY0UbD0IFIzOCYbw2SRULdwbI4n_Ks",
  authDomain: "fitness-game-c2558.firebaseapp.com",
  projectId: "fitness-game-c2558",
  storageBucket: "fitness-game-c2558.firebasestorage.app",
  messagingSenderId: "628420642131",
  appId: "1:628420642131:web:9571c13096babb0abf0da6",
  measurementId: "G-D3TRCKCB51"
};

const app = initializeApp(firebaseConfig);

// 👇 ESTO ES LO IMPORTANTE
export const db = getFirestore(app);