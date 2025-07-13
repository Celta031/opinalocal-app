import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { RestaurantProfile } from "@/pages/RestaurantProfile";
import { CreateReview } from "@/pages/CreateReview";
import { AdminPanel } from "@/pages/AdminPanel";
import { RestaurantRegistrationModal } from "@/components/RestaurantRegistrationModal";
import { UserProfile } from "@/pages/UserProfile";
import { SettingsPage } from "@/pages/SettingsPage";
import { MyRestaurants } from "@/pages/MyRestaurants"; // Importe a nova página
import { EditRestaurant } from "@/pages/EditRestaurant"; // Importe a nova página
import { AllReviews } from "@/pages/AllReviews";
import NotFound from "@/pages/not-found";

function AppContent() {
  // Esta função agora simplesmente renderiza as rotas,
  // permitindo que a Dashboard seja a página inicial para todos.
  return (
    <AppProvider>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/restaurant/:id" component={RestaurantProfile} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/perfil" component={UserProfile} />
        <Route path="/configuracoes" component={SettingsPage} />
        <Route path="/todas-avaliacoes" component={AllReviews} />
        
        {/* --- ROTAS ADICIONADAS --- */}
        <Route path="/meus-restaurantes" component={MyRestaurants} />
        <Route path="/restaurante/:id/editar" component={EditRestaurant} />
        
        <Route component={NotFound} />
      </Switch>
      
      {/* Os modais são renderizados aqui para estarem disponíveis globalmente */}
      <CreateReview />
      <RestaurantRegistrationModal />
    </AppProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;