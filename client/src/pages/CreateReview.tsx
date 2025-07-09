import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { SearchInput } from "@/components/SearchInput";
import { StarRating } from "@/components/StarRating";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Restaurant, Category, InsertReview } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    selectedRestaurant, 
    showCreateReviewModal, 
    setShowCreateReviewModal,
    setSelectedRestaurant 
  } = useApp();
  
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurantLocal, setSelectedRestaurantLocal] = useState<Restaurant | null>(selectedRestaurant);
  const [categorySearch, setCategorySearch] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [selectedCustomCategories, setSelectedCustomCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<ReviewFormData>({
    restaurantId: 0,
    text: "",
    photos: [],
    visitDate: new Date().toISOString().split('T')[0],
    ratings: {
      standard: {},
      custom: {}
    },
    overallRating: 0
  });

  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/search", searchQuery],
    enabled: !!user && searchQuery.length > 0,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories/search", categorySearch],
    enabled: !!user && categorySearch.length > 0,
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData: InsertReview) => apiRequest("POST", "/api/reviews", reviewData),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Avaliação publicada com sucesso!",
      });
      setShowCreateReviewModal(false);
      setSelectedRestaurant(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao publicar avaliação",
        variant: "destructive",
      });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: { name: string; createdBy: string }) => 
      apiRequest("POST", "/api/categories", categoryData),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Categoria sugerida com sucesso!",
      });
      setNewCategoryName("");
      setShowNewCategoryInput(false);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao sugerir categoria",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (selectedRestaurant) {
      setSelectedRestaurantLocal(selectedRestaurant);
      setFormData(prev => ({ ...prev, restaurantId: selectedRestaurant.id }));
      setStep(2);
    }
  }, [selectedRestaurant]);

  const resetForm = () => {
    setStep(1);
    setSelectedRestaurantLocal(null);
    setSelectedCustomCategories([]);
    setFormData({
      restaurantId: 0,
      text: "",
      photos: [],
      visitDate: new Date().toISOString().split('T')[0],
      ratings: {
        standard: {},
        custom: {}
      },
      overallRating: 0
    });
  };

  const handleRestaurantSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRestaurantSelect = (result: any) => {
    const restaurant = restaurants.find(r => r.id === result.id);
    if (restaurant) {
      setSelectedRestaurantLocal(restaurant);
      setFormData(prev => ({ ...prev, restaurantId: restaurant.id }));
      setStep(2);
    }
  };

  const handleStandardRating = (category: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        standard: {
          ...prev.ratings.standard,
          [category]: rating
        }
      }
    }));
  };

  const handleCustomRating = (category: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        custom: {
          ...prev.ratings.custom,
          [category]: rating
        }
      }
    }));
  };

  const handleCategorySelect = (category: Category) => {
    if (!selectedCustomCategories.find(c => c.id === category.id)) {
      setSelectedCustomCategories([...selectedCustomCategories, category]);
    }
    setCategorySearch("");
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCustomCategories(selectedCustomCategories.filter(c => c.id !== categoryId));
    const newCustomRatings = { ...formData.ratings.custom };
    const categoryToRemove = selectedCustomCategories.find(c => c.id === categoryId);
    if (categoryToRemove) {
      delete newCustomRatings[categoryToRemove.name];
    }
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        custom: newCustomRatings
      }
    }));
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && user) {
      createCategoryMutation.mutate({
        name: newCategoryName.trim(),
        createdBy: user.id.toString()
      });
    }
  };

  const calculateOverallRating = () => {
    const standardRatings = Object.values(formData.ratings.standard);
    const customRatings = Object.values(formData.ratings.custom);
    const allRatings = [...standardRatings, ...customRatings];
    
    if (allRatings.length === 0) return 0;
    
    const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
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
    <Dialog open={showCreateReviewModal} onOpenChange={setShowCreateReviewModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Avaliação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Restaurant Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                    1
                  </div>
                  Selecione o Restaurante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SearchInput
                  placeholder="Digite o nome do restaurante..."
                  onSearch={handleRestaurantSearch}
                  results={restaurantSearchResults}
                  onSelect={handleRestaurantSelect}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Review Form */}
          {step === 2 && selectedRestaurantLocal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3">
                    2
                  </div>
                  Sua Avaliação - {selectedRestaurantLocal.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="visitDate">Data da Visita</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>Fotos</Label>
                  <PhotoUpload
                    photos={formData.photos}
                    onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                  />
                </div>

                <div>
                  <Label htmlFor="reviewText">Sua Opinião</Label>
                  <Textarea
                    id="reviewText"
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Conte sobre sua experiência neste restaurante..."
                    rows={4}
                  />
                </div>

                {/* Standard Categories */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Avalie por Categoria
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Comida", "Atendimento", "Ambiente", "Preço"].map((category) => (
                      <div key={category} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-gray-700">
                            {category}
                          </Label>
                          <span className="text-sm text-gray-500">
                            {formData.ratings.standard[category] || 0}
                          </span>
                        </div>
                        <StarRating
                          rating={formData.ratings.standard[category] || 0}
                          onChange={(rating) => handleStandardRating(category, rating)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Categories */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Categorias da Comunidade
                  </h4>
                  
                  <div className="space-y-4">
                    <SearchInput
                      placeholder="Pesquisar categorias..."
                      onSearch={setCategorySearch}
                      results={categories.map(c => ({ id: c.id, name: c.name }))}
                      onSelect={(result) => {
                        const category = categories.find(c => c.id === result.id);
                        if (category) handleCategorySelect(category);
                      }}
                    />

                    {selectedCustomCategories.length > 0 && (
                      <div className="space-y-3">
                        {selectedCustomCategories.map((category) => (
                          <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Label className="text-sm font-medium text-gray-700 mr-2">
                                  {category.name}
                                </Label>
                                <button
                                  onClick={() => handleRemoveCategory(category.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formData.ratings.custom[category.name] || 0}
                              </span>
                            </div>
                            <StarRating
                              rating={formData.ratings.custom[category.name] || 0}
                              onChange={(rating) => handleCustomRating(category.name, rating)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      {showNewCategoryInput ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nome da nova categoria"
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleCreateCategory}
                            size="sm"
                            disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                          >
                            Criar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName("");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Sugerir nova categoria
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Rating Display */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      Avaliação Geral
                    </span>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={calculateOverallRating()} readonly />
                      <span className="font-medium text-orange-600">
                        {calculateOverallRating().toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => setShowCreateReviewModal(false)}
          >
            Cancelar
          </Button>
          {step === 2 && (
            <Button
              onClick={handleSubmit}
              disabled={!formData.text.trim() || createReviewMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createReviewMutation.isPending ? "Publicando..." : "Publicar Avaliação"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
