import { Restaurant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { MapPin, Utensils } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  averageRating?: number;
  reviewCount?: number;
}

export const RestaurantCard = ({
  restaurant,
  onClick,
  averageRating = 0,
  reviewCount = 0,
}: RestaurantCardProps) => {
  const address = restaurant.address as any;
  // Pega a URL da foto do restaurante, se existir
  const photo = restaurant.photoUrl;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* --- LÓGICA CORRIGIDA AQUI --- */}
          {/* Se houver foto, mostra a imagem. Senão, mostra o ícone. */}
          {photo ? (
            <img
              src={photo}
              alt={restaurant.name}
              className="w-16 h-16 bg-gray-200 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 mb-1 truncate">{restaurant.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{address.fullAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm flex-wrap">
              <StarRating rating={averageRating} readonly size="sm" />
              <span className="font-medium text-gray-800">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500 whitespace-nowrap">
                ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};