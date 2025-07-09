import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, MapPin } from "lucide-react";
import { Restaurant, Review, User } from "@shared/schema";
import { useApp } from "@/context/AppContext";

export const RestaurantProfile = () => {
  const [, params] = useRoute("/restaurant/:id");
  const restaurantId = params?.id;
  const { setShowCreateReviewModal, setSelectedRestaurant } = useApp();

  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews", { restaurantId }],
    enabled: !!restaurantId,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!restaurantId,
  });

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">Restaurante não encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const address = restaurant.address as any;
  
  // Calculate average ratings
  const calculateAverageRating = (category: string) => {
    if (reviews.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    reviews.forEach(review => {
      const ratings = review.ratings as any;
      if (ratings.standard && ratings.standard[category]) {
        total += ratings.standard[category];
        count++;
      }
    });
    
    return count > 0 ? total / count : 0;
  };

  const overallRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.overallRating, 0) / reviews.length 
    : 0;

  const handleNewReview = () => {
    setSelectedRestaurant(restaurant);
    setShowCreateReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <Card className="overflow-hidden mb-6">
          <div className="relative h-64 bg-gradient-to-r from-gray-900 to-gray-700">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=400"
              alt="Restaurant Interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex items-center text-lg opacity-90 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{address.fullAddress}</span>
              </div>
              <div className="flex items-center">
                <StarRating rating={overallRating} readonly />
                <span className="text-lg font-medium ml-2">
                  {overallRating.toFixed(1)}
                </span>
                <span className="text-sm opacity-75 ml-2">
                  ({reviews.length} avaliações)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Avaliação por Categoria
              </h3>
              <Button onClick={handleNewReview} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Avaliar
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Comida", "Atendimento", "Ambiente", "Preço"].map((category) => {
                const rating = calculateAverageRating(category);
                return (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-lg font-semibold text-orange-600">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <StarRating rating={rating} readonly />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Avaliações ({reviews.length})
              </h3>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Mais recentes</option>
                <option>Melhor avaliadas</option>
                <option>Pior avaliadas</option>
              </select>
            </div>

            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma avaliação ainda</p>
                  <p className="text-sm">Seja o primeiro a avaliar este restaurante!</p>
                  <Button 
                    onClick={handleNewReview}
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Primeira Avaliação
                  </Button>
                </div>
              ) : (
                reviews.map((review) => {
                  const reviewUser = users.find(u => u.id === review.userId);
                  if (!reviewUser) return null;
                  
                  return (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      user={reviewUser}
                      restaurant={restaurant}
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
