import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ABACATEPAY_KEYS = {
  dev: "abc_dev_wsc2xLB4mS4cjj2LX3DUryzY",
  prod: "abc_prod_S1DZarn5zgPxuxSndzzT4FNR",
};

const STORAGE_KEY = "abacatepay_mode";

export default function AdminPage() {
  const [mode, setMode] = useState<"dev" | "prod">("dev");
  const [backendStatus, setBackendStatus] = useState<"checking" | "ok" | "error">("checking");
  const [backendMode, setBackendMode] = useState<"dev" | "prod" | null>(null);
  const { toast } = useToast();

  // Carregar a preferência do localStorage
  useEffect(() => {
    const savedMode = (localStorage.getItem(STORAGE_KEY) as "dev" | "prod") || "dev";
    setMode(savedMode);
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/health");
      const data = await response.json();
      
      if (response.ok) {
        setBackendStatus("ok");
        // Detectar modo do backend
        if (data.mode?.includes("PRODUÇÃO")) {
          setBackendMode("prod");
        } else {
          setBackendMode("dev");
        }
      } else {
        setBackendStatus("error");
      }
    } catch (error) {
      setBackendStatus("error");
      console.error("Erro ao verificar backend:", error);
    }
  };

  const handleModeChange = (newMode: "dev" | "prod") => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    
    // Atualizar a chave no window para uso imediato
    (window as any).ABACATEPAY_MODE = newMode;
    (window as any).ABACATEPAY_KEY = ABACATEPAY_KEYS[newMode];

    toast({
      title: "✅ Modo Alterado!",
      description: `Agora em modo ${newMode === "dev" ? "DESENVOLVIMENTO 🟢" : "PRODUÇÃO 🔴"}. Recarregue a página para aplicar mudanças.`,
    });

    console.log(`🔄 Modo AbacatePay alterado para: ${newMode}`);
    console.log(`🔑 Chave: ${ABACATEPAY_KEYS[newMode].substring(0, 20)}...`);
  };

  const currentKey = ABACATEPAY_KEYS[mode];
  const isProduction = mode === "prod";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Configurações de Pagamento
            </h1>
          </div>
          <p className="text-slate-600">
            Alternar entre ambiente de desenvolvimento e produção do AbacatePay
          </p>
        </div>

        {/* Main Card - Mode Selector */}
        <Card className="mb-6 border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-4 h-4 rounded-full ${isProduction ? "bg-red-500" : "bg-green-500"} animate-pulse`}></div>
              <CardTitle className="text-2xl">Ambiente Atual</CardTitle>
            </div>
            <CardDescription>
              Escolha entre utilizar a chave de desenvolvimento (sandbox) ou produção (real)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            {/* Mode Selector */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-slate-800">
                Selecione o Ambiente
              </label>
              <Select value={mode} onValueChange={(v) => handleModeChange(v as "dev" | "prod")}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev" className="text-base">
                    <span className="flex items-center gap-2">
                      🟢 Desenvolvimento (Sandbox - Testando)
                    </span>
                  </SelectItem>
                  <SelectItem value="prod" className="text-base">
                    <span className="flex items-center gap-2">
                      🔴 Produção (Real - Cuidado!)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600 mt-2">
                💡 {mode === "dev" 
                  ? "Você está em SANDBOX. Pagamentos são fictícios, seguro para testes." 
                  : "Você está em PRODUÇÃO. TODO pagamento é REAL. Tenha cuidado!"}
              </p>
            </div>

            {/* Warnings */}
            <div className="space-y-3">
              {isProduction && (
                <Alert className="border-2 border-red-300 bg-red-50">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    ⚠️ <strong>MODO PRODUÇÃO ATIVO!</strong> Todo pagamento é REAL e cobrado do cliente.
                  </AlertDescription>
                </Alert>
              )}

              {!isProduction && (
                <Alert className="border-2 border-green-300 bg-green-50">
                  <Check className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    ✅ Modo sandbox ativo. Pagamentos são fictícios. Seguro para testes!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Current Key Display */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700">
                Chave API Ativa
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-900 text-green-400 p-3 rounded font-mono text-sm break-all overflow-auto max-h-20">
                  {currentKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentKey);
                    toast({
                      title: "✅ Copiado!",
                      description: "Chave copiada para clipboard",
                    });
                  }}
                  className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                >
                  Copiar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Status Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle>Status do Backend</CardTitle>
            <CardDescription>Verificar se o servidor está rodando</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    backendStatus === "ok" ? "bg-green-500" : 
                    backendStatus === "error" ? "bg-red-500" : 
                    "bg-yellow-500"
                  }`}></div>
                  <span className="font-semibold">
                    {backendStatus === "ok" ? "✅ Conectado" : 
                     backendStatus === "error" ? "❌ Desconectado" : 
                     "🔄 Verificando..."}
                  </span>
                </div>
                {backendStatus === "ok" && backendMode && (
                  <p className="text-sm text-slate-600">
                    Backend rodando em: <strong>{backendMode === "prod" ? "🔴 PRODUÇÃO" : "🟢 DESENVOLVIMENTO"}</strong>
                  </p>
                )}
                {backendStatus === "error" && (
                  <p className="text-sm text-red-600">
                    Certifique-se que <code className="bg-red-100 px-2 py-1 rounded">npm run dev:backend</code> está rodando
                  </p>
                )}
              </div>
              <button
                onClick={checkBackendStatus}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-medium"
              >
                Recarregar
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <CardTitle>Como Usar</CardTitle>
            <CardDescription>Passo a passo para alterar o ambiente</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">1</div>
                <div>
                  <p className="font-semibold text-slate-800">Selecione o ambiente acima</p>
                  <p className="text-sm text-slate-600">Escolha entre "Desenvolvimento" ou "Produção"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">2</div>
                <div>
                  <p className="font-semibold text-slate-800">Copie a chave (opcional)</p>
                  <p className="text-sm text-slate-600">Clique em "Copiar" para conseguir a chave da API</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">3</div>
                <div>
                  <p className="font-semibold text-slate-800">Comando para alterar no backend</p>
                  <p className="text-sm text-slate-600">A preferência é salva no navegador e usada nas requisições</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">4</div>
                <div>
                  <p className="font-semibold text-slate-800">Recarregue a página</p>
                  <p className="text-sm text-slate-600">Pressione <code className="bg-slate-100 px-1 rounded">F5</code> ou <code className="bg-slate-100 px-1 rounded">Ctrl+Shift+R</code> para limpar cache</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Frontend URL:</span>
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">{typeof window !== "undefined" ? window.location.origin : "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Backend URL:</span>
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">http://localhost:3001</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Modo Selecionado:</span>
              <span className={`font-bold px-2 py-1 rounded ${isProduction ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {mode === "dev" ? "🟢 DESENVOLVIMENTO" : "🔴 PRODUÇÃO"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Storage Key:</span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{STORAGE_KEY}</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={() => window.location.href = "/admin"}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            ← Voltar para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
