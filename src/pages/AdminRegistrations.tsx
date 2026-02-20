import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmada", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700" },
};

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  status: string;
  created_at: string;
  event_id: string;
  events: any;
}

const AdminRegistrations = () => {
  const [search, setSearch] = useState("");
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [deletingRegId, setDeletingRegId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "", status: "" });
  const { toast } = useToast();

  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, events(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedReg: Partial<Registration> & { id: string }) => {
      const { id, ...updates } = updatedReg;
      const { error } = await supabase
        .from("event_registrations")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Inscrição atualizada com sucesso" });
      setEditingReg(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar inscrição",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (regId: string) => {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", regId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Inscrição deletada com sucesso" });
      setDeletingRegId(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar inscrição",
        variant: "destructive",
      });
    },
  });

  const filtered = useMemo(() => {
    if (!registrations) return [];
    if (!search.trim()) return registrations;
    const q = search.toLowerCase();
    return registrations.filter((reg) => {
      const eventTitle = (reg.events as any)?.title || "";
      return (
        eventTitle.toLowerCase().includes(q) ||
        reg.full_name.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q)
      );
    });
  }, [registrations, search]);

  const handleEditClick = (reg: Registration) => {
    setEditingReg(reg);
    setEditForm({
      full_name: reg.full_name,
      email: reg.email,
      phone: reg.phone || "",
      status: reg.status,
    });
  };

  const handleSaveEdit = () => {
    if (!editingReg) return;
    updateMutation.mutate({
      id: editingReg.id,
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone,
      status: editForm.status,
    });
  };

  const handleDeleteClick = (regId: string) => {
    setDeletingRegId(regId);
  };

  const handleConfirmDelete = () => {
    if (deletingRegId) {
      deleteMutation.mutate(deletingRegId);
    }
  };

  const colSpan = 7;

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Inscrições</h1>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por evento, nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">Nenhuma inscrição encontrada.</TableCell></TableRow>
            ) : (
              filtered.map((reg) => {
                const s = statusMap[reg.status] || statusMap.pending;
                return (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{reg.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{reg.phone || "-"}</TableCell>
                    <TableCell className="text-sm">{(reg.events as any)?.title || "-"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${s.className}`}>{s.label}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(reg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(reg)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(reg.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={!!editingReg} onOpenChange={(open) => !open && setEditingReg(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Inscrição</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Celular</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReg(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Deleção */}
      <AlertDialog open={!!deletingRegId} onOpenChange={(open) => !open && setDeletingRegId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Inscrição?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta inscrição? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRegistrations;
