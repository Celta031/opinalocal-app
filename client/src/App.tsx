import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { RestaurantProfile } from "@/pages/RestaurantProfile";
import { CreateReview } from "@/pages/CreateReview";
import { AdminPanel } from "@/pages/AdminPanel";
import { RestaurantRegistrationModal } from "@/components/RestaurantRegistrationModal";
import NotFound from "@/pages/not-found";
import { AllReviews } from "@/pages/AllReviews";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppProvider>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/restaurant/:id" component={RestaurantProfile} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/todas-avaliacoes" component={AllReviews} /> {/* <-- Adicione esta rota */}
        <Route component={NotFound} />
      </Switch>
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
