import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { SearchInput } from "@/components/SearchInput";
import { RestaurantCard } from "@/components/RestaurantCard";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Utensils } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Restaurant, Review, User } from "@shared/schema";
import { useLocation } from "wouter";

export const Dashboard = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { setShowCreateReviewModal, setShowRestaurantModal } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
    enabled: !!user,
  });

  const { data: searchResults = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/search", searchQuery],
    enabled: !!user && searchQuery.length > 0,
  });

  const { data: recentReviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews", { recent: true }],
    enabled: !!user,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  const handleRestaurantSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRestaurantSelect = (result: any) => {
    setLocation(`/restaurant/${result.id}`);
  };

  const searchResultsFormatted = searchResults.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    subtitle: (restaurant.address as any).fullAddress,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Search */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Encontre o restaurante perfeito
            </h2>
            <p className="text-orange-100 mb-6">
              Descubra avaliações reais de outros usuários
            </p>
            
            <SearchInput
              placeholder="Pesquisar restaurantes..."
              onSearch={handleRestaurantSearch}
              results={searchResultsFormatted}
              onSelect={handleRestaurantSelect}
              className="max-w-lg mx-auto"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent 
              className="p-6"
              onClick={() => setShowCreateReviewModal(true)}
            >
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg mr-4">
                  <Plus className="text-orange-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Nova Avaliação
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Compartilhe sua experiência em um restaurante
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent 
              className="p-6"
              onClick={() => setShowRestaurantModal(true)}
            >
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                  <Utensils className="text-gray-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Cadastrar Restaurante
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Adicione um novo restaurante à plataforma
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Avaliações Recentes
              </h3>
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                Ver todas
              </Button>
            </div>
            
            <div className="space-y-6">
              {recentReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma avaliação encontrada</p>
                  <p className="text-sm">Seja o primeiro a avaliar um restaurante!</p>
                </div>
              ) : (
                recentReviews.map((review) => {
                  const reviewUser = users.find(u => u.id === review.userId);
                  const restaurant = restaurants.find(r => r.id === review.restaurantId);
                  
                  if (!reviewUser || !restaurant) return null;
                  
                  return (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      user={reviewUser}
                      restaurant={restaurant}
                      showRestaurantName={true}
                    />
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
