import { Restaurant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { MapPin } from "lucide-react";

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

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
              alt={restaurant.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{restaurant.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{address.fullAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StarRating rating={averageRating} readonly size="sm" />
                <span className="text-sm text-gray-500">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {reviewCount} reviews
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
