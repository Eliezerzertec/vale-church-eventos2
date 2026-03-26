import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

export default function PaymentConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"pending" | "paid" | "error">("pending");
  const [registrationName, setRegistrationName] = useState("Participante");

  useEffect(() => {
    // Pegar nome do localStorage (salvo durante inscrição)
    const lastPayment = localStorage.getItem("abacatepay:lastPayment");
    if (lastPayment) {
      try {
        const data = JSON.parse(lastPayment);
        setRegistrationName(data.participantName || "Participante");
      } catch (e) {
        console.warn("Erro ao ler localStorage:", e);
      }
    }

    // Simular confirmação após 5 segundos
    const timer = setTimeout(() => {
      setStatus("paid");
      toast({
        title: "✅ Pagamento Confirmado!",
        description: "Sua inscrição foi confirmada com sucesso.",
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Navbar transparent={false} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Pending */}
          {status === "pending" && (
            <Card className="p-8 text-center shadow-lg">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                ⏳ Aguardando Confirmação
              </h1>
              <p className="text-slate-600 mb-6">
                Seu pagamento está sendo processado. Por favor, aguarde...
              </p>
              <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-700 mb-6">
                <p><strong>Nome:</strong> {registrationName}</p>
                <p><strong>Status:</strong> Pendente</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/eventos")}
                  className="w-full"
                >
                  ← Voltar para Eventos
                </Button>
              </div>
            </Card>
          )}

          {/* Paid */}
          {status === "paid" && (
            <Card className="p-8 text-center shadow-lg border-2 border-green-200 bg-green-50">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-green-700 mb-4">
                ✅ Bem-vindo(a) à Vale Church Lavras! 🙏
              </h1>
              <p className="text-slate-600 mb-6">
                Sua inscrição foi confirmada com sucesso. Você receberá um email de confirmação em breve.
              </p>
              <div className="bg-white rounded-lg p-4 text-sm text-slate-700 mb-6 border border-green-200">
                <p><strong>Nome:</strong> {registrationName}</p>
                <p><strong>Status:</strong> ✅ Confirmado</p>
                <p className="text-xs text-slate-500 mt-2">
                  Verifique seu email para mais detalhes.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate("/eventos")}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  ← Voltar para Eventos
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
