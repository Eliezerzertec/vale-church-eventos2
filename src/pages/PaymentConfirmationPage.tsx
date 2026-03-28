import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock, ArrowLeft, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentReceipt from "@/components/PaymentReceipt";
import { useToast } from "@/hooks/use-toast";

interface PaymentInfo {
  registrationId: string;
  billingId?: string;
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod?: "PIX" | "CARD";
  receiptUrl?: string;
  transactionId?: string;
  couponCode?: string;
  discountAmount?: number;
  paidAt?: string;
  eventTitle: string;
  participantName: string;
  participantEmail: string;
  amount: number;
  eventDate?: string;
}

export default function PaymentConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [autoRefreshTimeout, setAutoRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

  // Buscar info do evento
  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Buscar dados do pagamento
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        setIsLoading(true);
        const registrationId = searchParams.get("registration_id");
        const billingId = searchParams.get("billing_id");

        if (!registrationId) {
          throw new Error("Registration ID não fornecido");
        }

        console.log("📋 Buscando info de pagamento:", { registrationId, billingId });

        // 1. Buscar registro da inscrição
        const { data: registration, error: regError } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("id", registrationId)
          .single();

        if (regError) {
          console.error("❌ Erro ao buscar registration:", regError);
          throw regError;
        }

        console.log("✅ Registration encontrado:", registration);

        // 2. Buscar dados do pagamento por registration_id (ESTRATÉGIA PRINCIPAL)
        let paymentData = null;
        
        // Tenta primeiro por registration_id (sempre funciona se payment foi criado)
        const { data: payment1, error: payError1 } = await supabase
          .from("payments")
          .select("*")
          .eq("registration_id", registrationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (payment1 && !payError1) {
          paymentData = payment1;
          console.log("✅ Payment encontrado por registration_id:", paymentData);
<<<<<<< HEAD
        } else {
          console.warn("⚠️ Pagamento não encontrado por registration_id:", payError1);
=======
        } else if (billingId) {
          // Fallback: tenta por billing_id se foi fornecido
          const { data: payment2, error: payError2 } = await supabase
            .from("payments")
            .select("*")
            .eq("billing_id", billingId)
            .single();
          
          if (payment2 && !payError2) {
            paymentData = payment2;
            console.log("✅ Payment encontrado por billing_id:", paymentData);
          } else {
            console.warn("⚠️ Pagamento não encontrado por billing_id:", payError2);
          }
        } else {
          console.warn("⚠️ Pagamento não encontrado e billing_id não foi fornecido");
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
        }

        // Montar info de pagamento
        // Prioridade: paymentData.status > registration.status > "pending"
        let determinedStatus: "paid" | "pending" | "failed" = "pending";
        
        if (paymentData?.status === "paid" || registration.status === "confirmed") {
          determinedStatus = "paid";
<<<<<<< HEAD
        } else if (paymentData?.status === "failed" || registration.status === "cancelled") {
=======
        } else if (paymentData?.status === "failed" || registration.status === "rejected") {
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
          determinedStatus = "failed";
        }

        console.log("🔍 Status determinado:", {
          paymentDataStatus: paymentData?.status,
          registrationStatus: registration.status,
          finalStatus: determinedStatus,
        });

        const info: PaymentInfo = {
          registrationId: registration.id,
          billingId: paymentData?.billing_id || billingId,
          paymentStatus: determinedStatus,
          paymentMethod: paymentData?.payment_method as "PIX" | "CARD" | undefined,
<<<<<<< HEAD
          receiptUrl: '',
          transactionId: paymentData?.transaction_id,
          couponCode: '',
          discountAmount: 0,
          paidAt: paymentData?.paid_at,
=======
          receiptUrl: paymentData?.receipt_url,
          transactionId: paymentData?.transaction_id,
          couponCode: paymentData?.coupon_code,
          discountAmount: paymentData?.discount_amount,
          paidAt: paymentData?.updated_at,
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
          eventTitle: event?.title || "Evento",
          participantName: registration.full_name,
          participantEmail: registration.email,
          amount: Number(event?.price || 0),
          eventDate: event?.event_date,
        };

        setPaymentInfo(info);
      } catch (err) {
        console.error("❌ Erro ao buscar info de pagamento:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar informações");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [id, searchParams, event]);

  // Auto-atualizar status de pagamento com Polling (sem webhook)
  useEffect(() => {
    const registrationId = searchParams.get("registration_id");
    if (!registrationId || !paymentInfo) return;

    console.log('🔄 Iniciando polling para status de pagamento...');
    
    // Se já está pago, não precisa poolear
    if (paymentInfo.paymentStatus === 'paid' || paymentInfo.paymentStatus === 'failed') {
      console.log('✅ Pagamento já tem status final, polling desativado');
      return;
    }

    // Polling a cada 3 segundos
    const pollInterval = setInterval(async () => {
      try {
        const { data: payment, error } = await supabase
          .from("payments")
          .select("*")
          .eq("registration_id", registrationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("❌ Erro ao verificar status:", error);
          return;
        }

        if (!payment) {
          console.log("⏳ Pagamento ainda não criado...");
          return;
        }

        console.log("📊 Status atual:", { status: payment.status, createdAt: payment.created_at });

        // Atualizar se status mudou
        if (payment.status === 'paid') {
          console.log('🎉 ✅ PAGAMENTO CONFIRMADO!');
          setPaymentInfo(prev => prev ? { 
            ...prev, 
            paymentStatus: 'paid',
<<<<<<< HEAD
            paidAt: payment.paid_at,
=======
            paidAt: payment.updated_at || payment.paid_at,
            receiptUrl: payment.receipt_url,
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
            transactionId: payment.transaction_id,
          } : null);
          
          // Para o polling quando encontrar "paid"
          clearInterval(pollInterval);
          
          // Toast de sucesso
          toast({
            title: "✅ Pagamento Confirmado!",
            description: "Sua inscrição foi realizada com sucesso.",
          });
        } else if (payment.status === 'failed') {
          console.log('❌ Pagamento falhou');
          setPaymentInfo(prev => prev ? { ...prev, paymentStatus: 'failed' } : null);
          clearInterval(pollInterval);
          
          toast({
            title: "❌ Pagamento Recusado",
            description: "Por favor, tente novamente com outro meio de pagamento.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Erro durante polling:", err);
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => {
      clearInterval(pollInterval);
      console.log('🛑 Polling desativado');
    };
  }, [searchParams, paymentInfo?.paymentStatus, toast]);

  // Limpar timeout se componente desmontar
  useEffect(() => {
    return () => {
      if (autoRefreshTimeout) clearTimeout(autoRefreshTimeout);
    };
  }, [autoRefreshTimeout]);

  // Auto-refresh a cada 3 segundos quando status é pending
  useEffect(() => {
    if (paymentInfo?.paymentStatus === "pending") {
      console.log("🔄 Auto-refresh iniciado (a cada 3s) para status pending");
      
      const autoRefreshInterval = setInterval(() => {
<<<<<<< HEAD
        console.log("� Auto-refresh executado - Tentativa:", refreshCount + 1);
=======
        console.log("🔄 Auto-refresh executado - Tentativa:", refreshCount + 1);
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
        setRefreshCount(prev => prev + 1);
        window.location.reload();
      }, 3000); // 3 segundos

      return () => {
        clearInterval(autoRefreshInterval);
        console.log('🛑 Auto-refresh desativado');
      };
    }
  }, [paymentInfo?.paymentStatus]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Carregando informações do pagamento...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !paymentInfo) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md p-6 border-red-200 bg-red-50">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h1 className="text-xl font-bold text-red-900">Erro ao processar</h1>
              <p className="text-sm text-red-800">{error || "Não foi possível carregar os dados do pagamento"}</p>
              <Button onClick={() => navigate(`/eventos/${id}`)} className="w-full">
                Voltar
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container max-w-4xl px-4">
          {paymentInfo.paymentStatus === "paid" ? (
            // ✅ PAGAMENTO CONFIRMADO - TELA DE AGRADECIMENTO
            <>
              {/* Animação de sucesso flutuante */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 animate-bounce text-4xl opacity-70">✓</div>
                <div className="absolute top-32 right-10 animate-bounce text-4xl opacity-70" style={{animationDelay: "0.2s"}}>🎉</div>
                <div className="absolute bottom-32 left-20 animate-bounce text-4xl opacity-70" style={{animationDelay: "0.4s"}}>✓</div>
              </div>

<<<<<<< HEAD
=======
              {/* Cabeçalho com agradecimento */}
              <div className="mb-8 text-center space-y-4">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4 animate-bounce">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-green-900">Obrigado!</h1>
                <h2 className="text-2xl font-semibold text-green-800">Seu Pagamento Foi Confirmado</h2>
                <p className="text-lg text-green-700">Sua inscrição em <strong>{paymentInfo.eventTitle}</strong> está garantida!</p>
              </div>
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658

              {/* Comprovante de Pagamento */}
              <div className="mb-8">
                <PaymentReceipt
                  eventTitle={paymentInfo.eventTitle}
                  participantName={paymentInfo.participantName}
                  participantEmail={paymentInfo.participantEmail}
                  amount={paymentInfo.amount}
                  paymentMethod={paymentInfo.paymentMethod || "PIX"}
                  transactionId={paymentInfo.transactionId || ""}
                  paidAt={paymentInfo.paidAt || new Date().toISOString()}
                  eventDate={paymentInfo.eventDate}
                  billingId={paymentInfo.billingId}
                  receiptUrl={paymentInfo.receiptUrl}
                  couponCode={paymentInfo.couponCode}
                  discountAmount={paymentInfo.discountAmount}
                />
              </div>
            </>
          ) : paymentInfo.paymentStatus === "pending" ? (
            // ⏳ PAGAMENTO PENDENTE
            <>
              <div className="mb-8 text-center">
                <div className="inline-block p-3 bg-amber-100 rounded-full mb-4 animate-pulse">
                  <Clock className="h-12 w-12 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-amber-900 mb-2">Pagamento Pendente</h1>
                <p className="text-amber-700">Estamos aguardando a confirmação do pagamento</p>
              </div>

              <Card className="p-8 bg-amber-50 border-amber-200 text-center space-y-4 mb-8">
                <p className="text-amber-900">
                  Pode levar alguns minutos para confirmar. A página será atualizada automaticamente.
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-amber-300 border-t-amber-600 rounded-full" />
                </div>
                <p className="text-sm text-amber-700">
                  Tentativa {refreshCount + 1} de 30... 
                  {refreshCount < 30 && <span> (próxima atualização em instantes)</span>}
                </p>

                {/* Debug Info Card */}
                <div className="mt-6 p-4 bg-white rounded border border-amber-200 text-left text-xs text-gray-600 space-y-1">
                  <p className="font-mono font-bold text-gray-800">📊 Informações de Debug:</p>
                  <p>📌 Registration: {searchParams.get("registration_id")?.slice(0, 8)}...</p>
                  <p>💳 Billing ID: {searchParams.get("billing_id")?.slice(0, 8)}...</p>
                  <p>🔄 Tentativas: {refreshCount + 1}/30</p>
                  <p>👤 Participante: {paymentInfo.participantName}</p>
                  <p>💰 Valor: R$ {paymentInfo.amount.toFixed(2)}</p>
                </div>
              </Card>
            </>
          ) : (
            // ❌ PAGAMENTO FALHOU
            <>
              <div className="mb-8 text-center">
                <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-red-900 mb-2">Pagamento Falhou</h1>
                <p className="text-red-700">Houve um problema ao processar seu pagamento</p>
              </div>

              <Card className="p-6 bg-red-50 border-red-200 mb-8">
                <h3 className="font-semibold text-red-900 mb-3">O que fazer?</h3>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    Verifique sua conexão de internet
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    Verifique se tem saldo na conta
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">→</span>
                    Tente novamente ou use outro meio de pagamento
                  </li>
                </ul>
              </Card>

              <Button
                onClick={() => navigate(`/eventos/${id}`)}
                className="w-full"
              >
                Tentar Novamente
              </Button>
            </>
          )}

          {/* Botão Voltar */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/eventos")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Eventos
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
