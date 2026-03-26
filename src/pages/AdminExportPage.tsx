import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function AdminExportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados de filtro
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Query para obter lista de eventos
  const { data: events } = useQuery({
    queryKey: ["export-events"],
    queryFn: async () => {
      const res = await fetch("/api/export/events-list");
      const json = await res.json();
      return json.data || [];
    },
  });

  // Query para obter registros com filtros
  const { data: registrations, isLoading: isLoadingData } = useQuery({
    queryKey: ["export-registrations", selectedEvent, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEvent !== "all") params.append("eventId", selectedEvent);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/export/registrations?${params}`);
      const json = await res.json();
      return json.data || [];
    },
  });

  const handleExportExcel = async () => {
    if (!registrations || registrations.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Ajuste os filtros e tente novamente",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);

      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // Aba 1: Dados detalhados
      const worksheet1 = XLSX.utils.json_to_sheet(registrations);

      // Definir larguras das colunas
      const colWidths = [
        { wch: 20 }, // ID
        { wch: 25 }, // Nome
        { wch: 25 }, // Email
        { wch: 15 }, // Telefone
        { wch: 15 }, // CPF
        { wch: 15 }, // Status Inscrição
        { wch: 30 }, // Evento
        { wch: 15 }, // Data Evento
        { wch: 20 }, // Local
        { wch: 15 }, // Preço
        { wch: 15 }, // Status Pagamento
        { wch: 15 }, // Valor Pago
        { wch: 15 }, // Pago em
        { wch: 15 }, // Data Inscrição
        { wch: 15 }, // Hora Inscrição
      ];
      worksheet1["!cols"] = colWidths;

      // Estilos nas células headers (primeira linha)
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      // Aplicar estilo aos headers
      const headerRow = worksheet1["!ref"]?.split(":")[0] || "A1";
      for (let col = 0; col < Object.keys(registrations[0] || {}).length; col++) {
        const cellRef = XLSX.utils.encode_col(col) + "1";
        if (worksheet1[cellRef]) {
          worksheet1[cellRef].s = headerStyle;
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet1, "Inscritos");

      // Aba 2: Resumo/Estatísticas
      const statsData = [
        ["📊 RELATÓRIO DE INSCRITOS"],
        [],
        ["Data do Relatório:", new Date().toLocaleDateString("pt-BR")],
        ["Horário:", new Date().toLocaleTimeString("pt-BR")],
        [],
        ["Filtros Aplicados:"],
        ["Evento:", selectedEvent === "all" ? "TODOS" : selectedEvent],
        ["De:", dateFrom || "Início"],
        ["Até:", dateTo || "Agora"],
        [],
        ["📈 ESTATÍSTICAS:"],
        ["Total de Inscritos:", registrations.length],
        [
          "Confirmados:",
          registrations.filter((r) => r["Status Inscrição"] === "confirmed").length,
        ],
        ["Pendentes:", registrations.filter((r) => r["Status Inscrição"] === "pending").length],
        ["Cancelados:", registrations.filter((r) => r["Status Inscrição"] === "cancelled").length],
        [],
        ["Pagamentos:"],
        ["Pagos:", registrations.filter((r) => r["Status Pagamento"] === "paid").length],
        ["Pendentes:", registrations.filter((r) => r["Status Pagamento"] === "pending").length],
        [],
        [
          "Valor Total Recebido:",
          `R$ ${registrations
            .filter((r) => r["Status Pagamento"] === "paid")
            .reduce((sum, r) => {
              const valor = r["Valor Pago"]?.replace("R$ ", "")?.replace(",", ".") || "0";
              return sum + parseFloat(valor);
            }, 0)
            .toFixed(2)}`,
        ],
      ];

      const worksheet2 = XLSX.utils.aoa_to_sheet(statsData);
      worksheet2["!cols"] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, worksheet2, "Resumo");

      // Aba 3: Por Evento
      if (selectedEvent === "all") {
        const byEvent = {};
        registrations.forEach((reg) => {
          const evento = reg["Evento"];
          if (!byEvent[evento]) byEvent[evento] = [];
          byEvent[evento].push(reg);
        });

        Object.entries(byEvent).forEach(([eventName, data]) => {
          const eventData = (data as any[]).map((reg) => ({
            Nome: reg["Nome Completo"],
            Email: reg["Email"],
            Status: reg["Status Inscrição"],
            Pagamento: reg["Status Pagamento"],
          }));
          const ws = XLSX.utils.json_to_sheet(eventData);
          XLSX.utils.book_append_sheet(workbook, ws, eventName.substring(0, 31)); // Máx 31 caracteres
        });
      }

      // Salvar arquivo
      const fileName = `Inscritos_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "✅ Exportação Concluída",
        description: `${registrations.length} inscritos exportados para Excel`,
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

  // Definir datas padrão (semana atual)
  useEffect(() => {
    const today = new Date();
    // Voltar para o início da semana (segunda)
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay() + 1);

    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Exportar Inscritos</h1>
            <p className="text-muted-foreground mt-1">
              Exporte os inscritos em eventos com filtros de data e evento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
              <CardDescription>Escolha seus critérios de busca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtro de Evento */}
              <div className="space-y-2">
                <Label htmlFor="event">Evento</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {events?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} ({event.date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data De */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data De</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Data Até */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">Data Até</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Botão de Exportação */}
              <Button
                onClick={handleExportExcel}
                disabled={isExporting || !registrations?.length}
                className="w-full mt-6"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="text-xs text-muted-foreground p-3 bg-secondary rounded">
                <p className="font-semibold mb-2">ℹ️ Info:</p>
                <ul className="space-y-1">
                  <li>• {registrations?.length || 0} inscritos encontrados</li>
                  <li>• 3 abas: Detalhes, Resumo, Por Evento</li>
                  <li>• Formatação automática</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preview de Dados */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Preview dos Dados</CardTitle>
              <CardDescription>
                {registrations?.length || 0} inscritos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : registrations?.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <p>Nenhum inscrito encontrado com esses filtros</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table className="text-xs">
                    <TableHeader className="sticky top-0 bg-secondary">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Inscrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations?.slice(0, 20).map((reg, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium truncate max-w-xs">
                            {reg["Nome Completo"]}
                          </TableCell>
                          <TableCell className="truncate max-w-xs">{reg["Email"]}</TableCell>
                          <TableCell className="truncate max-w-xs">{reg["Evento"]}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                reg["Status Inscrição"] === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : reg["Status Inscrição"] === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {reg["Status Inscrição"]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                reg["Status Pagamento"] === "paid"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {reg["Status Pagamento"]}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {reg["Data Inscrição"]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {registrations?.length > 20 && (
                    <p className="text-xs text-muted-foreground p-4 border-t">
                      Mostrando 20 de {registrations.length} registros. Todos serão exportados.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
