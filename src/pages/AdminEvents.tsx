import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Upload, X, Image } from "lucide-react";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type EventForm = {
  title: string;
  description: string;
  event_date: string;
  location: string;
  price: string;
  max_capacity: string;
  is_free: boolean;
  image_url: string;
  is_active: boolean;
  coupon_id?: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  price: "0",
  max_capacity: "",
  is_free: true,
  image_url: "",
  is_active: true,
};

const AdminEvents = () => {
  const safeUUID = () => {
    try {
      // Usa crypto.randomUUID quando disponível (navegadores modernos)
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch (err) {
      console.warn("randomUUID indisponível, usando fallback", err);
    }
    // Fallback simples
    return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: couponsResponse } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await fetch('/api/coupons/list');
      const data = await res.json();
      return data?.data || [];
    },
    refetchInterval: 5000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description || null,
        event_date: form.event_date,
        location: form.location || null,
        price: form.is_free ? 0 : parseFloat(form.price) || 0,
        max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
        is_free: form.is_free,
        image_url: form.image_url || null,
        is_active: form.is_active,
        coupon_id: form.coupon_id || null,
      };
      if (editId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast({ title: editId ? "Evento atualizado!" : "Evento criado!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Evento excluído!" });
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione um arquivo de imagem", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erro", description: "Imagem deve ter no máximo 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `event-${safeUUID()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: publicUrl }));
      setPreviewUrl(publicUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (err: any) {
      console.error("Upload de imagem falhou", err);
      toast({ title: "Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (event: any) => {
    setEditId(event.id);
    setForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date?.slice(0, 16) || "",
      location: event.location || "",
      price: String(event.price || 0),
      max_capacity: event.max_capacity ? String(event.max_capacity) : "",
      is_free: event.is_free,
      image_url: event.image_url || "",
      is_active: event.is_active,
      coupon_id: event.coupon_id || "",
    });
    setPreviewUrl(event.image_url || null);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Eventos</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm(emptyForm); setPreviewUrl(null); } }}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-secondary font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editId ? "Editar Evento" : "Novo Evento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Data e Hora *</Label>
                <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
              </div>
              <div>
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: v })} />
                <Label>Evento Gratuito</Label>
              </div>
              {!form.is_free && (
                <div>
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              )}
              <div>
                <Label>Capacidade Máxima</Label>
                <Input type="number" min="1" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: e.target.value })} placeholder="Sem limite" />
              </div>
              <div>
                <Label>Cupom de Desconto (Opcional)</Label>
                <select
                  value={form.coupon_id || ""}
                  onChange={(e) => setForm({ ...form, coupon_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  <option value="">Nenhum cupom</option>
                  {couponsResponse?.map((coupon: any) => (
                    <option key={coupon.id} value={coupon.id}>
                      {coupon.code} - {coupon.discountKind === 'PERCENTAGE' ? `${coupon.discount}%` : `R$ ${(coupon.discount / 100).toFixed(2)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Imagem do Evento</Label>
                {(previewUrl || form.image_url) && (
                  <div className="relative mb-2 w-full h-32 rounded-lg overflow-hidden border border-border">
                    <img src={previewUrl || form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => { setPreviewUrl(null); setForm({ ...form, image_url: "" }); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Enviando..." : "Enviar Imagem"}
                  </Button>
                </div>
                <Input
                  value={form.image_url}
                  onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setPreviewUrl(e.target.value || null); }}
                  placeholder="Ou cole a URL da imagem..."
                  className="mt-2"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Evento Ativo</Label>
              </div>
              <Button type="submit" className="w-full gradient-gold text-secondary font-semibold" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar Evento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : events?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum evento cadastrado.</TableCell></TableRow>
            ) : (
              events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{event.is_free ? <span className="text-green-600 text-sm">Gratuito</span> : `R$ ${Number(event.price).toFixed(2)}`}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${event.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {event.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(event)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(event.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminEvents;
