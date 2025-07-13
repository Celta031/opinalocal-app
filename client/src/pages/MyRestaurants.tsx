// client/src/pages/MyRestaurants.tsx

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Restaurant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building, AlertCircle, Edit } from "lucide-react";

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => (
  <Card>
    <CardHeader>
      <CardTitle>{restaurant.name}</CardTitle>
      <CardDescription>{(restaurant.address as any)?.fullAddress}</CardDescription>
    </CardHeader>
    <CardContent className="flex justify-end">
      <Link href={`/restaurante/${restaurant.id}/editar`}>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export const MyRestaurants = () => {
  const { user } = useAuth();

  const { data: restaurants, isLoading, isError, error } = useQuery<Restaurant[]>({
    queryKey: ["/api/users", user?.id, "restaurants"],
    queryFn: () => apiRequest("GET", `/api/users/${user!.id}/restaurants`).then(res => res.json()),
    enabled: !!user,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="ml-4 text-lg text-gray-600">Carregando seus restaurantes...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-20 bg-red-50 p-6 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h3 className="mt-4 text-xl font-semibold text-red-700">Ocorreu um erro</h3>
          <p className="mt-2 text-red-600">Não foi possível carregar seus restaurantes. Tente novamente mais tarde.</p>
          <p className="mt-1 text-xs text-red-500">Detalhe: {(error as Error).message}</p>
        </div>
      );
    }

    if (!restaurants || restaurants.length === 0) {
      return (
        <div className="text-center py-20 bg-gray-50 p-6 rounded-lg">
          <Building className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum restaurante encontrado</h3>
          <p className="mt-2 text-gray-500">Você ainda não está vinculado a nenhum restaurante como proprietário.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Meus Restaurantes</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie os restaurantes que você possui.</p>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};