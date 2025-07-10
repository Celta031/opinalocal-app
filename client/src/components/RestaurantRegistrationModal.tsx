import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useJsApiLoader } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

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

const libraries: "places"[] = ["places"];

// Definindo a interface para o estado do formulário
interface FormData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    fullAddress: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
}

// Valor inicial para o estado
const initialFormData: FormData = {
  name: "",
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    fullAddress: "",
  },
};

export const RestaurantRegistrationModal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showRestaurantModal, setShowRestaurantModal } = useApp();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_Maps_API_KEY as string,
    libraries,
  });

  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Flag para saber se um endereço válido foi selecionado
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "br" },
    },
    debounce: 300,
  });

  const createRestaurantMutation = useMutation({
    mutationFn: (restaurantData: InsertRestaurant) =>
      apiRequest("POST", "/api/restaurants", restaurantData),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Restaurante cadastrado com sucesso! Aguarde a validação.",
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
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setValue("", false);
    clearSuggestions();
    setIsPlaceSelected(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    // Se o usuário digita, o endereço selecionado anteriormente não é mais válido
    setIsPlaceSelected(false);
    setFormData(prev => ({ ...prev, address: { ...initialFormData.address, fullAddress: e.target.value } }));
  };

  const handleSelectSuggestion = async (description: string) => {
    setValue(description, false);
    clearSuggestions();
    setIsPlaceSelected(false); // Inicia como falso até confirmarmos que os dados foram extraídos

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const getAddressComponent = (type: string) =>
        results[0].address_components.find(c => c.types.includes(type))?.long_name || "";
      
      const streetNumber = getAddressComponent("street_number");
      const street = getAddressComponent("route");

      setFormData(prev => ({
        ...prev,
        address: {
          street: streetNumber ? `${street}, ${streetNumber}` : street,
          city: getAddressComponent("administrative_area_level_2"),
          state: getAddressComponent("administrative_area_level_1"),
          postalCode: getAddressComponent("postal_code"),
          fullAddress: description,
        },
        location: { lat, lng },
      }));
      setIsPlaceSelected(true); // Confirma que um endereço válido foi selecionado e processado
    } catch (error) {
      console.error("Error getting geocode: ", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isPlaceSelected) return;
    
    createRestaurantMutation.mutate({
      ...formData,
      createdBy: user.id,
    });
  };

  // Condição para desabilitar o botão de cadastro
  const isSubmitDisabled = !formData.name || !isPlaceSelected || createRestaurantMutation.isPending;

  if (loadError) return <div>Erro ao carregar o mapa. Verifique sua chave de API.</div>;
  if (!isLoaded) return <div>Carregando...</div>;

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
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="address"
                value={value}
                onChange={handleInputChange}
                disabled={!ready}
                placeholder="Digite para pesquisar o endereço..."
                className="pl-10"
                required
              />
              {status === "OK" && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto border border-gray-200 z-50">
                  {data.map(({ place_id, description }) => (
                    <button
                      key={place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(description)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {description}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!isPlaceSelected && value && (
              <p className="text-xs text-yellow-600 mt-1">Por favor, selecione um endereço da lista.</p>
            )}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Após o cadastro, o restaurante passará por validação do administrador.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setShowRestaurantModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} className="bg-orange-600 hover:bg-orange-700">
              {createRestaurantMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cadastrando...</>
              ) : ( "Cadastrar Restaurante" )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};