import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-vale.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transparent = isHome && !scrolled && !isOpen;

  const links = [
    { href: "/", label: "Início" },
    { href: "/eventos", label: "Eventos" },
    { href: "/sobre", label: "Sobre" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-secondary/95 backdrop-blur-md border-b border-primary/20"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Vale Church Lavras" className="h-10 w-10 rounded-full object-cover" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href
                  ? "text-primary"
                  : transparent
                  ? "text-white/90"
                  : "text-secondary-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/admin/login">
            <Button
              size="sm"
              className={`backdrop-blur-sm font-semibold ${
                transparent
                  ? "bg-white/20 border border-white/50 text-white hover:bg-white/30"
                  : "bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              Painel Admin
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden ${transparent ? "text-white" : "text-secondary-foreground"}`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary border-t border-primary/10 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-secondary-foreground/80 hover:text-primary py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/admin/login" onClick={() => setIsOpen(false)}>
              <Button size="sm" variant="outline" className="w-full border-primary/40 text-primary">
                Painel Admin
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
