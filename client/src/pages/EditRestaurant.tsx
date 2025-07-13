// Novo arquivo: client/src/pages/EditRestaurant.tsx

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Restaurant } from "@shared/schema";
import { Loader2, ArrowLeft, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

export const EditRestaurant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/restaurante/:id/editar");
  const [, setLocation] = useLocation();
  const restaurantId = params?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do formulário
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<any>(null);

  // Hook para o autocomplete de endereço
  const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: "br" } },
    debounce: 300,
  });

  // Busca os dados atuais do restaurante
  const { data: restaurant, isLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  // Efeito para preencher o formulário quando os dados do restaurante são carregados
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setPhotoUrl(restaurant.photoUrl || null);
      setValue((restaurant.address as any).fullAddress, false);
      setAddress(restaurant.address);
    }
  }, [restaurant, setValue]);


  // Mutação para salvar as alterações
  const updateRestaurantMutation = useMutation({
    mutationFn: (updatedData: any) =>
      apiRequest("PATCH", `/api/restaurants/${restaurantId}`, updatedData).then(res => res.json()),
    onSuccess: (updatedData) => {
      toast({ title: "Sucesso!", description: "Restaurante atualizado." });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      setLocation(`/restaurant/${restaurantId}`);
    },
    onError: () => toast({ title: "Erro", description: "Falha ao atualizar o restaurante.", variant: "destructive" }),
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectAddress = async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    const results = await getGeocode({ address: description });
    // ... (lógica para extrair detalhes do endereço como no RestaurantRegistrationModal) ...
    const newAddress = { /* ... extrair dados ... */ fullAddress: description };
    setAddress(newAddress);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurantMutation.mutate({ name, address, photoUrl });
  };

  if (isLoading) return <div className="p-8 text-center">Carregando...</div>;
  if (!restaurant) return <div className="p-8 text-center">Restaurante não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/restaurant/${restaurantId}`}>
          <a className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o perfil do restaurante
          </a>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Editar Restaurante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="photo">Foto do Restaurante</Label>
                <div className="mt-2">
                  <div className="w-48 h-32 bg-gray-100 rounded-lg relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={photoPreview || photoUrl || undefined} alt="Pré-visualização" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-lg transition-opacity">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nome do Restaurante</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" value={value} onChange={(e) => setValue(e.target.value)} disabled={!ready} required />
                {/* Aqui você adicionaria a lista de sugestões do Google */}
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={updateRestaurantMutation.isPending}>
                  {updateRestaurantMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};