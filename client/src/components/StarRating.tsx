import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export const StarRating = ({ 
  rating, 
  onChange, 
  readonly = false, 
  size = "md",
  showValue = false 
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const currentRating = hoverRating || rating;
    const filled = currentRating >= starValue;
    const halfFilled = currentRating >= starValue - 0.5 && currentRating < starValue;

    return (
      <button
        key={index}
        type="button"
        className={cn(
          "transition-colors",
          !readonly && "hover:text-orange-400 cursor-pointer",
          readonly && "cursor-default"
        )}
        onClick={() => !readonly && onChange?.(starValue)}
        onMouseEnter={() => !readonly && setHoverRating(starValue)}
        onMouseLeave={() => !readonly && setHoverRating(0)}
        disabled={readonly}
      >
        {halfFilled ? (
          <StarHalf className={cn(sizeClasses[size], "text-orange-500 fill-orange-500")} />
        ) : (
          <Star 
            className={cn(
              sizeClasses[size],
              filled ? "text-orange-500 fill-orange-500" : "text-gray-300"
            )} 
          />
        )}
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
