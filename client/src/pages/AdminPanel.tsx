// Novo conteúdo para client/src/pages/AdminPanel.tsx

import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Shield, Tag, Building, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Category, Restaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Busca categorias com status 'pending'
  const { data: pendingCategories = [], isLoading: loadingCategories } = useQuery<Category[]>({
  queryKey: ["/api/categories", { status: "pending" }],
  enabled: !!user?.role,
  staleTime: 0, 
});

  // Busca restaurantes com is_validated 'false'
  const { data: pendingRestaurants = [], isLoading: loadingRestaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", { validated: "false" }],
    enabled: !!user?.role,
  });

  const approveCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => 
      apiRequest("PATCH", `/api/categories/${categoryId}/status`, { status: "approved" }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Categoria aprovada!" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao aprovar categoria", variant: "destructive" }),
  });

  const rejectCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => 
      apiRequest("PATCH", `/api/categories/${categoryId}/status`, { status: "rejected" }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Categoria rejeitada." });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao rejeitar categoria", variant: "destructive" }),
  });

  const validateRestaurantMutation = useMutation({
    mutationFn: (restaurantId: number) => 
      apiRequest("PATCH", `/api/restaurants/${restaurantId}/validate`, {}),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Restaurante validado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao validar restaurante", variant: "destructive" }),
  });

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
            <p className="text-gray-600 mt-1">Gerencie categorias e restaurantes da plataforma</p>
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="categories">
              <Tag className="w-4 h-4 mr-2" />
              Categorias Pendentes <Badge variant="secondary" className="ml-2">{pendingCategories.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="restaurants">
              <Building className="w-4 h-4 mr-2" />
              Restaurantes Não Validados <Badge variant="secondary" className="ml-2">{pendingRestaurants.length}</Badge>
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
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveCategoryMutation.mutate(category.id)}>
                            <Check className="w-4 h-4 mr-1" /> Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectCategoryMutation.mutate(category.id)}>
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
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => validateRestaurantMutation.mutate(restaurant.id)}>
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
        </Tabs>
      </main>
    </div>
  );
};