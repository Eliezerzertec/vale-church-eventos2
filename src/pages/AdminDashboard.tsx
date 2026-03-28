import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
<<<<<<< HEAD
import { Calendar, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminDashboard = () => {
  // Stats principais
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [events, registrations, payments, allRegistrations] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("payments").select("amount, status"),
        supabase.from("event_registrations").select("*"),
      ]);
      
      const totalRevenue = payments.data
        ?.filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      const pendingPayments = payments.data?.filter((p) => p.status === "pending").length || 0;
      const pendingAmount = payments.data
        ?.filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        events: events.count || 0,
        confirmedRegistrations: registrations.count || 0,
        totalRegistrations: allRegistrations.data?.length || 0,
        revenue: totalRevenue,
        paidPayments: payments.data?.filter((p) => p.status === "paid").length || 0,
        pendingPayments,
        pendingAmount,
=======
import { Calendar, Users, CreditCard, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [events, registrations, payments] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount, status"),
      ]);
      const totalRevenue = payments.data
        ?.filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return {
        events: events.count || 0,
        registrations: registrations.count || 0,
        revenue: totalRevenue,
        paidPayments: payments.data?.filter((p) => p.status === "paid").length || 0,
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
      };
    },
  });

<<<<<<< HEAD
  // Eventos próximos
  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, event_date, is_free, price")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(5);
      return data || [];
    },
  });

  // Inscrições recentes
  const { data: recentRegistrations } = useQuery({
    queryKey: ["recent-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id, full_name, email, created_at, events(title), status")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  // Status de pagamentos
  const { data: paymentStats } = useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("status, amount");
      
      const paid = data?.filter((p) => p.status === "paid").length || 0;
      const pending = data?.filter((p) => p.status === "pending").length || 0;
      const failed = data?.filter((p) => p.status === "failed").length || 0;

      return { paid, pending, failed, total: data?.length || 0 };
    },
  });

  // Receita por evento
  const { data: revenueByEvent } = useQuery({
    queryKey: ["revenue-by-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("event_id, events(title), payments(amount, status)");
      
      const revenueMap: Record<string, { title: string; total: number; paid: number; count: number }> = {};
      
      data?.forEach((reg: any) => {
        const eventId = reg.event_id;
        const eventTitle = reg.events?.title || "Sem título";
        
        if (!revenueMap[eventId]) {
          revenueMap[eventId] = { title: eventTitle, total: 0, paid: 0, count: 0 };
        }
        
        revenueMap[eventId].count++;
        
        reg.payments?.forEach((payment: any) => {
          revenueMap[eventId].total += Number(payment.amount) || 0;
          if (payment.status === "paid") {
            revenueMap[eventId].paid += Number(payment.amount) || 0;
          }
        });
      });

      return Object.values(revenueMap)
        .sort((a, b) => b.paid - a.paid)
        .slice(0, 5);
    },
  });

  const mainCards = [
    { 
      label: "Eventos", 
      value: stats?.events || 0, 
      icon: Calendar, 
      color: "bg-blue-100 text-blue-600",
      subtext: "ativos"
    },
    { 
      label: "Inscrições Confirmadas", 
      value: stats?.confirmedRegistrations || 0, 
      icon: Users, 
      color: "bg-green-100 text-green-600",
      subtext: `de ${stats?.totalRegistrations || 0} total`
    },
    { 
      label: "Pagamentos Realizados", 
      value: stats?.paidPayments || 0, 
      icon: CheckCircle2, 
      color: "bg-emerald-100 text-emerald-600",
      subtext: `de ${(stats?.paidPayments || 0) + (stats?.pendingPayments || 0)}`
    },
    { 
      label: "Receita Confirmada", 
      value: `R$ ${(stats?.revenue || 0).toFixed(2)}`, 
      icon: TrendingUp, 
      color: "bg-purple-100 text-purple-600",
      subtext: "receita total"
    },
  ];

  const statusMap: Record<string, string> = {
    confirmed: "✅ Confirmada",
    pending: "⏳ Pendente",
    cancelled: "❌ Cancelada",
  };

  return (
    <div className="p-4 md:p-8 w-full space-y-8 bg-background min-h-screen">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPIs Principais */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-4 px-1">Métricas Principais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainCards.map((card) => (
            <div 
              key={card.label} 
              className="bg-white rounded-lg p-6 border border-border/20 hover:border-border/40 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">{card.label}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-2">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subtext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {stats?.pendingPayments ? (
        <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-900">Atenção: Pagamentos Pendentes</p>
            <p className="text-xs text-amber-800 mt-1">
              {stats.pendingPayments} pagamento{stats.pendingPayments !== 1 ? "s" : ""} aguardando confirmação · 
              <span className="font-bold"> R$ {(stats.pendingAmount / 100).toFixed(2)}</span> em espera
            </p>
          </div>
        </div>
      ) : null}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Eventos */}
        <div className="bg-white rounded-lg border border-border/20">
          <div className="px-6 py-4 border-b border-border/10">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Próximos Eventos</h2>
            </div>
          </div>
          <div className="divide-y divide-border/10">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 md:p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        📅 {format(new Date(event.event_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {event.is_free ? (
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">Gratuito</span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          R$ {Number(event.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Nenhum evento próximo
              </div>
            )}
          </div>
        </div>

        {/* Status de Pagamentos */}
        <div className="bg-white rounded-lg border border-border/20">
          <div className="px-6 py-4 border-b border-border/10">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Status de Pagamentos</h2>
            </div>
          </div>
          <div className="p-6">
            {paymentStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200/30">
                    <p className="text-lg font-bold text-emerald-700">{paymentStats.paid}</p>
                    <p className="text-xs text-emerald-600 mt-2 font-medium">Pagos</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200/30">
                    <p className="text-lg font-bold text-amber-700">{paymentStats.pending}</p>
                    <p className="text-xs text-amber-600 mt-2 font-medium">Pendentes</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200/30">
                    <p className="text-lg font-bold text-red-700">{paymentStats.failed}</p>
                    <p className="text-xs text-red-600 mt-2 font-medium">Falhados</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/10">
                  <p className="text-xs text-muted-foreground mb-3">
                    <span className="text-foreground font-semibold">Total:</span> {paymentStats.total} pagamentos
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200/30 rounded px-3 py-2">
                    <p className="text-xs font-semibold text-emerald-700">
                      Taxa de sucesso: {paymentStats.total > 0 ? ((paymentStats.paid / paymentStats.total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">Carregando...</p>
            )}
          </div>
        </div>
      </div>

      {/* Receita por Evento */}
      <div className="bg-white rounded-lg border border-border/20">
        <div className="px-6 py-4 border-b border-border/10">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Receita por Evento</h2>
          </div>
        </div>
        <div className="divide-y divide-border/10 max-h-96 overflow-y-auto">
          {revenueByEvent && revenueByEvent.length > 0 ? (
            revenueByEvent.map((event, idx) => (
              <div key={idx} className="p-4 md:p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.count} inscrição{event.count !== 1 ? "ões" : ""}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((event.paid / event.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Recebido: <span className="font-bold text-foreground">R$ {(event.paid / 100).toFixed(2)}</span>
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {event.total > 0 ? ((event.paid / event.total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Nenhum evento com inscrições
            </div>
          )}
        </div>
      </div>

      {/* Inscrições Recentes */}
      <div className="bg-white rounded-lg border border-border/20">
        <div className="px-6 py-4 border-b border-border/10">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Inscrições Recentes</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border/10">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Evento</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Data</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {recentRegistrations && recentRegistrations.length > 0 ? (
                recentRegistrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{reg.full_name}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{reg.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {(reg.events as any)?.title || "-"}
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {format(new Date(reg.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block whitespace-nowrap text-xs">
                        {statusMap[reg.status] || reg.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    Nenhuma inscrição recente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
=======
  const cards = [
    { label: "Eventos", value: stats?.events || 0, icon: Calendar, color: "text-primary" },
    { label: "Inscrições", value: stats?.registrations || 0, icon: Users, color: "text-blue-500" },
    { label: "Pagamentos", value: stats?.paidPayments || 0, icon: CreditCard, color: "text-green-500" },
    { label: "Receita", value: `R$ ${(stats?.revenue || 0).toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
      </div>
    </div>
  );
};

export default AdminDashboard;
