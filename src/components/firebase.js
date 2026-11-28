
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAK2hCsNi0zBTQ1vhiZBOnVfbl4iHupviI",
  authDomain: "re-plate-7d41b.firebaseapp.com",
  projectId: "re-plate-7d41b",
  storageBucket: "re-plate-7d41b.firebasestorage.app",
  messagingSenderId: "634334716080",
  appId: "1:634334716080:web:486bd004dea106aeb01b75"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
