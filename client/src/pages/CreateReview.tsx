import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus, Search, Loader2, PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Restaurant, Category, InsertReview } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/StarRating";
import { PhotoUpload } from "@/components/PhotoUpload";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface ReviewFormData {
  restaurantId: number;
  text: string;
  photos: string[];
  visitDate: string;
  ratings: {
    standard: { [key: string]: number };
    custom: { [key: string]: number };
  };
  overallRating: number;
}

export const CreateReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    showCreateReviewModal, 
    setShowCreateReviewModal,
    setShowRestaurantModal, 
    selectedRestaurant: preSelectedRestaurant,
    setSelectedRestaurant
  } = useApp();
  
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); 
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const [selectedRestaurantLocal, setSelectedRestaurantLocal] = useState<Restaurant | null>(preSelectedRestaurant);
  const [categorySearch, setCategorySearch] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [selectedCustomCategories, setSelectedCustomCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<any>({
    text: "",
    photos: [],
    visitDate: new Date().toISOString().split('T')[0],
    ratings: { standard: {}, custom: {} },
  });

  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/search", { q: debouncedSearchTerm, validated: true }],
    enabled: !!user && debouncedSearchTerm.length > 0 && step === 1,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories/search", categorySearch],
    enabled: !!user && categorySearch.length > 0,
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData: InsertReview) => apiRequest("POST", "/api/reviews", reviewData),
    onSuccess: () => {
        toast({ title: "Sucesso", description: "Avaliação publicada com sucesso!" });
        closeAndResetModal();
        queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao publicar avaliação", variant: "destructive" })
  });

  const createCategoryMutation = useMutation({
      mutationFn: (categoryData: { name: string; createdBy: string }) => apiRequest("POST", "/api/categories", categoryData),
      onSuccess: () => {
          toast({ title: "Sucesso", description: "Categoria sugerida com sucesso!" });
          setNewCategoryName("");
          setShowNewCategoryInput(false);
          queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      },
      onError: () => toast({ title: "Erro", description: "Falha ao sugerir categoria", variant: "destructive" })
  });

  const closeAndResetModal = () => {
    setShowCreateReviewModal(false);
    setSelectedRestaurant(null); // Limpa o restaurante selecionado no contexto
    resetForm();
  }

  useEffect(() => {
    if (preSelectedRestaurant) {
      setSelectedRestaurantLocal(preSelectedRestaurant);
      setSearchQuery(preSelectedRestaurant.name);
      setStep(2);
    } else {
      resetForm();
    }
  }, [preSelectedRestaurant, showCreateReviewModal]);

  const resetForm = () => {
    setStep(1);
    setSelectedRestaurantLocal(null);
    setSearchQuery("");
    setSelectedCustomCategories([]);
    setFormData({
      text: "",
      photos: [],
      visitDate: new Date().toISOString().split('T')[0],
      ratings: { standard: {}, custom: {} },
    });
  };

  const handleRestaurantSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleOpenRestaurantModal = () => {
    setShowCreateReviewModal(false);
    setTimeout(() => setShowRestaurantModal(true), 150);
  };

  const handleStandardRating = (category: string, rating: number) => {
    setFormData((prev:any) => ({ ...prev, ratings: { ...prev.ratings, standard: { ...prev.ratings.standard, [category]: rating } } }));
  };
  const handleCustomRating = (category: string, rating: number) => {
    setFormData((prev:any) => ({ ...prev, ratings: { ...prev.ratings, custom: { ...prev.ratings.custom, [category]: rating } } }));
  };
  const handleCategorySelect = (category: Category) => {
    if (!selectedCustomCategories.find(c => c.id === category.id)) {
      setSelectedCustomCategories([...selectedCustomCategories, category]);
    }
    setCategorySearch("");
  };
  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCustomCategories(selectedCustomCategories.filter(c => c.id !== categoryId));
  };
  const handleCreateCategory = () => {
    if (newCategoryName.trim() && user) {
      createCategoryMutation.mutate({ name: newCategoryName.trim(), createdBy: user.id.toString() });
    }
  };

  const calculateOverallRating = () => {
    const allRatings = [
      ...Object.values(formData.ratings.standard),
      ...Object.values(formData.ratings.custom)
    ];
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc: number, rating: any) => acc + rating, 0);
    return sum / allRatings.length;
  };

  const handleSubmit = () => {
    if (!user || !selectedRestaurantLocal) return;
    const overallRating = calculateOverallRating();
    
    const reviewData: InsertReview = {
      userId: user.id,
      restaurantId: selectedRestaurantLocal.id,
      text: formData.text,
      photos: formData.photos,
      visitDate: new Date(formData.visitDate),
      ratings: formData.ratings,
      overallRating
    };

    createReviewMutation.mutate(reviewData);
  };

  const restaurantSearchResults = restaurants.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    subtitle: (restaurant.address as any).fullAddress,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
  }));

  return (
    <Dialog open={showCreateReviewModal} onOpenChange={closeAndResetModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Avaliação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">1</div>
                  Selecione o Restaurante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="restaurantSearch"
                    placeholder="Digite o nome do restaurante..."
                    className="pl-10"
                    value={searchQuery }
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {debouncedSearchTerm && (
                    <div className="absolute w-full top-full bg-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto border border-gray-200 z-50">
                      {isLoadingRestaurants && <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>}
                      {!isLoadingRestaurants && restaurants?.length === 0 && (
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-600 mb-3">Nenhum restaurante encontrado.</p>
                          <Button type="button" variant="outline" onClick={handleOpenRestaurantModal}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Cadastrar Novo Restaurante
                          </Button>
                        </div>
                      )}
                      {restaurants?.map((restaurant) => (
                        <button
                          key={restaurant.id}
                          type="button"
                          onClick={() => {
                            setSelectedRestaurantLocal(restaurant);
                            setSearchQuery(restaurant.name);
                            setStep(2);
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="font-medium">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">{(restaurant.address as { fullAddress?: string })?.fullAddress || ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && selectedRestaurantLocal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">2</div>
                    Sua Avaliação - {selectedRestaurantLocal.name}
                  </div>
                   <Button variant="link" size="sm" onClick={() => setStep(1)}>Trocar restaurante</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* O resto do seu formulário de avaliação continua aqui... (fotos, data, etc) */}
                <div>
                  <Label htmlFor="visitDate">Data da Visita</Label>
                  <Input id="visitDate" type="date" value={formData.visitDate} onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}/>
                </div>
                <div>
                  <Label>Fotos</Label>
                  <PhotoUpload photos={formData.photos} onPhotosChange={(photos) => setFormData({ ...formData, photos })}/>
                </div>
                <div>
                  <Label htmlFor="reviewText">Sua Opinião</Label>
                  <Textarea id="reviewText" value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })}/>
                </div>
                
                {/* Standard Categories */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Avalie por Categoria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Comida", "Atendimento", "Ambiente", "Preço"].map((category) => (
                      <div key={category} className="bg-gray-50 p-4 rounded-lg">
                        <Label>{category}</Label>
                        <StarRating rating={formData.ratings.standard[category] || 0} onChange={(rating) => handleStandardRating(category, rating)}/>
                      </div>
                    ))}
                  </div>
                </div>

                 {/* Community Categories */}
                 <div>
                    <h4 className="text-sm font-medium mb-4">Categorias da Comunidade</h4>
                    {/* ... (código das categorias da comunidade que você já tem) ... */}
                 </div>

                 {/* Overall Rating Display */}
                 <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Avaliação Geral</span>
                        <StarRating rating={calculateOverallRating()} readonly />
                    </div>
                 </div>

              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
          <Button variant="ghost" onClick={closeAndResetModal}>
            Cancelar
          </Button>
          {step === 2 && (
            <Button onClick={handleSubmit} disabled={createReviewMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
              {createReviewMutation.isPending ? "Publicando..." : "Publicar Avaliação"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};