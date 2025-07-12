// Arquivo: client/src/pages/SettingsPage.tsx

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

type NotificationPreferences = Pick<
  User,
  | "notifyOnComment"
  | "notifyOnNewReview"
  | "notifyOnCategoryApproval"
  | "notifyOnNewsletter"
>;

export const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    notifyOnComment: true,
    notifyOnNewReview: true,
    notifyOnCategoryApproval: true,
    notifyOnNewsletter: false,
  });

  // Sincroniza o estado local com os dados do usuário quando eles carregam
  useEffect(() => {
    if (user) {
      setPrefs({
        notifyOnComment: user.notifyOnComment,
        notifyOnNewReview: user.notifyOnNewReview,
        notifyOnCategoryApproval: user.notifyOnCategoryApproval,
        notifyOnNewsletter: user.notifyOnNewsletter,
      });
    }
  }, [user]);

  const updatePrefsMutation = useMutation({
    mutationFn: (newPrefs: Partial<NotificationPreferences>) =>
      apiRequest("PATCH", `/api/users/${user!.id}`, newPrefs).then(res => res.json()),
    onSuccess: (updatedUser) => {
      toast({ title: "Sucesso!", description: "Suas preferências foram salvas." });
      setUser(updatedUser); // Atualiza o usuário no contexto global
    },
    onError: () => toast({ title: "Erro", description: "Não foi possível salvar suas preferências.", variant: "destructive" }),
  });

  const handlePrefChange = (key: keyof NotificationPreferences) => {
    // Atualiza o estado visual imediatamente
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    // Envia apenas a preferência alterada para o back-end
    updatePrefsMutation.mutate({ [key]: newPrefs[key] });
  };
  
  // Funções de placeholder para funcionalidades futuras
  const handleChangePassword = () => {
    toast({ title: "Funcionalidade Futura", description: "A alteração de senha será implementada." });
  };
  
  const handleDeleteAccount = () => {
    toast({ title: "Funcionalidade Futura", description: "A exclusão de conta requer confirmação e será implementada." });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie suas preferências de conta e notificações.</p>
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Escolha como você quer ser notificado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="notif-comment">Comentários em minhas avaliações</Label>
                  <p className="text-sm text-gray-500">Se alguém interagir com sua avaliação.</p>
                </div>
                <Switch id="notif-comment" checked={prefs.notifyOnComment} onCheckedChange={() => handlePrefChange('notifyOnComment')} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="notif-new-review">Novas avaliações em locais que avaliei</Label>
                   <p className="text-sm text-gray-500">Fique por dentro das novidades de locais que você conhece.</p>
                </div>
                <Switch id="notif-new-review" checked={prefs.notifyOnNewReview} onCheckedChange={() => handlePrefChange('notifyOnNewReview')} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="notif-category">Minhas categorias sugeridas</Label>
                  <p className="text-sm text-gray-500">Quando suas sugestões forem aprovadas.</p>
                </div>
                <Switch id="notif-category" checked={prefs.notifyOnCategoryApproval} onCheckedChange={() => handlePrefChange('notifyOnCategoryApproval')} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="notif-newsletter">Newsletter OpinaLocal</Label>
                  <p className="text-sm text-gray-500">Receba novidades e destaques da plataforma.</p>
                </div>
                <Switch id="notif-newsletter" checked={prefs.notifyOnNewsletter} onCheckedChange={() => handlePrefChange('notifyOnNewsletter')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={handleChangePassword}>Alterar Senha</Button>
              <p className="text-sm text-gray-500">As opções de alteração de e-mail e senha são gerenciadas pelo seu provedor de login.</p>
            </CardContent>
          </Card>
          
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center"><AlertTriangle className="mr-2"/> Área de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">A exclusão da sua conta é permanente e não pode ser desfeita.</p>
              <Button variant="destructive" onClick={handleDeleteAccount}><Trash2 className="mr-2"/>Deletar Minha Conta</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};