// Arquivo: client/src/pages/UserProfile.tsx

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Camera } from "lucide-react";
import type { Review, Restaurant, User, InsertUser } from "@shared/schema";

type ReviewWithDetails = Review & { restaurant: Restaurant };

export const UserProfile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [newPhoto, setNewPhoto] = useState<string | null>(null); // Estado para a nova foto
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setNewPhoto(null); // Reseta a pré-visualização ao carregar
    }
  }, [user]);

  const { data: userReviews = [], isLoading } = useQuery<ReviewWithDetails[]>({
    queryKey: ["/api/reviews", { userId: user?.id }],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedData: Partial<InsertUser>) => 
      apiRequest("PATCH", `/api/users/${user!.id}`, updatedData).then(res => res.json()),
    onSuccess: (updatedUser) => {
      toast({ title: "Sucesso", description: "Seu perfil foi atualizado." });
      setUser(updatedUser);
      setNewPhoto(null); // Limpa a pré-visualização após salvar
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao atualizar o perfil.", variant: "destructive" }),
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); // Abre o seletor de arquivos
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string); // Salva a imagem como Data URL para pré-visualização
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedData: Partial<InsertUser> = {};
    const nameChanged = name.trim() !== user.name;
    const photoChanged = newPhoto !== null;

    if (nameChanged) {
      updatedData.name = name.trim();
    }
    if (photoChanged) {
      updatedData.photoURL = newPhoto;
    }

    if (nameChanged || photoChanged) {
      updateProfileMutation.mutate(updatedData);
    } else {
      toast({ title: "Nenhuma alteração", description: "Você não modificou seu nome ou foto." });
    }
  };

  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 text-4xl cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={newPhoto || user.photoURL || undefined} />
                        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full transition-opacity duration-200" onClick={handleAvatarClick}>
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg"
                      />
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Avaliações ({userReviews.length})</h2>
            <div className="space-y-6">
              {isLoading ? (
                <p>Carregando avaliações...</p>
              ) : userReviews.length > 0 ? (
                userReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    user={user}
                    restaurant={review.restaurant}
                    showRestaurantName={true}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Você ainda não fez nenhuma avaliação.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};