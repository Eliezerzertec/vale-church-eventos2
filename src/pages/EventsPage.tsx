import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const EventsPage = () => {
  const [search, setSearch] = useState("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filtered = events?.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary tracking-widest uppercase text-xs font-semibold mb-2">Agenda</p>
          <h1 className="font-display text-4xl font-bold text-secondary-foreground mb-4">Nossos Eventos</h1>
          <p className="text-secondary-foreground/70 max-w-md mx-auto mb-6">
            Participe dos nossos eventos e fortaleça sua caminhada de fé.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/40"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl h-72 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((event) => (
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
                    {format(new Date(event.event_date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-muted-foreground text-xs mt-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-sm font-semibold ${event.is_free ? "text-green-600" : "text-primary"}`}>
                      {event.is_free ? "Gratuito" : `R$ ${Number(event.price).toFixed(2)}`}
                    </span>
                    <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Inscrever-se <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum evento encontrado.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EventsPage;
