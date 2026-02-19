import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Pago", className: "bg-green-100 text-green-700" },
  failed: { label: "Falhou", className: "bg-red-100 text-red-700" },
  refunded: { label: "Reembolsado", className: "bg-blue-100 text-blue-700" },
};

const AdminPayments = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, event_registrations(full_name, email, events(title))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Pagamentos</h1>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participante</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Pgto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : payments?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum pagamento.</TableCell></TableRow>
            ) : (
              payments?.map((p) => {
                const s = statusMap[p.status] || statusMap.pending;
                const reg = p.event_registrations as any;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{reg?.full_name || "-"}</TableCell>
                    <TableCell className="text-sm">{reg?.events?.title || "-"}</TableCell>
                    <TableCell className="font-semibold">R$ {Number(p.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${s.className}`}>{s.label}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.paid_at ? format(new Date(p.paid_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminPayments;
