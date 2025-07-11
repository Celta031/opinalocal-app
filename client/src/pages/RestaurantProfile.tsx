import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, ArrowLeft } from "lucide-react";
import { Restaurant, Review, User } from "@shared/schema";
import { useApp } from "@/context/AppContext";

// Tipo para a avaliação que inclui os detalhes do usuário
type ReviewWithUser = Review & { user: User };

export const RestaurantProfile = () => {
  const [, params] = useRoute("/restaurant/:id");
  const restaurantId = params?.id;
  const { setShowCreateReviewModal, setSelectedRestaurant } = useApp();

  // Busca os dados do restaurante
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  // Busca as avaliações já com os dados dos usuários incluídos
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/reviews", { restaurantId }],
    enabled: !!restaurantId,
  });

  // Calcula a média geral de todas as avaliações
  const overallRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.overallRating, 0) / reviews.length 
    : 0;

  // Calcula a média para uma categoria específica
  const calculateAverageRating = (category: string) => {
    const ratingsForCategory = reviews
      .map(review => (review.ratings as any)?.standard?.[category] ?? (review.ratings as any)?.custom?.[category])
      .filter(rating => rating !== undefined);
    
    if (ratingsForCategory.length === 0) return 0;
    
    return ratingsForCategory.reduce((sum, rating) => sum + rating, 0) / ratingsForCategory.length;
  };

  // Coleta todas as categorias únicas (padrão e customizadas) das avaliações
  const getAllCategories = () => {
    const categories = new Set<string>();
    reviews.forEach(review => {
      const ratings = review.ratings as any;
      if (ratings?.standard) Object.keys(ratings.standard).forEach(cat => categories.add(cat));
      if (ratings?.custom) Object.keys(ratings.custom).forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  };

  const allCategories = getAllCategories();
  const allPhotos = reviews.flatMap(review => review.photos as string[] || []);

  const handleNewReview = () => {
    if (!restaurant) return;
    setSelectedRestaurant(restaurant);
    setShowCreateReviewModal(true);
  };

  if (isLoadingRestaurant || isLoadingReviews) {
    return <div>Carregando...</div>; // TODO: Adicionar um skeleton state bonito
  }

  if (!restaurant) {
    return <div>Restaurante não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Cabeçalho */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-orange-600 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a página inicial
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 flex items-center mt-2">
            <MapPin className="w-5 h-5 mr-2" />
            {(restaurant.address as any).fullAddress}
          </p>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <StarRating rating={overallRating} readonly size="lg" />
              <span className="text-xl font-bold">{overallRating.toFixed(1)}</span>
              <span className="text-gray-600">({reviews.length} avaliações)</span>
            </div>
            {restaurant.isValidated && (
              <Badge className="bg-green-100 text-green-800 border-green-200">Verificado</Badge>
            )}
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Coluna de Avaliações (maior) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Avaliações</h2>
              <Button onClick={handleNewReview} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Avaliar
              </Button>
            </div>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} user={review.user} restaurant={restaurant} />
              ))
            ) : (
              <p className="text-gray-500 py-8 text-center">Ainda não há avaliações para este restaurante.</p>
            )}
          </div>

          {/* Coluna Lateral (menor) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Resumo das Avaliações</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {allCategories.map(category => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{category}</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={calculateAverageRating(category)} readonly size="sm" />
                      <span className="font-medium">{calculateAverageRating(category).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {allPhotos.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Galeria de Fotos</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {allPhotos.slice(0, 9).map((photo, index) => (
                      <img key={index} src={photo} alt={`Foto ${index + 1}`} className="w-full h-20 object-cover rounded-md" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};