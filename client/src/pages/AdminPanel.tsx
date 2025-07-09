import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Category, Restaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pendingCategories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories", { status: "pending" }],
    enabled: !!user,
  });

  const { data: pendingRestaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", { validated: false }],
    enabled: !!user,
  });

  const approveCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => 
      apiRequest("PATCH", `/api/categories/${categoryId}/status`, { status: "approved" }),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Categoria aprovada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao aprovar categoria",
        variant: "destructive",
      });
    }
  });

  const rejectCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => 
      apiRequest("PATCH", `/api/categories/${categoryId}/status`, { status: "rejected" }),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Categoria rejeitada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao rejeitar categoria",
        variant: "destructive",
      });
    }
  });

  const validateRestaurantMutation = useMutation({
    mutationFn: (restaurantId: number) => 
      apiRequest("PATCH", `/api/restaurants/${restaurantId}/validate`, {}),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Restaurante validado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao validar restaurante",
        variant: "destructive",
      });
    }
  });

  const handleApproveCategory = (categoryId: number) => {
    approveCategoryMutation.mutate(categoryId);
  };

  const handleRejectCategory = (categoryId: number) => {
    rejectCategoryMutation.mutate(categoryId);
  };

  const handleValidateRestaurant = (restaurantId: number) => {
    validateRestaurantMutation.mutate(restaurantId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-orange-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Gerencie categorias e restaurantes da plataforma
          </p>
        </div>

        {/* Pending Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Categorias Pendentes</span>
              <Badge variant="secondary">
                {pendingCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma categoria pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCategories.map((category) => (
                  <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">
                          Sugerida por: {category.createdBy === "admin" ? "Admin" : `Usuário ${category.createdBy}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApproveCategory(category.id)}
                          disabled={approveCategoryMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleRejectCategory(category.id)}
                          disabled={rejectCategoryMutation.isPending}
                          variant="destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Restaurantes Pendentes</span>
              <Badge variant="secondary">
                {pendingRestaurants.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRestaurants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum restaurante pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRestaurants.map((restaurant) => {
                  const address = restaurant.address as any;
                  return (
                    <div key={restaurant.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{restaurant.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {address.fullAddress}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cadastrado em: {new Date(restaurant.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleValidateRestaurant(restaurant.id)}
                          disabled={validateRestaurantMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Validar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
