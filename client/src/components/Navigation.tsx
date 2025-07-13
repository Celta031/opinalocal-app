import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Menu, LogOut, User, Settings, Shield, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

// Componente para o esqueleto de carregamento
const AuthNavSkeleton = () => (
  <div className="flex items-center space-x-4 animate-pulse">
    <div className="h-7 w-24 bg-gray-200 rounded-md"></div>
    <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
  </div>
);

export const Navigation = () => {
  // CORREÇÃO: Obtendo o estado 'loading' do contexto de autenticação
  const { user, signOut, loading } = useAuth();
  const { setShowCreateReviewModal } = useApp();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleNewReviewClick = () => {
    setShowCreateReviewModal(true);
    setShowMobileMenu(false);
  };

  const handleLinkClick = () => {
    setShowMobileMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
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

          {/* --- Menu Desktop --- */}
          <div className="hidden md:flex items-center space-x-4">
            {/* CORREÇÃO: Lógica de renderização condicional com estado de carregamento */}
            {loading ? (
              <AuthNavSkeleton />
            ) : user ? (
              // Menu para usuário LOGADO
              <>
                <span className="text-gray-700">
                  Olá, <span className="font-medium">{user.name}</span>
                </span>
                <Button onClick={handleNewReviewClick} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Avaliação
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href="/perfil"><DropdownMenuItem><User className="w-4 h-4 mr-2" /> Meu Perfil</DropdownMenuItem></Link>
                    <Link href="/meus-restaurantes"><DropdownMenuItem><Briefcase className="w-4 h-4 mr-2" /> Meus Restaurantes</DropdownMenuItem></Link>
                    <Link href="/configuracoes"><DropdownMenuItem><Settings className="w-4 h-4 mr-2" /> Configurações</DropdownMenuItem></Link>
                    {user.role === 'admin' && (
                      <Link href="/admin"><DropdownMenuItem><Shield className="w-4 h-4 mr-2" /> Painel Admin</DropdownMenuItem></Link>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" /> Sair</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Menu para VISITANTE
              <Link href="/login">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Entrar / Cadastrar
                </Button>
              </Link>
            )}
          </div>

          {/* --- Menu Mobile --- */}
          <div className="md:hidden">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : user ? (
                  // Menu mobile para usuário LOGADO
                  <div className="flex flex-col space-y-2 mt-8">
                    <div className="flex items-center space-x-3 pb-4 border-b mb-4">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Button onClick={handleNewReviewClick} className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
                    </Button>
                    <Link href="/perfil" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><User className="w-4 h-4 mr-2" /> Meu Perfil</Button></Link>
                    <Link href="/meus-restaurantes" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Briefcase className="w-4 h-4 mr-2" /> Meus Restaurantes</Button></Link>
                    <Link href="/configuracoes" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Settings className="w-4 h-4 mr-2" /> Configurações</Button></Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={handleLinkClick}><Button variant="ghost" className="w-full justify-start"><Shield className="w-4 h-4 mr-2" /> Painel Admin</Button></Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                  </div>
                ) : (
                  // Menu mobile para VISITANTE
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/login" onClick={handleLinkClick}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">Entrar / Cadastrar</Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};