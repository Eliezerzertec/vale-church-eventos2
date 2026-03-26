import { useState, useMemo, useEffect } from "react";
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
import { Search, Edit2, Trash2, FileCheck, ExternalLink, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";

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
  payments?: any[];
}

const AdminRegistrations = () => {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [deletingRegId, setDeletingRegId] = useState<string | null>(null);
  const [receiptsModal, setReceiptsModal] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "", status: "" });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, events(title), payments(id, status, receipt_url, amount)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });
  const { data: events } = useQuery({
    queryKey: ["admin-events-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id,title")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Polling automático a cada 60 segundos para verificar status de pagamento
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Verificando status de pagamentos...");
      refetch();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [refetch]);

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
      // 1. Primeiro deletar o pagamento vinculado (se existir)
      const { error: paymentError } = await supabase
        .from("payments")
        .delete()
        .eq("registration_id", regId);
      
      if (paymentError) {
        console.warn("Aviso ao deletar pagamento:", paymentError);
        // Continua mesmo se não tiver pagamento
      }

      // 2. Depois deletar a inscrição
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
    if (!search.trim() && eventFilter === "all") return registrations;
    const q = search.toLowerCase();
    return registrations.filter((reg) => {
      const eventTitle = (reg.events as any)?.title || "";
      const matchText =
        eventTitle.toLowerCase().includes(q) ||
        reg.full_name.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q);
      const matchEvent = eventFilter === "all" || reg.event_id === eventFilter;
      return matchText && matchEvent;
    });
  }, [registrations, search, eventFilter]);

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

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      // Formatar dados para exportação
      const dataToExport = (filtered || []).map((reg) => ({
        "ID": reg.id,
        "Nome": reg.full_name,
        "Email": reg.email,
        "Telefone": reg.phone || "-",
        "CPF": reg.cpf || "-",
        "Evento": (reg.events as any)?.title || "N/A",
        "Status": statusMap[reg.status]?.label || reg.status,
        "Data Inscrição": format(new Date(reg.created_at), "dd/MM/yyyy", { locale: ptBR }),
        "Hora": format(new Date(reg.created_at), "HH:mm:ss", { locale: ptBR }),
        "Pagamento": reg.payments?.[0]?.status === "paid" ? "Pago" : "Pendente",
      }));

      if (dataToExport.length === 0) {
        toast({
          title: "Nenhum dado",
          description: "Não há inscrições para exportar com os filtros aplicados",
          variant: "destructive",
        });
        return;
      }

      // Criar workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Definir larguras das colunas
      worksheet["!cols"] = [
        { wch: 36 }, // ID
        { wch: 20 }, // Nome
        { wch: 25 }, // Email
        { wch: 15 }, // Telefone
        { wch: 15 }, // CPF
        { wch: 30 }, // Evento
        { wch: 15 }, // Status
        { wch: 15 }, // Data
        { wch: 12 }, // Hora
        { wch: 12 }, // Pagamento
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Inscritos");

      // Salvar arquivo
      const fileName = `Inscritos_${format(new Date(), "dd-MM-yyyy_HH-mm-ss", { locale: ptBR })}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "✅ Exportação Concluída",
        description: `${dataToExport.length} inscritos exportados para Excel`,
      });

      console.log(`📥 Arquivo baixado: ${fileName}`);
    } catch (error) {
      console.error("❌ Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXML = async () => {
    try {
      setIsExporting(true);

      if ((filtered || []).length === 0) {
        toast({
          title: "Nenhum dado",
          description: "Não há inscrições para exportar com os filtros aplicados",
          variant: "destructive",
        });
        return;
      }

      // Gerar XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<Inscritos>\n';

      (filtered || []).forEach((reg) => {
        const eventName = ((reg.events as any)?.title || "N/A").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        const status = statusMap[reg.status]?.label || reg.status;
        const paymentStatus = reg.payments?.[0]?.status === "paid" ? "Pago" : "Pendente";

        xml += '  <Inscrito>\n';
        xml += `    <ID>${reg.id}</ID>\n`;
        xml += `    <Nome>${reg.full_name}</Nome>\n`;
        xml += `    <Email>${reg.email}</Email>\n`;
        xml += `    <Telefone>${reg.phone || "-"}</Telefone>\n`;
        xml += `    <CPF>${reg.cpf || "-"}</CPF>\n`;
        xml += `    <Evento>${eventName}</Evento>\n`;
        xml += `    <Status>${status}</Status>\n`;
        xml += `    <DataInscricao>${format(new Date(reg.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</DataInscricao>\n`;
        xml += `    <StatusPagamento>${paymentStatus}</StatusPagamento>\n`;
        xml += `    <DataCadastro>${format(new Date(reg.created_at), "yyyy-MM-dd", { locale: ptBR })}</DataCadastro>\n`;
        xml += '  </Inscrito>\n';
      });

      xml += '</Inscritos>';

      // Obter nome do evento para o arquivo
      let eventFileName = "Inscritos";
      if (eventFilter !== "all") {
        const selectedEventName = events?.find((ev: any) => ev.id === eventFilter)?.title || "Evento";
        // Remover caracteres especiais do nome do evento
        eventFileName = selectedEventName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
      }

      // Criar blob e download
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      const fileName = `${eventFileName}_${format(new Date(), "dd-MM-yyyy_HH-mm-ss", { locale: ptBR })}.xml`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "✅ Exportação Concluída",
        description: `${(filtered || []).length} inscritos exportados para XML`,
      });

      console.log(`📥 Arquivo baixado: ${fileName}`);
    } catch (error) {
      console.error("❌ Erro ao exportar XML:", error);
      toast({
        title: "Erro na exportação",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <h1 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">Inscrições</h1>

      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por evento, nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full md:gap-4">
            <Label className="whitespace-nowrap text-sm text-muted-foreground">Filtrar por evento</Label>
            <Select value={eventFilter} onValueChange={(v) => setEventFilter(v)}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Todos os eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {events?.map((ev: any) => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={handleExportExcel}
              disabled={isExporting || !filtered?.length}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 md:flex-initial text-xs md:text-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Excel</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleExportXML}
              disabled={isExporting || !filtered?.length}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 md:flex-initial text-xs md:text-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">XML</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        {/* Tabela para desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma inscrição encontrada.</TableCell></TableRow>
              ) : (
                filtered.map((reg) => {
                  const s = statusMap[reg.status] || statusMap.pending;
                  const hasReceipt = reg.payments && reg.payments.some((p: any) => p.receipt_url);
                  const receipt = reg.payments?.find((p: any) => p.receipt_url);
                  
                  return (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium text-sm">{reg.full_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{reg.email}</TableCell>
                      <TableCell className="text-xs">{(reg.events as any)?.title || "-"}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${s.className}`}>{s.label}</span>
                      </TableCell>
                      <TableCell>
                        {hasReceipt && receipt ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 h-7 w-7 p-0"
                            onClick={() => setReceiptsModal(reg)}
                            title="Visualizar comprovante"
                          >
                            <FileCheck className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(reg.created_at), "dd/MM", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(reg)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(reg.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards para mobile */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma inscrição encontrada.</div>
          ) : (
            <div className="space-y-2 p-2">
              {filtered.map((reg) => {
                const s = statusMap[reg.status] || statusMap.pending;
                const hasReceipt = reg.payments && reg.payments.some((p: any) => p.receipt_url);

                return (
                  <div key={reg.id} className="bg-background border border-border/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{reg.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.className}`}>
                        {s.label}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                      <p>🎉 {(reg.events as any)?.title || "-"}</p>
                      <p>📅 {format(new Date(reg.created_at), "dd/MM", { locale: ptBR })}</p>
                    </div>

                    <div className="pt-2 border-t border-border/20 flex gap-1 justify-between">
                      {hasReceipt ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 text-xs flex-1 h-7"
                          onClick={() => setReceiptsModal(reg)}
                        >
                          <FileCheck className="h-3 w-3" />
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs flex-1 h-7"
                        onClick={() => handleEditClick(reg)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive text-xs flex-1 h-7"
                        onClick={() => handleDeleteClick(reg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

      {/* Dialog de Comprovantes */}
      <Dialog open={!!receiptsModal} onOpenChange={(open) => !open && setReceiptsModal(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento - {receiptsModal?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {receiptsModal?.payments?.filter((p: any) => p.receipt_url).map((payment: any) => (
              <div key={payment.id} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">Pagamento</p>
                    <p className="text-xs text-muted-foreground">ID: {payment.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">R$ {(payment.amount / 100).toFixed(2).replace('.', ',')}</p>
                    <p className={`text-xs font-semibold ${
                      payment.status === 'paid' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {payment.status === 'paid' ? '✅ PAGO' : '⏳ PENDENTE'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    onClick={() => window.open(payment.receipt_url, "_blank")}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir Comprovante da AbacatePay
                  </Button>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
                  <p className="font-semibold mb-1">📋 URL do Comprovante:</p>
                  <p className="break-all font-mono">{payment.receipt_url}</p>
                </div>
              </div>
            ))}
            
            {!receiptsModal?.payments?.some((p: any) => p.receipt_url) && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum comprovante de pagamento disponível
              </div>
            )}
          </div>
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
