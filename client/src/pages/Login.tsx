import { useState, useEffect } from 'react'; // Adicionado useEffect
import { useLocation } from 'wouter';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext'; // Importado useAuth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Loader2 } from 'lucide-react';

export const Login = () => {
  const { user, loading: authLoading } = useAuth(); // Usamos o estado do nosso contexto
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading local para botões

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // CORREÇÃO: Efeito que observa o estado de autenticação para redirecionar
  useEffect(() => {
    // Se a autenticação não estiver mais carregando e o usuário existir,
    // significa que o login foi completo.
    if (!authLoading && user) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  const handleAction = async (action: () => Promise<any>) => {
    setIsSubmitting(true);
    try {
      await action();
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      let message = "Ocorreu um erro. Tente novamente.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = "E-mail ou senha inválidos.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        message = "A senha deve ter no mínimo 6 caracteres.";
      }
      toast({ title: 'Erro de Autenticação', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(() => signInWithEmailAndPassword(auth, loginEmail, loginPassword));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(async () => {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      await updateProfile(userCredential.user, { displayName: registerName });
    });
  };

  const handleGoogleSignIn = () => {
    handleAction(() => signInWithPopup(auth, googleProvider));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-600">OpinaLocal</CardTitle>
          <CardDescription>Acesse sua conta ou cadastre-se</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" disabled={isSubmitting}>Entrar</TabsTrigger>
              <TabsTrigger value="register" disabled={isSubmitting}>Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={isSubmitting} />
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input id="register-name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input id="register-email" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-password">Senha (mínimo 6 caracteres)</Label>
                  <Input id="register-password" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required disabled={isSubmitting} />
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Ou</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};