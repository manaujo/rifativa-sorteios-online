
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Rifativa</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/rifas" className="text-gray-600 hover:text-primary-600 transition-colors">
              Rifas
            </Link>
            <Link to="/campanhas" className="text-gray-600 hover:text-primary-600 transition-colors">
              Campanhas
            </Link>
            <Link to="#como-funciona" className="text-gray-600 hover:text-primary-600 transition-colors">
              Como Funciona
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
