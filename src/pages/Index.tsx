import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Heart, MapPin, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-church.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { data: events } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="Vale Church" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <p className="text-primary tracking-[0.3em] uppercase text-sm font-medium mb-4">
            Somos Movidos Por Amor
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-secondary-foreground mb-6 leading-tight">
            Vale Church
            <span className="block text-primary">Lavras</span>
          </h1>
          <p className="text-secondary-foreground/80 text-lg max-w-lg mx-auto mb-8 font-light">
            Uma igreja formada por autênticos discípulos de Cristo, comprometida com a implantação do Reino de Deus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/eventos">
              <Button size="lg" className="gradient-gold text-secondary font-semibold shadow-gold px-8">
                <Calendar className="mr-2 h-5 w-5" />
                Ver Eventos
              </Button>
            </Link>
            <Link to="/sobre">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Conheça Nossa Igreja
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 bg-church-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary tracking-widest uppercase text-xs font-semibold mb-2">Programação</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Nossos Cultos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { day: "Domingo", time: "19h", title: "Culto de Celebração", desc: "Para toda a família" },
              { day: "Terça-feira", time: "19:30h", title: "Grupos Vida", desc: "A Igreja no lar" },
              { day: "Quinta-feira", time: "19:30h", title: "Quinta Viva!", desc: "Cultos ministeriais" },
            ].map((item) => (
              <div
                key={item.day}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-soft transition-all duration-300 border border-border/50 text-center group"
              >
                <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.day}</h3>
                <p className="text-primary font-bold text-xl mb-2">{item.time}</p>
                <p className="text-foreground font-medium text-sm">{item.title}</p>
                <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary tracking-widest uppercase text-xs font-semibold mb-2">Agenda</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Próximos Eventos</h2>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/eventos/${event.id}`}
                  className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 border border-border/50"
                >
                  <div className="h-48 bg-secondary flex items-center justify-center">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="h-12 w-12 text-primary/40" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(event.event_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-sm font-semibold ${event.is_free ? "text-green-600" : "text-primary"}`}>
                        {event.is_free ? "Gratuito" : `R$ ${Number(event.price).toFixed(2)}`}
                      </span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum evento próximo disponível.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/eventos">
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                Ver Todos os Eventos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary tracking-widest uppercase text-xs font-semibold mb-2">Nossos Pilares</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">O Que Nos Move</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Heart, title: "Amor", desc: "Base de tudo que fazemos" },
              { icon: Users, title: "Comunhão", desc: "Unidos como família" },
              { icon: Calendar, title: "Discipulado", desc: "Crescimento contínuo" },
              { icon: MapPin, title: "Missão", desc: "Alcançando vidas" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-lg mb-1">{item.title}</h4>
                <p className="text-secondary-foreground/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
