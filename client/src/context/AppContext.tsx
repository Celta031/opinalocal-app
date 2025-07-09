import { createContext, useContext, useState, ReactNode } from "react";
import { Restaurant, Category } from "@shared/schema";

interface AppContextType {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: Category[];
  setSelectedCategories: (categories: Category[]) => void;
  showCreateReviewModal: boolean;
  setShowCreateReviewModal: (show: boolean) => void;
  showRestaurantModal: boolean;
  setShowRestaurantModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  return (
    <AppContext.Provider
      value={{
        selectedRestaurant,
        setSelectedRestaurant,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        setSelectedCategories,
        showCreateReviewModal,
        setShowCreateReviewModal,
        showRestaurantModal,
        setShowRestaurantModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
