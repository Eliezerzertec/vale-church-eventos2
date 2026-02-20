import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmada", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700" },
};

const AdminRegistrations = () => {
  const [search, setSearch] = useState("");

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*, events(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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

  const colSpan = 6;

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

export default AdminRegistrations;
