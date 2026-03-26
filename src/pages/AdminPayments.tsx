import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { abacatepay } from "@/integrations/abacatepay/client";
import { formatCurrency } from "@/integrations/abacatepay/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, ExternalLink, CheckCircle, Clock, XCircle, RefreshCw, Zap } from "lucide-react";
import { useState } from "react";

const statusMap: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pendente", icon: Clock, className: "text-yellow-600 bg-yellow-50" },
  paid: { label: "Pago", icon: CheckCircle, className: "text-green-600 bg-green-50" },
  failed: { label: "Falhou", icon: XCircle, className: "text-red-600 bg-red-50" },
  refunded: { label: "Reembolsado", icon: RefreshCw, className: "text-blue-600 bg-blue-50" },
  expired: { label: "Expirado", icon: Clock, className: "text-gray-600 bg-gray-50" },
};

const AdminPayments = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Buscar pagamentos simples (sem relacionamentos complexos)
  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar inscrições para enriquecer dados dos pagamentos
  const { data: registrations } = useQuery({
    queryKey: ["admin-registrations-for-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id, full_name, email, cpf, status, event_id, events(title, event_date)");

      if (error) throw error;
      return data || [];
    },
  });

  // Buscar inscrições confirmadas para ver status de pagamentos
  const { data: unpaidRegistrations } = useQuery({
    queryKey: ["unpaid-registrations"],
    queryFn: async () => {
      // Buscar inscrições confirmadas com seus pagamentos
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select(`
          id,
          full_name,
          email,
          event_id,
          status,
          events(title, event_date),
          payments(id, status, amount)
        `)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      if (regError) throw regError;
      return registrations || [];
    },
  });

  // Mutation para criar cobrança
  const createPaymentMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const registration = unpaidRegistrations?.find((r) => r.id === registrationId);
      if (!registration) throw new Error("Inscrição não encontrada");

      const event = registration.events as any;
      const amountInReais = 500; // R$ 500,00 - configurar conforme necessário
      const amountInCents = Math.round(amountInReais * 100);

      // Criar cobrança no AbacatePay
      const billingPayload: any = {
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
          {
            name: `Inscrição - ${event.title}`,
            quantity: 1,
            price: amountInCents,
          },
        ],
        returnUrl: `${window.location.origin}/admin/pagamentos?pagamento=ok`,
        completionUrl: `${window.location.origin}/admin/pagamentos?pagamento=ok`,
        customer: {
          id: registration.email,
          metadata: {
            registration_id: registrationId,
            event_id: registration.event_id,
          },
        },
      };

      console.log("📋 Payload AdminPayments:", JSON.stringify(billingPayload, null, 2));

      const { data: billing, error } = await abacatepay.billing.create(billingPayload);

      if (error) throw new Error(error);

      // Salvar no banco de dados com status "pending" inicialmente
      const { data: insertedPayment, error: dbError } = await supabase
        .from("payments")
        .insert({
          registration_id: registrationId,
          amount: amountInReais,
          status: "pending",
          billing_id: billing.id,
          event_id: registration.event_id,
          registration_email: registration.email,
          registration_name: registration.full_name,
          payment_url: billing.url,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Depois marcar como "paid" e confirmado (admin já criou, então considera como pago)
      // Atualizar payment para "paid" e confirmar inscrição
      const { error: updatePaymentError } = await supabase
        .from("payments")
        .update({ 
          status: "paid",
          paid_at: new Date().toISOString()
        })
        .eq("id", insertedPayment.id);

      if (!updatePaymentError) {
        // Confirmar inscrição também
        await supabase
          .from("event_registrations")
          .update({ status: "confirmed" })
          .eq("id", registrationId)
          .eq("status", "pending");
        
        console.log("✅ Pagamento criado e confirmado (status: paid)");
      }

      return billing;
    },
    onSuccess: (billing) => {
      toast({
        title: "Sucesso",
        description: "Cobrança criada! Compartilhe o link com o participante.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar cobrança",
        variant: "destructive",
      });
    },
  });

  // Mutation para sincronizar status
  const syncPaymentMutation = useMutation({
    mutationFn: async (billingId: string) => {
      const { data: billing, error } = await abacatepay.billing.get(billingId);
      if (error) throw new Error(error);

      // Atualizar status no banco
      const { error: dbError } = await supabase
        .from("payments")
        .update({
          status: billing.status.toLowerCase() as any,
          updated_at: new Date().toISOString(),
        })
        .eq("billing_id", billingId);

      if (dbError) throw dbError;

      return billing;
    },
    onSuccess: () => {
      toast({
        title: "Sincronizado",
        description: "Status atualizado com sucesso",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast({ title: "Link copiado!", description: "Link de pagamento copiado para a área de transferência" });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Pagamentos</h1>
        <p className="text-muted-foreground">Gerencie cobranças e pagamentos dos eventos</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Coletado",
            value: formatCurrency(
              payments
                ?.filter((p) => p.status === "paid")
                .reduce((sum, p) => sum + p.amount, 0) || 0
            ),
            color: "bg-green-50",
          },
          {
            label: "Pendente",
            value: payments?.filter((p) => p.status === "pending").length || 0,
            color: "bg-yellow-50",
          },
          {
            label: "Falhados",
            value: payments?.filter((p) => p.status === "failed").length || 0,
            color: "bg-red-50",
          },
          {
            label: "Total de Pagamentos",
            value: payments?.length || 0,
            color: "bg-blue-50",
          },
        ].map((stat, i) => (
          <Card key={i} className={`${stat.color} border-0`}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inscrições sem cobrança */}
      {unpaidRegistrations && unpaidRegistrations.length > 0 && (
        <Card className="shadow-soft border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Zap className="h-5 w-5" />
              {unpaidRegistrations.length} Inscrições não Faturadas
            </CardTitle>
            <CardDescription>Crie cobranças para essas inscrições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unpaidRegistrations.map((reg: any) => (
                <div key={reg.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{reg.full_name}</p>
                    <p className="text-sm text-muted-foreground">{reg.email} • {reg.events?.title}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => createPaymentMutation.mutate(reg.id)}
                    disabled={createPaymentMutation.isPending}
                  >
                    Criar Cobrança
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Pagamentos */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando pagamentos...
                    </TableCell>
                  </TableRow>
                ) : payments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum pagamento registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  payments?.map((payment: any) => {
                    const status = statusMap[payment.status] || statusMap.pending;
                    const StatusIcon = status.icon;
                    
                    // Buscar inscrição correspondente
                    const reg = registrations?.find((r: any) => r.id === payment.registration_id);
                    const event = reg?.events as any;

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{reg?.full_name || "N/A"}</TableCell>
                        <TableCell className="text-sm">{reg?.email || "N/A"}</TableCell>
                        <TableCell>{event?.title || "N/A"}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${status.className}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(payment.created_at), "dd/MMM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="space-x-1">
                          {payment.payment_url && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyUrl(payment.payment_url)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(payment.payment_url, "_blank")}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {payment.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncPaymentMutation.mutate(payment.billing_id)}
                              disabled={syncPaymentMutation.isPending}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
