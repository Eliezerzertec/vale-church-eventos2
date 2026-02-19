import { Church, Heart, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Church className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">Vale Church Lavras</span>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Somos Movidos Por Amor. Nossa missão é ser uma igreja formada por autênticos discípulos de Cristo.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-primary">Links</h4>
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <Link to="/eventos" className="hover:text-primary transition-colors">Eventos</Link>
              <Link to="/sobre" className="hover:text-primary transition-colors">Sobre Nós</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-primary">Contato</h4>
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/70" />
                <span>Lavras - MG</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary/70" />
                <span>contato@valechurch.com.br</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-8 pt-6 text-center text-xs text-secondary-foreground/50">
          <p className="flex items-center justify-center gap-1">
            Feito com <Heart className="h-3 w-3 text-primary" /> Vale Church Lavras © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
