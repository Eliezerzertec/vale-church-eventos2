import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Music2, Headphones, Music, Users2, CalendarDays, Mic2, Guitar, Piano, Drum, Radio, Users, Zap, Heart, Handshake, Target } from "lucide-react";
import heroImage from "@/assets/hero-church.jpg";

const client = supabase as any;

interface Role {
  id: string;
  ministry_id: string;
  name: string;
  description?: string;
  slots?: number | null;
  is_active: boolean;
}

interface Ministry {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  audition_roles?: Role[];
}

interface ApplicationForm {
  full_name: string;
  email: string;
  phone: string;
  role_id: string;
  music_link: string;
  notes: string;
}

const initialForm: ApplicationForm = {
  full_name: "",
  email: "",
  phone: "",
  role_id: "",
  music_link: "",
  notes: "",
};

// Função para mapear nomes de funções para ícones
const getRoleIcon = (roleName: string) => {
  const name = roleName.toLowerCase();
  
  if (name.includes("vocalista") || name.includes("vocal") || name.includes("voz")) return <Mic2 className="h-4 w-4 text-primary flex-shrink-0" />;
  if (name.includes("guitarra") || name.includes("violão")) return <Guitar className="h-4 w-4 text-primary flex-shrink-0" />;
  if (name.includes("teclado") || name.includes("piano")) return <Piano className="h-4 w-4 text-primary flex-shrink-0" />;
  if (name.includes("bateria") || name.includes("bateria")) return <Drum className="h-4 w-4 text-primary flex-shrink-0" />;
  if (name.includes("baixo") || name.includes("bass")) return <Radio className="h-4 w-4 text-primary flex-shrink-0" />;
  if (name.includes("coral") || name.includes("coro")) return <Users className="h-4 w-4 text-primary flex-shrink-0" />;
  if (name.includes("louvor") || name.includes("adoração")) return <Zap className="h-4 w-4 text-primary flex-shrink-0" />;
  
  return <Music2 className="h-4 w-4 text-primary flex-shrink-0" />; // ícone padrão
};

// Função para retornar ícone baseado na primeira função do ministério
const getMinistryIcon = (roles?: Role[]) => {
  if (!roles || roles.length === 0) return <Heart className="h-5 w-5 text-primary" />;
  
  const firstRole = roles[0];
  const name = firstRole.name.toLowerCase();
  
  if (name.includes("vocalista") || name.includes("vocal") || name.includes("voz")) return <Mic2 className="h-5 w-5 text-primary" />;
  if (name.includes("guitarra") || name.includes("violão")) return <Guitar className="h-5 w-5 text-primary" />;
  if (name.includes("teclado") || name.includes("piano")) return <Piano className="h-5 w-5 text-primary" />;
  if (name.includes("bateria")) return <Drum className="h-5 w-5 text-primary" />;
  if (name.includes("baixo") || name.includes("bass")) return <Radio className="h-5 w-5 text-primary" />;
  if (name.includes("coral") || name.includes("coro")) return <Users className="h-5 w-5 text-primary" />;
  if (name.includes("louvor") || name.includes("adoração")) return <Zap className="h-5 w-5 text-primary" />;
  
  return <Music2 className="h-5 w-5 text-primary" />; // ícone padrão
};

const AuditionsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [form, setForm] = useState<ApplicationForm>(initialForm);

  const { data: ministries, isLoading } = useQuery({
    queryKey: ["auditions-public"],
    queryFn: async () => {
      const { data, error } = await client
        .from("audition_ministries")
        .select("id,name,description,is_active,audition_roles(*)")
        .eq("is_active", true)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });
      if (error) throw error;
      // filter only active roles
      return (data as Ministry[]).map((m) => ({
        ...m,
        audition_roles: (m.audition_roles || []).filter((r) => r.is_active),
      }));
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) throw new Error("Selecione uma função");
      if (!form.full_name || !form.email) throw new Error("Nome e e-mail são obrigatórios");

      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        role_id: selectedRole.id,
        music_link: form.music_link || null,
        notes: form.notes || null,
      };

      const { error } = await client.from("audition_applications").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Inscrição enviada", description: "Obrigado! Entraremos em contato com os próximos passos." });
      setForm(initialForm);
      setSelectedRole(null);
      queryClient.invalidateQueries({ queryKey: ["auditions-public"] });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    },
  });

  const openApply = (role: Role) => {
    setSelectedRole(role);
    setForm((prev) => ({ ...prev, role_id: role.id }));
  };

  const heroStats = useMemo(
    () => [
      { icon: Heart, label: "Equipe dedicada", desc: "Mentorias, ensaios e feedback contínuo" },
      { icon: Handshake, label: "Escalas organizadas", desc: "Cultos, quinta e eventos especiais" },
      { icon: Target, label: "Processo claro", desc: "Envio de referência, triagem e ensaio presencial" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div 
        className="relative pt-24 pb-12 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative container mx-auto px-4 grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-6">
            <Badge className="bg-primary/15 text-primary border border-primary/30">Vale Music</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Audições abertas para Vale Music
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Veja os ministérios e outros ministérios, funções disponíveis, envie seu material e participe das próximas seleções.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-4 flex gap-3 items-start">
                  <item.icon className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-soft border-border/60 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Como funciona</CardTitle>
              <CardDescription>Processo simples para participar das audições.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm">
                <li>Escolha a função aberta que combina com você.</li>
                <li>Envie seus dados e um link de referência (vídeo ou áudio curto).</li>
                <li>Aguarde nosso retorno com orientações e agendamento de ensaio.</li>
                <li>Participe do ensaio presencial para avaliação conjunta.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-primary text-xs uppercase tracking-widest font-semibold">Audições</p>
              <h2 className="font-display text-3xl font-bold text-foreground">Vagas por ministério</h2>
            </div>
          </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-40 rounded-xl bg-card animate-pulse border border-border/50" />
            ))}
          </div>
        ) : !ministries || ministries.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma audição aberta no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ministries.map((ministry) => (
              <Card key={ministry.id} className="border-border/70 shadow-card">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getMinistryIcon(ministry.audition_roles)}
                    <CardTitle>{ministry.name}</CardTitle>
                  </div>
                  {ministry.description && <CardDescription>{ministry.description}</CardDescription>}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">Funções abertas: {ministry.audition_roles?.length || 0}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ministry.audition_roles && ministry.audition_roles.length > 0 ? (
                    ministry.audition_roles.map((role) => (
                      <div
                        key={role.id}
                        className="rounded-lg border border-border/70 p-3 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getRoleIcon(role.name)}
                            <Badge variant="outline">{role.name}</Badge>
                            {role.slots ? (
                              <Badge variant="secondary">{role.slots} vagas</Badge>
                            ) : (
                              <Badge variant="secondary">Vagas abertas</Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-muted-foreground leading-snug">{role.description}</p>
                          )}
                        </div>
                        <Button size="sm" onClick={() => openApply(role)}>
                          Quero me inscrever
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma função aberta neste ministério.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>

      <Dialog open={!!selectedRole} onOpenChange={(open) => !open && setSelectedRole(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Inscrição para {selectedRole?.name}</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Preencha o formulário abaixo com seus dados. Os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name" className="font-semibold">Nome completo *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Seu nome completo"
                required
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Como você gostaria de ser creditado</p>
            </div>
            
            <div className="grid gap-2 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Usaremos para contato</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-semibold">Celular</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(11) 9XXXX-XXXX"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Com WhatsApp se possível</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="music_link" className="font-semibold">Link de referência (vídeo/áudio) - caso tenha</Label>
              <Input
                id="music_link"
                value={form.music_link}
                onChange={(e) => setForm({ ...form, music_link: e.target.value })}
                placeholder="YouTube, Google Drive, Dropbox, etc"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Envie um vídeo ou áudio curto da sua performance (opcional)</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-semibold">Conte um pouco da sua experiência</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Descreva sua experiência com música, tempo que participa de ministério, estilos musicais que trabalha, etc"
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">Breve resumo da sua jornada musical (opcional)</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedRole(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => applyMutation.mutate()} 
              disabled={applyMutation.isPending || !form.full_name || !form.email}
              className="w-full sm:w-auto"
            >
              {applyMutation.isPending ? "Enviando..." : "Enviar inscrição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AuditionsPage;
