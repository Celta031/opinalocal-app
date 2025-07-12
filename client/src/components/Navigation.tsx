import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Menu, LogOut, User, Settings, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { setShowCreateReviewModal } = useApp();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleNewReview = () => {
    setShowCreateReviewModal(true);
    setShowMobileMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  // Função para fechar o menu mobile ao clicar em um link
  const handleLinkClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="text-2xl font-bold text-orange-600 cursor-pointer">
                OpinaLocal
              </a>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700">
              Olá, <span className="font-medium">{user?.name}</span>
            </span>
            <Button onClick={handleNewReview} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/perfil">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" /> Meu Perfil
                  </DropdownMenuItem>
                </Link>
                <Link href="/configuracoes">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" /> Configurações
                  </DropdownMenuItem>
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" /> Painel Admin
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-2 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b mb-4">
                    <Avatar>
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  
                  <Button onClick={handleNewReview} className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
                  </Button>
                  
                  {/* AQUI ESTÁ A CORREÇÃO */}
                  <Link href="/perfil" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Button>
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link href="/admin" onClick={handleLinkClick}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" /> Painel Admin
                      </Button>
                    </Link>
                  )}

                  <Link href="/configuracoes" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" /> Configurações
                    </Button>
                </Link>
                  
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};