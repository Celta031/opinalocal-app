// Importe os serviços do Firebase que você precisará
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// A configuração do seu projeto Firebase virá do seu console do Firebase.
// É uma boa prática usar variáveis de ambiente para manter suas chaves seguras.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Exporte as instâncias de autenticação e provedores que você usará na aplicação
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;