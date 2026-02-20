import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, DollarSign, TrendingUp, FileText } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 76% 36%)",
  "hsl(48 96% 53%)",
  "hsl(0 84% 60%)",
  "hsl(217 91% 60%)",
];

const AdminReports = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ["report-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("id, title, event_date, is_free, price, max_capacity").order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch registrations
  const { data: registrations } = useQuery({
    queryKey: ["report-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_registrations").select("*, events(title, event_date)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch payments
  const { data: payments } = useQuery({
    queryKey: ["report-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, event_registrations(event_id, events(title))").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // --- Report: Inscrições por Evento ---
  const registrationsByEvent = useMemo(() => {
    if (!registrations || !events) return [];
    return events.map((ev) => {
      const regs = registrations.filter((r) => r.event_id === ev.id);
      return {
        name: ev.title.length > 20 ? ev.title.substring(0, 20) + "…" : ev.title,
        fullName: ev.title,
        total: regs.length,
        confirmados: regs.filter((r) => r.status === "confirmed").length,
        pendentes: regs.filter((r) => r.status === "pending").length,
        cancelados: regs.filter((r) => r.status === "cancelled").length,
        capacidade: ev.max_capacity || 0,
      };
    });
  }, [registrations, events]);

  // --- Report: Financeiro por Evento ---
  const financialByEvent = useMemo(() => {
    if (!payments || !events) return [];
    return events
      .filter((ev) => !ev.is_free)
      .map((ev) => {
        const eventPayments = payments.filter((p) => {
          const reg = p.event_registrations as any;
          return reg?.event_id === ev.id;
        });
        const paid = eventPayments.filter((p) => p.status === "paid");
        const pending = eventPayments.filter((p) => p.status === "pending");
        return {
          name: ev.title.length > 20 ? ev.title.substring(0, 20) + "…" : ev.title,
          fullName: ev.title,
          receitaTotal: paid.reduce((s, p) => s + Number(p.amount), 0),
          pendente: pending.reduce((s, p) => s + Number(p.amount), 0),
          totalPagos: paid.length,
          totalPendentes: pending.length,
        };
      });
  }, [payments, events]);

  const financialTotals = useMemo(() => {
    if (!payments) return { revenue: 0, pending: 0, paid: 0, total: 0 };
    const paid = payments.filter((p) => p.status === "paid");
    const pend = payments.filter((p) => p.status === "pending");
    return {
      revenue: paid.reduce((s, p) => s + Number(p.amount), 0),
      pending: pend.reduce((s, p) => s + Number(p.amount), 0),
      paid: paid.length,
      total: payments.length,
    };
  }, [payments]);

  // --- Report: Inscritos por Período (últimos 6 meses) ---
  const registrationsByMonth = useMemo(() => {
    if (!registrations) return [];
    const now = new Date();
    const start = startOfMonth(subMonths(now, 5));
    const end = endOfMonth(now);
    const months = eachMonthOfInterval({ start, end });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const count = registrations.filter((r) => {
        const d = parseISO(r.created_at);
        return d >= monthStart && d <= monthEnd;
      }).length;
      return {
        month: format(month, "MMM/yy", { locale: ptBR }),
        inscritos: count,
      };
    });
  }, [registrations]);

  // Payment status distribution
  const paymentStatusDist = useMemo(() => {
    if (!payments) return [];
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      const label = p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : p.status === "failed" ? "Falhou" : "Reembolsado";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const chartConfigBar = {
    confirmados: { label: "Confirmados", color: "hsl(142 76% 36%)" },
    pendentes: { label: "Pendentes", color: "hsl(48 96% 53%)" },
    cancelados: { label: "Cancelados", color: "hsl(0 84% 60%)" },
  };

  const chartConfigLine = {
    inscritos: { label: "Inscritos", color: "hsl(var(--primary))" },
  };

  const chartConfigFinancial = {
    receitaTotal: { label: "Receita", color: "hsl(142 76% 36%)" },
    pendente: { label: "Pendente", color: "hsl(48 96% 53%)" },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Relatórios</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Inscrições</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{registrations?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Confirmados</span>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{registrations?.filter((r) => r.status === "confirmed").length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Receita Total</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">R$ {financialTotals.revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pgtos Pendentes</span>
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">R$ {financialTotals.pending.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inscricoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inscricoes">Inscrições por Evento</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="periodo">Inscritos por Período</TabsTrigger>
        </TabsList>

        {/* Tab: Inscrições por Evento */}
        <TabsContent value="inscricoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inscrições por Evento</CardTitle>
            </CardHeader>
            <CardContent>
              {registrationsByEvent.length > 0 ? (
                <ChartContainer config={chartConfigBar} className="h-[350px] w-full">
                  <BarChart data={registrationsByEvent} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" fontSize={11} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="confirmados" fill="var(--color-confirmados)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pendentes" fill="var(--color-pendentes)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelados" fill="var(--color-cancelados)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Sem dados disponíveis.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Detalhes por Evento</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Confirmados</TableHead>
                    <TableHead className="text-center">Pendentes</TableHead>
                    <TableHead className="text-center">Cancelados</TableHead>
                    <TableHead className="text-center">Capacidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsByEvent.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem dados.</TableCell></TableRow>
                  ) : (
                    registrationsByEvent.map((ev, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{ev.fullName}</TableCell>
                        <TableCell className="text-center font-semibold">{ev.total}</TableCell>
                        <TableCell className="text-center text-green-600">{ev.confirmados}</TableCell>
                        <TableCell className="text-center text-yellow-600">{ev.pendentes}</TableCell>
                        <TableCell className="text-center text-red-600">{ev.cancelados}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{ev.capacidade || "∞"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Receita por Evento</CardTitle></CardHeader>
              <CardContent>
                {financialByEvent.length > 0 ? (
                  <ChartContainer config={chartConfigFinancial} className="h-[300px] w-full">
                    <BarChart data={financialByEvent} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="name" angle={-30} textAnchor="end" fontSize={11} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="receitaTotal" fill="var(--color-receitaTotal)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pendente" fill="var(--color-pendente)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Nenhum evento pago.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Distribuição de Pagamentos</CardTitle></CardHeader>
              <CardContent>
                {paymentStatusDist.length > 0 ? (
                  <ChartContainer config={{}} className="h-[300px] w-full">
                    <PieChart>
                      <Pie data={paymentStatusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {paymentStatusDist.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Sem pagamentos.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Detalhes Financeiros por Evento</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead className="text-right">Receita (Pago)</TableHead>
                    <TableHead className="text-right">Pendente</TableHead>
                    <TableHead className="text-center">Nº Pagos</TableHead>
                    <TableHead className="text-center">Nº Pendentes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialByEvent.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sem dados.</TableCell></TableRow>
                  ) : (
                    financialByEvent.map((ev, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{ev.fullName}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">R$ {ev.receitaTotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-yellow-600">R$ {ev.pendente.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{ev.totalPagos}</TableCell>
                        <TableCell className="text-center">{ev.totalPendentes}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Inscritos por Período */}
        <TabsContent value="periodo" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Inscrições nos Últimos 6 Meses</CardTitle></CardHeader>
            <CardContent>
              {registrationsByMonth.length > 0 ? (
                <ChartContainer config={chartConfigLine} className="h-[350px] w-full">
                  <LineChart data={registrationsByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="inscritos" stroke="var(--color-inscritos)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Sem dados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
