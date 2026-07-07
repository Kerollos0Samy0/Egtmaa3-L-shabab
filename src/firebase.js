import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAnDb4wmEN_9bVPS6SFfNeg36n631tnwFg",
  authDomain: "egtma3-l-shabab.firebaseapp.com",
  projectId: "egtma3-l-shabab",
  storageBucket: "egtma3-l-shabab.firebasestorage.app",
  messagingSenderId: "739555351342",
  appId: "1:739555351342:web:45200268d1d676d59e38bf",
  databaseURL: "https://egtma3-l-shabab-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
