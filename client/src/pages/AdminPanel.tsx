import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Shield, Tag, Building, Loader2, LinkIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Category, Restaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SearchInput } from "@/components/SearchInput"; 

export const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [ownerEmail, setOwnerEmail] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const { data: pendingCategories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories", { status: "pending" }],
    enabled: !!user?.role,
  });

  const { data: pendingRestaurants = [], isLoading: loadingRestaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", { validated: "false" }],
    enabled: !!user?.role,
  });

  const { data: restaurantResults = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/search", { q: restaurantSearch, validated: true }],
    enabled: restaurantSearch.length > 0,
  });

  const updateCategoryStatusMutation = useMutation({
    mutationFn: ({ categoryId, status }: { categoryId: number; status: 'approved' | 'rejected' }) =>
      apiRequest("PATCH", `/api/categories/${categoryId}/status`, { status }),
    onSuccess: (_, variables) => {
      toast({ title: "Sucesso", description: `Categoria ${variables.status === 'approved' ? 'aprovada' : 'rejeitada'}.` });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error: any) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const validateRestaurantMutation = useMutation({
    mutationFn: (restaurantId: number) => apiRequest("PATCH", `/api/restaurants/${restaurantId}/validate`, {}),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Restaurante validado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
    onError: (error: any) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const linkOwnerMutation = useMutation({
    mutationFn: (data: { userEmail: string; restaurantId: number }) =>
      apiRequest("POST", "/api/admin/link-owner", data),
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Proprietário vinculado com sucesso." });
      setOwnerEmail("");
      setRestaurantSearch("");
      setSelectedRestaurant(null);
    },
    onError: (error: any) => toast({ title: "Erro", description: error.message || "Falha ao vincular proprietário.", variant: "destructive" }),
  });

  const handleLinkOwner = () => {
    if (ownerEmail && selectedRestaurant) {
      linkOwnerMutation.mutate({ userEmail: ownerEmail.trim(), restaurantId: selectedRestaurant.id });
    }
  };
  
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Acesso negado. Você não tem permissão para ver esta página.</p>
      </div>
    );
  }

  const isLoading = loadingCategories || loadingRestaurants;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Shield className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">Gerencie categorias, restaurantes e proprietários.</p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="categories">
              <Tag className="w-4 h-4 mr-2" />
              Categorias <Badge variant="secondary" className="ml-2">{pendingCategories.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="restaurants">
              <Building className="w-4 h-4 mr-2" />
              Restaurantes <Badge variant="secondary" className="ml-2">{pendingRestaurants.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="link-owner">
              <LinkIcon className="w-4 h-4 mr-2" />
              Vincular Dono
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader><CardTitle>Categorias Aguardando Aprovação</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="animate-spin" /> : pendingCategories.length > 0 ? (
                  <div className="space-y-4">
                    {pendingCategories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <p className="font-medium">{category.name}</p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateCategoryStatusMutation.mutate({ categoryId: category.id, status: 'approved' })} disabled={updateCategoryStatusMutation.isPending}>
                            <Check className="w-4 h-4 mr-1" /> Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateCategoryStatusMutation.mutate({ categoryId: category.id, status: 'rejected' })} disabled={updateCategoryStatusMutation.isPending}>
                            <X className="w-4 h-4 mr-1" /> Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Não há categorias pendentes.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants">
            <Card>
              <CardHeader><CardTitle>Restaurantes Aguardando Validação</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <Loader2 className="animate-spin" /> : pendingRestaurants.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div>
                          <h3 className="font-medium">{(restaurant as any).name}</h3>
                          <p className="text-sm text-gray-500">{(restaurant.address as any).fullAddress}</p>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => validateRestaurantMutation.mutate(restaurant.id)} disabled={validateRestaurantMutation.isPending}>
                          <Check className="w-4 h-4 mr-1" /> Validar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Não há restaurantes aguardando validação.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="link-owner">
            <Card>
              <CardHeader><CardTitle>Vincular Proprietário a Restaurante</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-email">E-mail do Proprietário</Label>
                  <Input id="owner-email" placeholder="email@exemplo.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-search">Restaurante</Label>
                  <SearchInput
                    placeholder="Pesquisar restaurante para vincular..."
                    value={restaurantSearch}
                    onChange={setRestaurantSearch}
                    results={restaurantResults.map(r => ({ id: r.id, name: r.name, subtitle: (r.address as any)?.fullAddress }))}
                    onSelect={(result) => {
                      const restaurant = restaurantResults.find(r => r.id === result.id);
                      if(restaurant) {
                        setSelectedRestaurant(restaurant);
                        setRestaurantSearch(restaurant.name);
                      }
                    }}
                  />
                </div>
                {selectedRestaurant && <p className="text-sm text-green-700 bg-green-50 p-2 rounded-md">Restaurante selecionado: <strong>{selectedRestaurant.name}</strong></p>}
                <Button onClick={handleLinkOwner} disabled={!ownerEmail || !selectedRestaurant || linkOwnerMutation.isPending}>
                  {linkOwnerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                  Vincular Proprietário
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};