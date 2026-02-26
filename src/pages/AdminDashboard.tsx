import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      };
    },
  });

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
      </div>
    </div>
  );
};

export default AdminDashboard;
