// Novo conteúdo para client/src/pages/AllReviews.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Review, User, Restaurant } from "@shared/schema";

type ReviewWithDetails = Review & { user: User; restaurant: Restaurant };

export const AllReviews = () => {
  const [timeframe, setTimeframe] = useState("today"); // Estado para controlar a aba ativa

  const { data: reviews = [], isLoading } = useQuery<ReviewWithDetails[]>({
    // A chave da query agora inclui o timeframe para que a busca seja refeita ao mudar de aba
    queryKey: ["/api/reviews/all", { timeframe }],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
            <Link href="/">
              <a className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </a>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
        </div>

        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-1/3 mb-6">
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
            <TabsTrigger value="month">Este Mês</TabsTrigger>
          </TabsList>
          
          <TabsContent value={timeframe}>
            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <p>Nenhuma avaliação encontrada para este período.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        user={review.user}
                        restaurant={review.restaurant}
                        showRestaurantName={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};