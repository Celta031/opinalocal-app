import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { subscribeUserToPush } from '@/lib/push-notifications';
import { Loader2 } from "lucide-react";

interface AuthContextType {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // 1. Tenta buscar o usuário no banco de dados
          const response = await apiRequest("GET", `/api/users/firebase/${fbUser.uid}`);
          const userData = await response.json();
          setUser(userData);

        } catch (error: any) {
          // 2. Se a busca falhar, o código entra aqui.
          // CORREÇÃO: Verificamos se o erro é o 404 esperado.
          if (error.message && error.message.includes("404")) {
            console.log("Usuário não existe no DB. Criando novo usuário...");
            
            // 3. Se for 404, prosseguimos para a criação do usuário.
            try {
              const newUserPayload = {
                firebaseUid: fbUser.uid,
                email: fbUser.email!,
                name: fbUser.displayName || fbUser.email!.split('@')[0],
                photoURL: fbUser.photoURL,
              };
              const createResponse = await apiRequest("POST", "/api/users", newUserPayload);
              const createdUserData = await createResponse.json();
              setUser(createdUserData);
              subscribeUserToPush(createdUserData.id);
            } catch (creationError) {
              console.error("Falha ao criar o novo usuário no banco de dados:", creationError);
              setUser(null); // Garante que o estado não fique inconsistente
            }
          } else {
            // 4. Se o erro for diferente de 404, é um problema inesperado.
            console.error("Erro inesperado ao buscar usuário:", error);
            setUser(null);
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Ninguém logado no Firebase
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };
  
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
        <p className="mt-4 text-lg text-gray-600">Carregando aplicação...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};