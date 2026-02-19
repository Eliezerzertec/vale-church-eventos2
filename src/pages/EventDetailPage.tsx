import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cpf: "" });
  const [submitted, setSubmitted] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: registrationCount } = useQuery({
    queryKey: ["registration-count", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!)
        .neq("status", "cancelled");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.from("event_registrations").insert({
        event_id: id!,
        user_id: session?.session?.user?.id || null,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        cpf: form.cpf.trim() || null,
        status: event?.is_free ? "confirmed" : "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Inscrição realizada!", description: event?.is_free ? "Você está inscrito no evento." : "Aguardando confirmação do pagamento." });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message || "Erro ao realizar inscrição.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    registerMutation.mutate();
  };

  const spotsLeft = event?.max_capacity ? event.max_capacity - (registrationCount || 0) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="h-96 animate-pulse bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <p className="text-muted-foreground">Evento não encontrado.</p>
          <Button onClick={() => navigate("/eventos")} variant="outline" className="mt-4">Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button onClick={() => navigate("/eventos")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar aos Eventos
          </button>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Event Info */}
            <div className="md:col-span-3">
              <div className="h-64 bg-secondary rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <Calendar className="h-16 w-16 text-primary/30" />
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                {format(new Date(event.event_date), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-4">{event.title}</h1>

              {event.location && (
                <p className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" /> {event.location}
                </p>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className={`text-lg font-bold ${event.is_free ? "text-green-600" : "text-primary"}`}>
                  {event.is_free ? "Evento Gratuito" : `R$ ${Number(event.price).toFixed(2)}`}
                </span>
                {spotsLeft !== null && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> {spotsLeft} vagas restantes
                  </span>
                )}
              </div>

              {event.description && (
                <div className="prose prose-sm text-foreground/80 leading-relaxed">
                  <p>{event.description}</p>
                </div>
              )}
            </div>

            {/* Registration Form */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 sticky top-24">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">Inscrição Confirmada!</h3>
                    <p className="text-muted-foreground text-sm">
                      {event.is_free
                        ? "Você está inscrito. Nos vemos no evento!"
                        : "Sua inscrição foi recebida. Realize o pagamento para confirmar."}
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">Inscreva-se</h3>
                    {isFull ? (
                      <p className="text-destructive font-medium text-center py-4">Evento lotado!</p>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="full_name">Nome Completo *</Label>
                          <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full gradient-gold text-secondary font-semibold shadow-gold" disabled={registerMutation.isPending}>
                          {registerMutation.isPending ? "Processando..." : event.is_free ? "Confirmar Inscrição" : "Inscrever-se e Pagar"}
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetailPage;
