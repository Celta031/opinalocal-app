import { Restaurant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { MapPin, Utensils } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  averageRating?: number;
  reviewCount?: number;
  showPhoto?: boolean;
}

export const RestaurantCard = ({
  restaurant,
  onClick,
  averageRating = 0,
  reviewCount = 0,
  showPhoto = true,
}: RestaurantCardProps) => {
  const address = restaurant.address as any;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Lógica para exibir a foto ou um ícone */}
          {showPhoto ? (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                alt={restaurant.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{restaurant.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{address.fullAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm flex-nowrap">
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