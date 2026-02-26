import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, RefreshCw } from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface WebhookLog {
  id: number;
  event: string;
  billing_id: string;
  request_body: any;
  response_status: string;
  error_message: string | null;
  created_at: string;
}

export default function WebhookMonitor() {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookLog | null>(
    null
  );
  const [isLive, setIsLive] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 100;

  // Carregar webhooks iniciais
  useEffect(() => {
    const loadInitialWebhooks = async () => {
      setIsLoading(true);
      try {
        // Primeiro, obter o total
        const { count, error: countError } = await supabase
          .from("webhook_logs")
          .select("*", { count: "exact", head: true });

        if (!countError && count !== null) {
          setTotalCount(count);
        }

        // Depois carregar os dados
        const { data, error } = await supabase
          .from("webhook_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .range(0, itemsPerPage - 1);

        if (!error && data) {
          setWebhooks(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialWebhooks();
  }, []);

  // Escutar webhooks em tempo real
  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel("webhook_logs_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "webhook_logs",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newLog = payload.new as WebhookLog;
            setWebhooks((prev) => [newLog, ...prev]);
            setTotalCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log("🔌 Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLive]);

  const handleCopyBillingId = (billingId: string) => {
    navigator.clipboard.writeText(billingId);
    alert("Billing ID copiado!");
  };

  const handleClearAll = async () => {
    if (confirm("Tem certeza que quer limpar todos os webhooks?")) {
      await supabase.from("webhook_logs").delete().neq("id", -1);
      setWebhooks([]);
      setSelectedWebhook(null);
      setTotalCount(0);
      setOffset(0);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(0, itemsPerPage - 1);

      if (!error && data) {
        setWebhooks(data);
        setOffset(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const newOffset = offset + itemsPerPage;
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(newOffset, newOffset + itemsPerPage - 1);

      if (!error && data && data.length > 0) {
        setWebhooks((prev) => [...prev, ...data]);
        setOffset(newOffset);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🔌 Webhook Monitor
              </h1>
              <p className="text-slate-400">
                Monitore os webhooks do AbacatePay em tempo real
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isLive ? "default" : "outline"}
                onClick={() => setIsLive(!isLive)}
                className="gap-2"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLive ? "bg-green-500 animate-pulse" : "bg-gray-500"
                  }`}
                />
                {isLive ? "🔴 Ao Vivo" : "⚫ Pausado"}
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-white">
                  {totalCount}
                </div>
                <p className="text-slate-400 text-sm">Total de Webhooks</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-400">
                  {webhooks.filter((w) => w.response_status === "200").length}
                </div>
                <p className="text-slate-400 text-sm">Sucessos (HTTP 200)</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-red-400">
                  {webhooks.filter((w) => w.response_status !== "200").length}
                </div>
                <p className="text-slate-400 text-sm">Erros</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Webhooks List */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1 h-fit max-h-[600px] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Webhooks Recebidos</CardTitle>
              <CardDescription className="text-slate-400">
                Total de {totalCount} webhooks • Mostrando {webhooks.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-lg">⏳ Aguardando webhooks...</p>
                  <p className="text-sm mt-2">
                    Os webhooks aparecerão aqui quando chegarem
                  </p>
                </div>
              ) : (
                <>
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      onClick={() => setSelectedWebhook(webhook)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedWebhook?.id === webhook.id
                          ? "bg-blue-900 border-blue-500 ring-2 ring-blue-500"
                          : "bg-slate-700 border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            webhook.response_status === "200"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {webhook.response_status}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(webhook.created_at).toLocaleTimeString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 font-mono truncate">
                        {webhook.billing_id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {webhook.event || "billing.paid"}
                      </p>
                    </div>
                  ))}

                  {webhooks.length < totalCount && (
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {isLoading ? "Carregando..." : "Carregar Mais"}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Details Panel */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1 h-fit max-h-[600px] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Detalhes do Webhook</CardTitle>
              {selectedWebhook && (
                <CardDescription className="text-slate-400">
                  {new Date(selectedWebhook.created_at).toLocaleString("pt-BR")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedWebhook ? (
                <div className="space-y-4">
                  {/* Billing ID */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      Billing ID
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-900 p-2 rounded text-sm text-slate-200 font-mono truncate">
                        {selectedWebhook.billing_id}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopyBillingId(selectedWebhook.billing_id)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      Status HTTP
                    </p>
                    <Badge
                      variant={
                        selectedWebhook.response_status === "200"
                          ? "default"
                          : "destructive"
                      }
                      className="w-full justify-center"
                    >
                      {selectedWebhook.response_status}
                    </Badge>
                  </div>

                  {/* Evento */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      Evento
                    </p>
                    <p className="text-slate-200">
                      {selectedWebhook.event || "billing.paid"}
                    </p>
                  </div>

                  {/* Request Body */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      Payload
                    </p>
                    <pre className="bg-slate-900 p-3 rounded text-xs text-slate-200 overflow-x-auto max-h-64 overflow-y-auto font-mono">
                      {JSON.stringify(
                        selectedWebhook.request_body,
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  {/* Error Message */}
                  {selectedWebhook.error_message && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        Erro
                      </p>
                      <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-sm text-red-400">
                        {selectedWebhook.error_message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>Selecione um webhook para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              ℹ️ Endpoint do Webhook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-2">
              Configure este endpoint no AbacatePay Dashboard:
            </p>
            <code className="block bg-slate-900 p-3 rounded text-sm text-green-400 font-mono border border-slate-700 mb-3">
              {window.location.origin}/api/webhook/abacatepay
            </code>
            <div className="text-sm text-slate-400">
              <p className="mb-2">
                <strong>Secret:</strong> Use o valor definido em <code className="text-yellow-400">ABACATEPAY_WEBHOOK_SECRET</code> no backend
              </p>
              <p className="mb-2">
                <strong>Headers requeridos:</strong>
                <ul className="ml-4 mt-1 text-xs text-slate-500">
                  <li>• X-Webhook-Secret: [seu_secret_aqui]</li>
                  <li>• X-Webhook-Signature: [HMAC-SHA256]</li>
                </ul>
              </p>
              <p className="text-xs text-slate-500 mt-3">
                ⚠️ Esta página monitora em tempo real via Websocket
                (Supabase Realtime)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
