import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, handleRedirectResult } from "@/lib/firebase";
import { isFallbackMode } from "@/lib/auth-fallback";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFallbackMode()) {
      console.log("Running in fallback authentication mode - ready for testing");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log("Firebase user authenticated:", firebaseUser.uid, firebaseUser.email);
          
          // Try to get existing user
          const response = await fetch(`/api/users/firebase/${firebaseUser.uid}`);
          
          if (response.ok) {
            const userData = await response.json();
            console.log("Existing user found:", userData);
            setUser(userData);
          } else if (response.status === 404) {
            // Create new user
            const newUser = {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email!,
              photoURL: firebaseUser.photoURL,
            };
            
            console.log("Creating new user:", newUser);
            const createResponse = await apiRequest("POST", "/api/users", newUser);
            if (createResponse.ok) {
              const userData = await createResponse.json();
              console.log("New user created:", userData);
              setUser(userData);
            } else {
              console.error("Failed to create user:", await createResponse.text());
            }
          } else {
            console.error("Unexpected response status:", response.status, await response.text());
          }
        } catch (error) {
          console.error("Error creating/fetching user:", error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result on app load
    handleRedirectResult().catch(console.error);

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
