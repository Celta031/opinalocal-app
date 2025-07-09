import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { InsertRestaurant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  fullAddress: string;
}

interface RestaurantFormData {
  name: string;
  address: AddressData;
  location?: {
    lat: number;
    lng: number;
  };
}

export const RestaurantRegistrationModal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showRestaurantModal, setShowRestaurantModal } = useApp();
  
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      fullAddress: ""
    }
  });
  
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");

  const createRestaurantMutation = useMutation({
    mutationFn: (restaurantData: InsertRestaurant) => 
      apiRequest("POST", "/api/restaurants", restaurantData),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Restaurante cadastrado com sucesso! Aguarde a validação do administrador.",
      });
      setShowRestaurantModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar restaurante",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        fullAddress: ""
      }
    });
    setAddressQuery("");
    setShowSuggestions(false);
  };

  // Simulate Google Places API - in production, this would connect to actual Google Places API
  const handleAddressSearch = async (query: string) => {
    setAddressQuery(query);
    
    if (query.length < 3) {
      setShowSuggestions(false);
      return;
    }

    // Mock address suggestions - in production, replace with actual Google Places API
    const mockSuggestions = [
      {
        place_id: "1",
        description: "Rua da Consolação, 123 - Consolação, São Paulo - SP",
        structured_formatting: {
          main_text: "Rua da Consolação, 123",
          secondary_text: "Consolação, São Paulo - SP"
        }
      },
      {
        place_id: "2", 
        description: "Rua Augusta, 456 - Bela Vista, São Paulo - SP",
        structured_formatting: {
          main_text: "Rua Augusta, 456",
          secondary_text: "Bela Vista, São Paulo - SP"
        }
      },
      {
        place_id: "3",
        description: "Av. Paulista, 789 - Bela Vista, São Paulo - SP", 
        structured_formatting: {
          main_text: "Av. Paulista, 789",
          secondary_text: "Bela Vista, São Paulo - SP"
        }
      }
    ].filter(suggestion => 
      suggestion.description.toLowerCase().includes(query.toLowerCase())
    );

    setAddressSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  const handleAddressSelect = (suggestion: any) => {
    const parts = suggestion.description.split(" - ");
    const street = parts[0] || "";
    const neighborhood = parts[1] || "";
    const cityState = parts[2] || "";
    const [city, state] = cityState.split(" - ");

    setFormData(prev => ({
      ...prev,
      address: {
        street,
        city: city || "São Paulo",
        state: state || "SP",
        postalCode: "01234-567", // Mock postal code
        fullAddress: suggestion.description
      },
      location: {
        lat: -23.5505 + (Math.random() - 0.5) * 0.1, // Mock coordinates near São Paulo
        lng: -46.6333 + (Math.random() - 0.5) * 0.1
      }
    }));

    setAddressQuery(suggestion.description);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do restaurante é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.fullAddress.trim()) {
      toast({
        title: "Erro", 
        description: "Endereço é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const restaurantData: InsertRestaurant = {
      name: formData.name.trim(),
      address: formData.address,
      location: formData.location,
      createdBy: user.id
    };

    createRestaurantMutation.mutate(restaurantData);
  };

  return (
    <Dialog open={showRestaurantModal} onOpenChange={setShowRestaurantModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Restaurante</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="restaurantName">Nome do Restaurante</Label>
            <Input
              id="restaurantName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Restaurante do João"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="address"
                  value={addressQuery}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  placeholder="Digite o endereço completo..."
                  className="pl-10"
                  required
                />
              </div>
              
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto border border-gray-200 z-50">
                  {addressSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => handleAddressSelect(suggestion)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {suggestion.structured_formatting.main_text}
                          </div>
                          <div className="text-sm text-gray-600">
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {formData.address.fullAddress && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Endereço selecionado:</strong> {formData.address.fullAddress}
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Após o cadastro, o restaurante passará por validação 
              do administrador antes de aparecer nas buscas.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRestaurantModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createRestaurantMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createRestaurantMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Restaurante"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};