import { Review, User, Restaurant } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
  user: User;
  restaurant: Restaurant;
  showRestaurantName?: boolean;
}

export const ReviewCard = ({
  review,
  user,
  restaurant,
  showRestaurantName = false,
}: ReviewCardProps) => {
  const photos = review.photos as string[] || [];
  const ratings = review.ratings as any;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                {showRestaurantName && (
                  <p className="text-sm text-gray-600">
                    reviewed {restaurant.name}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center mb-3">
              <StarRating rating={review.overallRating} readonly size="sm" />
              <span className="text-sm font-medium text-gray-700 ml-2">
                {review.overallRating.toFixed(1)}
              </span>
            </div>

            <p className="text-gray-700 mb-3">{review.text}</p>

            {photos.length > 0 && (
              <div className="flex space-x-2 mb-3">
                {photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
                {photos.length > 3 && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-600">
                      +{photos.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Visit: {new Date(review.visitDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
