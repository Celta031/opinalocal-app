import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { createFallbackUser, isFallbackMode } from "./auth-fallback";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Debug: Check if Firebase config is loaded
console.log("Firebase config loaded:", {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  if (isFallbackMode()) {
    console.warn("Using fallback authentication for Google sign-in");
    // Simulate Google sign-in with fallback user
    const fallbackUser = createFallbackUser("user@gmail.com", "password");
    return Promise.resolve({
      user: fallbackUser,
      credential: null,
      operationType: "signIn",
      providerId: "google.com"
    });
  }
  return signInWithRedirect(auth, provider);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      return { user: result.user, token };
    }
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

export const signInWithEmail = (email: string, password: string) => {
  if (isFallbackMode()) {
    console.warn("Using fallback authentication for email sign-in");
    // Simulate email sign-in with fallback user
    const fallbackUser = createFallbackUser(email, password);
    return Promise.resolve({
      user: fallbackUser,
      credential: null,
      operationType: "signIn",
      providerId: "password"
    });
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email: string, password: string) => {
  if (isFallbackMode()) {
    console.warn("Using fallback authentication for email sign-up");
    // Simulate email sign-up with fallback user
    const fallbackUser = createFallbackUser(email, password);
    return Promise.resolve({
      user: fallbackUser,
      credential: null,
      operationType: "signIn",
      providerId: "password"
    });
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return signOut(auth);
};
