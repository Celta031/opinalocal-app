// Novo arquivo: client/src/pages/MyRestaurants.tsx

import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { Loader2, PlusCircle } from "lucide-react";

export const MyRestaurants = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Busca os restaurantes do usuário logado na nova rota da API
  const { data: ownedRestaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/my-restaurants"],
    enabled: !!user,
  });

  if (!user) {
    // Redireciona para o login se o usuário tentar acessar sem estar logado
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meus Restaurantes</h1>
          <Link href="/restaurante/novo">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Cadastrar Novo
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : ownedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedRestaurants.map((restaurant: any) => (
              <div key={restaurant.id} className="relative group">
                <RestaurantCard
                  restaurant={restaurant}
                  onClick={() => setLocation(`/restaurant/${restaurant.id}`)}
                  averageRating={restaurant.averageRating}
                  reviewCount={restaurant.reviewCount}
                />
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que o clique no card seja acionado
                    setLocation(`/restaurante/${restaurant.id}/editar`);
                  }}
                >
                  Editar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            <p>Você ainda não possui nenhum restaurante vinculado à sua conta.</p>
            <p className="text-sm mt-2">Cadastre um novo restaurante para começar a gerenciá-lo.</p>
          </div>
        )}
      </main>
    </div>
  );
};