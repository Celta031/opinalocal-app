// Arquivo: client/src/pages/Dashboard.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { SearchInput } from "@/components/SearchInput";
import { RestaurantCard } from "@/components/RestaurantCard";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Utensils, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Restaurant, Review, User } from "@shared/schema";

type ReviewWithDetails = Review & { user: User; restaurant: Restaurant };

export const Dashboard = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { setShowCreateReviewModal, setShowRestaurantModal } = useApp();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/search", { q: submittedQuery, validated: true }],
    enabled: !!submittedQuery,
  });

  const { data: recentReviews = [] } = useQuery<ReviewWithDetails[]>({
    queryKey: ["/api/reviews", { recent: true }],
    enabled: !submittedQuery,
  });

  const handleSearchSubmit = (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      setSubmittedQuery(trimmedQuery);
      setSearchQuery(trimmedQuery);
    }
  };
  
  const handleRestaurantClick = (restaurantId: number) => {
    setLocation(`/restaurant/${restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Encontre o restaurante perfeito</h2>
            <p className="text-orange-100 mb-6">Descubra avaliações reais de outros usuários</p>
            <SearchInput
              placeholder="Pesquisar restaurantes..."
              value={searchQuery}
              onChange={setSearchQuery}
              results={[]}
              onSelect={(result) => handleRestaurantClick(Number(result.id))}
              onSubmit={handleSearchSubmit}
              className="max-w-lg mx-auto text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateReviewModal(true)}>
            <CardContent className="p-6 flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4"><Plus className="text-orange-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Nova Avaliação</h3>
                <p className="text-gray-600 text-sm">Compartilhe sua experiência</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowRestaurantModal(true)}>
            <CardContent className="p-6 flex items-center">
              <div className="bg-gray-100 p-3 rounded-lg mr-4"><Utensils className="text-gray-600 w-6 h-6" /></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Cadastrar Restaurante</h3>
                <p className="text-gray-600 text-sm">Adicione um novo local</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          {submittedQuery ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultados para "{submittedQuery}"</h2>
              {isLoadingSearch ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((restaurant: any) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onClick={() => handleRestaurantClick(restaurant.id)}
                      averageRating={restaurant.averageRating}
                      reviewCount={restaurant.reviewCount}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhum restaurante encontrado.</p>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Avaliações Recentes</h3>
                  <Link href="/todas-avaliacoes">
                    <Button variant="ghost" className="text-orange-600 hover:text-orange-700">Ver todas</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      user={review.user}
                      restaurant={review.restaurant}
                      showRestaurantName={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};