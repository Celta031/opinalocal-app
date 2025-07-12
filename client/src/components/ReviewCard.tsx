import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review, User, Restaurant, Comment, InsertComment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Trash2, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ReviewCardProps {
  review: Review;
  user: User;
  restaurant: Restaurant;
  showRestaurantName?: boolean;
}

type CommentWithUser = Comment & { user: User };

const CommentsSection = ({ review, currentUser }: { review: Review, currentUser: User | null }) => {
  const [newComment, setNewComment] = useState("");
  const reviewId = review.id;

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/reviews/${reviewId}/comments`],
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentData: InsertComment) => 
      apiRequest("POST", `/api/reviews/${reviewId}/comments`, commentData),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/${reviewId}/comments`] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => apiRequest("DELETE", `/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/${reviewId}/comments`] });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim() && currentUser) {
      addCommentMutation.mutate({
        text: newComment.trim(),
        userId: currentUser.id,
        reviewId,
      });
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="comments">
        <AccordionTrigger>
          <div className="flex items-center text-sm text-gray-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            Ver comentários ({comments.length})
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-4">
            {/* Formulário para novo comentário */}
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.photoURL || undefined} />
                <AvatarFallback>{currentUser?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <Button size="sm" onClick={handleAddComment} disabled={addCommentMutation.isPending} className="mt-2 bg-orange-600 hover:bg-orange-700">
                  {addCommentMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Comentar"}
                </Button>
              </div>
            </div>
            
            {/* Lista de comentários */}
            {isLoading ? <p>Carregando...</p> : comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user?.photoURL || undefined} />
                  <AvatarFallback>{comment.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        {currentUser?.role === 'admin' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-red-500" onClick={() => deleteCommentMutation.mutate(comment.id)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        )}
                    </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export const ReviewCard = ({ review, user, restaurant, showRestaurantName = false }: ReviewCardProps) => {
  const { user: currentUser } = useAuth();
  const photos = review.photos as string[] || [];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{user?.name || 'Usuário'}</h4>
                {showRestaurantName && restaurant && (
                  <p className="text-sm text-gray-600">
                    avaliou o 
                    <Link href={`/restaurant/${restaurant.id}`}>
                      <a className="font-medium text-orange-600 hover:underline ml-1">{restaurant.name}</a>
                    </Link>
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center mb-3">
              <StarRating rating={review.overallRating} readonly size="sm" />
              <span className="text-sm font-medium text-gray-700 ml-2">{review.overallRating.toFixed(1)}</span>
            </div>
            <p className="text-gray-700 mb-3">{review.text}</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.slice(0, 3).map((photo, index) => (
                  <img key={index} src={photo} alt={`Review photo ${index + 1}`} className="w-full h-20 object-cover rounded-lg"/>
                ))}
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500 border-b pb-3 mb-3">
              <span>Visita em: {new Date(review.visitDate).toLocaleDateString()}</span>
            </div>
            {/* Seção de Comentários Integrada */}
            <CommentsSection review={review} currentUser={currentUser} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};