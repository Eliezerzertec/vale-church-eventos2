import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { abacatepay } from "@/integrations/abacatepay/client";
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentReceipt from "@/components/PaymentReceipt";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Resolve possíveis campos de link de checkout retornados pela AbacatePay
const resolveCheckoutUrl = (billing: any): string | null => {
  if (!billing) {
    console.warn("⚠️ Billing object é null/undefined");
    return null;
  }

  const candidates = [
    { source: "billing.url", value: billing.url },
    { source: "billing.paymentUrl", value: billing.paymentUrl },
    { source: "billing.checkoutUrl", value: billing.checkoutUrl },
    { source: "billing.paymentLink", value: billing.paymentLink },
    { source: "billing.payment_link", value: billing.payment_link },
    { source: "billing.redirectUrl", value: billing.redirectUrl },
    { source: "billing.redirect_url", value: billing.redirect_url },
    { source: "billing?.checkout?.url", value: billing?.checkout?.url },
    { source: "billing?.data?.url", value: billing?.data?.url },
    { source: "billing?.data?.paymentUrl", value: billing?.data?.paymentUrl },
    { source: "billing?.data?.checkoutUrl", value: billing?.data?.checkoutUrl },
  ].filter(c => typeof c.value === "string" && c.value.length > 0);

  console.log("🔍 Billing Object de resoluçao de URL:", {
    billingKeys: Object.keys(billing),
    candidatesTested: [
      { source: "billing.url", value: billing.url },
      { source: "billing.paymentUrl", value: billing.paymentUrl },
      { source: "billing.checkoutUrl", value: billing.checkoutUrl },
      { source: "billing.paymentLink", value: billing.paymentLink },
      { source: "billing.payment_link", value: billing.payment_link },
      { source: "billing.redirectUrl", value: billing.redirectUrl },
      { source: "billing.redirect_url", value: billing.redirect_url },
    ],
    candidatesFound: candidates.length,
    selectedUrl: candidates.length > 0 ? candidates[0].source : "NENHUM",
  });

  if (candidates.length === 0) {
    console.error("❌ Nenhuma URL de checkout encontrada em:", JSON.stringify(billing, null, 2));
    return null;
  }

  const result = candidates[0].value;
  console.log(`✅ URL de checkout resolvida via ${candidates[0].source}:`, result);
  return result;
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cpf: "", coupon: "" });
  const [submitted, setSubmitted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentReturnStatus, setPaymentReturnStatus] = useState<string | null>(null);
  const [paymentReturnInfo, setPaymentReturnInfo] = useState<{ 
    registrationId?: string; 
    paymentUrl?: string;
    billingId?: string;
    paymentDate?: string;
    paymentMethod?: "PIX" | "CARD";
    receiptUrl?: string;
    transactionId?: string;
    couponCode?: string;
    discountAmount?: number;
  } | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  
  // Validação de cupom
  const [couponData, setCouponData] = useState<{
    discountKind: "PERCENTAGE" | "FIXED";
    discount: number;
    redeemsCount?: number;
    maxRedeems?: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const isPaymentReturn = searchParams.get("pagamento") === "ok";

  const { data: event, isLoading } = useQuery({
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

  const { data: registrationCount } = useQuery({
    queryKey: ["registration-count", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id!)
        .neq("status", "cancelled");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  // Validar cupom quando usuário sair do campo
  const handleValidateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponData(null);
      setCouponError(null);
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${backendUrl}/api/coupon/validate/${code.trim().toUpperCase()}`);
      const result = await res.json();

      if (result.error || !result.data) {
        setCouponError(result.error || "Cupom inválido");
        setCouponData(null);
        return;
      }

      // Validar se cupom está ativo
      if (result.data.status !== "ACTIVE") {
        setCouponError("Cupom inativo ou expirado");
        setCouponData(null);
        return;
      }

      // Validar limite de resgates
      if (result.data.maxRedeems > 0 && result.data.redeemsCount >= result.data.maxRedeems) {
        setCouponError("Cupom atingiu o limite de resgates");
        setCouponData(null);
        return;
      }

      setCouponData({
        discountKind: result.data.discountKind,
        discount: result.data.discount,
        redeemsCount: result.data.redeemsCount,
        maxRedeems: result.data.maxRedeems,
      });
    } catch (err) {
      console.error("Erro ao validar cupom:", err);
      setCouponError("Erro ao validar cupom. Tente novamente.");
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calcular desconto em reais
  const calculateDiscountAmount = (): number => {
    if (!couponData || !event?.price) return 0;

    const amountInReais = Number(event.price);

    if (couponData.discountKind === "PERCENTAGE") {
      // Desconto percentual
      return (amountInReais * couponData.discount) / 100;
    } else if (couponData.discountKind === "FIXED") {
      // Desconto fixo em centavos, converter para reais
      return couponData.discount / 100;
    }

    return 0;
  };

  // Preço final após desconto
  const getFinalPrice = (): number => {
    const originalPrice = Number(event?.price || 0);
    const discountAmount = calculateDiscountAmount();
    return Math.max(0, originalPrice - discountAmount);
  };

  // Quando a AbacatePay redireciona de volta com ?pagamento=ok, confirmamos status
  useEffect(() => {
    if (!isPaymentReturn) return;

    const raw = typeof window !== "undefined" ? localStorage.getItem("abacatepay:lastPayment") : null;
    if (!raw) {
      setPaymentReturnStatus("pending");
      return;
    }

    try {
      const stored = JSON.parse(raw);
      if (!stored?.registrationId || stored?.eventId !== id) return;

      setIsCheckingPayment(true);
      supabase
        .from("payments")
        .select("*")
        .eq("registration_id", stored.registrationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          setPaymentReturnStatus(data?.status || "pending");
          setPaymentReturnInfo({
            registrationId: stored.registrationId,
            transactionId: data?.transaction_id,
            billingId: data?.billing_id,
            paymentDate: data?.created_at,
            paymentMethod: data?.payment_method,
            receiptUrl: data?.receipt_url,
            couponCode: data?.coupon_code,
            discountAmount: data?.discount_amount,
          });
        })
        .catch(() => {
          setPaymentReturnStatus("pending");
          setPaymentReturnInfo({
            registrationId: stored.registrationId,
            paymentUrl: stored.paymentUrl,
          });
        })
        .finally(() => setIsCheckingPayment(false));
    } catch (err) {
      console.error("Falha ao ler retorno de pagamento", err);
      setPaymentReturnStatus("pending");
    }
  }, [id, isPaymentReturn]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      // 1. Criar inscrição
      const { data: regData, error: regError } = await supabase
        .from("event_registrations")
        .insert({
          event_id: id!,
          user_id: session?.session?.user?.id || null,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          cpf: form.cpf.trim() || null,
          status: event?.is_free ? "confirmed" : "pending", // pending = aguardando pagamento
        })
        .select("id")
        .single();

      if (regError) throw regError;

      setRegistrationId(regData.id);

      // 2. Se evento for pago, criar cobrança (PIX + CARTÃO) via /billing/create
      if (!event?.is_free) {
        // Usar preço com desconto se cupom foi validado
        const amountInReais = calculateDiscountAmount() > 0 ? getFinalPrice() : Number(event?.price || 0);
        const amountInCents = Math.round(amountInReais * 100);

        // ✅ URLs de retorno - será atualizado com billing.id real APÓS criar a cobrança
        const baseConfirmationUrl = `${window.location.origin}/payment-confirmation/${id}?registration_id=${regData.id}`;
        
        const billingParams: any = {
          frequency: "ONE_TIME",
          methods: ["PIX", "CARD"],
          products: [
            {
              externalId: id!,
              name: event?.title || "Inscrição",
              description: event?.description || "Inscrição em evento",
              quantity: 1,
              price: amountInCents,
            },
          ],
          // returnUrl e completionUrl usam placeholder - serão atualizadas com billing.id real
          returnUrl: `${baseConfirmationUrl}&billing_id=PENDING`,
          completionUrl: `${baseConfirmationUrl}&billing_id=PENDING`,
          customer: {
            name: form.full_name,
            email: form.email,
            cellphone: form.phone || undefined,
            taxId: form.cpf || undefined,
            metadata: {
              registration_id: regData.id,
              event_id: id,
            },
          },
        };
        
        // Adicionar cupom se fornecido e validado
        if (form.coupon?.trim() && couponData) {
          billingParams.couponId = form.coupon.trim().toUpperCase();
          console.log("📌 Cupom aplicado:", billingParams.couponId);
          console.log("💰 Desconto:", calculateDiscountAmount(), "reais | Preço final:", amountInReais);
        }
        
        const { data: billing, error: billingError } = await abacatepay.billing.create(billingParams);

        const checkoutUrl = resolveCheckoutUrl(billing);

        if (billingError || !billing || !checkoutUrl) {
          // Log detalhado do erro
          console.error("❌ Falha ao processar pagamento:", {
            hasError: !!billingError,
            billingError,
            billingExists: !!billing,
            billingType: typeof billing,
            billingKeys: billing ? Object.keys(billing) : [],
            checkoutUrl,
            checkoutUrlEvaluation: {
              hasUrl: !!billing?.url,
              hasPaymentUrl: !!billing?.paymentUrl,
              hasCheckoutUrl: !!billing?.checkoutUrl,
              hasPaymentLink: !!billing?.paymentLink,
              hasPaymentLinkUnderscore: !!billing?.payment_link,
              hasRedirectUrl: !!billing?.redirectUrl,
              hasRedirectUrlUnderscore: !!billing?.redirect_url,
            },
            fullBilling: JSON.stringify(billing, null, 2),
          });

          // Cancelar inscrição se falhar criar cobrança
          await supabase
            .from("event_registrations")
            .update({ status: "cancelled" })
            .eq("id", regData.id);
          console.warn("AbacatePay billing sem URL", { billing, billingError });
          throw new Error(billingError || "Erro ao criar cobrança (link não retornado). Verifique o console para mais detalhes.");
        }

        setPaymentUrl(checkoutUrl);

        // 3. Salvar pagamento no banco
        const discountAmount = calculateDiscountAmount();
        const { error: paymentError } = await supabase.from("payments").insert({
          registration_id: regData.id,
          event_id: id!,
          amount: Number(event?.price || 0), // Valor original
          status: "pending",
          billing_id: billing.id,
          transaction_id: billing.id,
          receipt_url: billing.receipt_url,
          payment_method: "PIX", // será atualizado quando confirmar
          coupon_code: form.coupon?.trim().toUpperCase() || null,
          discount_amount: discountAmount, // Desconto validado e calculado
          registration_email: form.email,
          registration_name: form.full_name,
          payment_url: `${window.location.origin}/payment-confirmation/${id}?registration_id=${regData.id}&billing_id=${billing.id}`,
        });

        if (paymentError) {
          console.error("Falha ao salvar pagamento no Supabase", paymentError);
          // Continua para o checkout mesmo se persistência falhar
        }

        // Guardar detalhes para tela de retorno pós-pagamento
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "abacatepay:lastPayment",
            JSON.stringify({
              registrationId: regData.id,
              billingId: billing.id,
              eventId: id,
              paymentUrl: checkoutUrl,
              email: form.email,
              name: form.full_name,
              ts: Date.now(),
            })
          );
        }

        if (checkoutUrl) {
          // Tenta redirecionar no mesmo tab; se bloqueado, abre nova aba como fallback
          window.location.href = checkoutUrl;
          setTimeout(() => {
            if (window.location.href !== checkoutUrl) {
              window.open(checkoutUrl, "_blank", "noopener,noreferrer");
            }
          }, 800);
        }
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      if (event?.is_free) {
        toast({
          title: "Inscrição Confirmada!",
          description: "Você está inscrito no evento.",
        });
      } else {
        toast({
          title: "Inscrição Realizada",
          description: "Link de pagamento foi gerado. Complete o pagamento para confirmar.",
        });
      }
    },
    onError: (err: any) => {
      const errorMessage = err.message || "Erro ao realizar inscrição.";
      
      // Verificar se é erro de duplicata (UNIQUE constraint)
      if (errorMessage.includes("unique") || errorMessage.includes("duplicate") || err.code === "23505") {
        toast({
          title: "Você já está inscrito",
          description: "Este email já possui uma inscrição neste evento.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    // Evitar double-submit
    if (isChecking || registerMutation.isPending) return;

    // Verificar duplicata antes de inserir
    setIsChecking(true);
    supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", id!)
      .eq("email", form.email.trim())
      .neq("status", "cancelled")
      .maybeSingle()
      .then(({ data }) => {
        setIsChecking(false);
        if (data) {
          toast({
            title: "Você já está inscrito",
            description: "Este email já possui uma inscrição neste evento.",
            variant: "destructive",
          });
          return;
        }
        // Se não encontrou duplicata, prosseguir com inscrição
        registerMutation.mutate();
      })
      .catch(() => {
        setIsChecking(false);
        // Se erro na busca (ex: nenhum registro), prosseguir
        registerMutation.mutate();
      });
  };

  const spotsLeft = event?.max_capacity ? event.max_capacity - (registrationCount || 0) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="h-96 animate-pulse bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <p className="text-muted-foreground">Evento não encontrado.</p>
          <Button onClick={() => navigate("/eventos")} variant="outline" className="mt-4">Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button onClick={() => navigate("/eventos")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar aos Eventos
          </button>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Event Info */}
            <div className="md:col-span-3">
              <div className="h-64 bg-secondary rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <Calendar className="h-16 w-16 text-primary/30" />
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                {format(new Date(event.event_date), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-4">{event.title}</h1>

              {event.location && (
                <p className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" /> {event.location}
                </p>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className={`text-lg font-bold ${event.is_free ? "text-green-600" : "text-primary"}`}>
                  {event.is_free ? "Evento Gratuito" : `R$ ${Number(event.price).toFixed(2)}`}
                </span>
                {spotsLeft !== null && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> {spotsLeft} vagas restantes
                  </span>
                )}
              </div>

              {event.description && (
                <div className="prose prose-sm text-foreground/80 leading-relaxed">
                  <p>{event.description}</p>
                </div>
              )}
            </div>

            {/* Registration Form */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 sticky top-24">
                {!event.is_active ? (
                  <div className="text-center py-10 space-y-3">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                    <h3 className="font-display text-xl font-bold text-foreground">Inscrições indisponíveis</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Este evento está inativo no momento. Assim que for reativado, as inscrições serão reabertas.
                    </p>
                    <Button variant="outline" onClick={() => navigate("/eventos")}>Voltar para eventos</Button>
                  </div>
                ) : (
                <>
                {isPaymentReturn && (
                  <>
                    {isCheckingPayment ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin">
                          <CheckCircle className="h-12 w-12 text-primary" />
                        </div>
                        <p className="mt-4 text-muted-foreground">Confirmando pagamento...</p>
                      </div>
                    ) : paymentReturnStatus === "paid" ? (
                      // Mostrar comprovante de pagamento
                      <PaymentReceipt
                        eventTitle={event.title}
                        participantName={form.full_name}
                        participantEmail={form.email}
                        amount={Number(event.price) || 0}
                        paymentMethod={paymentReturnInfo?.paymentMethod || "PIX"}
                        transactionId={paymentReturnInfo?.registrationId || ""}
                        paidAt={paymentReturnInfo?.paymentDate || new Date().toISOString()}
                        eventDate={event.event_date}
                        billingId={paymentReturnInfo?.billingId}
                        receiptUrl={paymentReturnInfo?.receiptUrl}
                        couponCode={paymentReturnInfo?.couponCode}
                        discountAmount={paymentReturnInfo?.discountAmount}
                      />
                    ) : (
                      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <div className="space-y-1">
                          <div className="font-semibold">Estamos processando</div>
                          <div>
                            Recebemos seu retorno. Se ainda não constar como pago, aguarde alguns segundos ou reabra o checkout.
                          </div>
                        </div>
                        {paymentReturnInfo?.paymentUrl && (
                          <div className="mt-3">
                            <a
                              href={paymentReturnInfo.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-sm font-semibold text-primary underline underline-offset-4"
                            >
                              Abrir checkout novamente
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                    {submitted && !isPaymentReturn ? (
                  <div className="text-center py-8">
                    {event?.is_free ? (
                      <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          Inscrição Confirmada!
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Você está inscrito. Nos vemos no evento!
                        </p>
                      </>
                    ) : paymentUrl ? (
                      <>
                        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-display text-xl font-bold text-foreground mb-4">
                          Complete seu Pagamento
                        </h3>
                        <p className="text-muted-foreground text-sm mb-6">
                          Clique no botão abaixo para pagar via PIX ou Cartão na AbacatePay.
                        </p>
                        <div className="space-y-3">
                          <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full gradient-gold text-secondary font-semibold px-4 py-3 rounded-lg shadow-gold hover:opacity-90 transition-opacity"
                          >
                            Pagar na AbacatePay
                          </a>
                          <p className="text-xs text-muted-foreground">
                            Você será redirecionado para concluir com PIX ou Cartão.
                          </p>
                          <p className="text-sm text-foreground font-medium mt-4">
                            Valor: R$ {Number(event?.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">Inscreva-se</h3>
                    {isFull ? (
                      <p className="text-destructive font-medium text-center py-4">Evento lotado!</p>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="full_name">Nome Completo *</Label>
                          <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="coupon">Cupom de Desconto (opcional)</Label>
                          <Input 
                            id="coupon" 
                            placeholder="Digite o código do cupom" 
                            value={form.coupon} 
                            onChange={(e) => setForm({ ...form, coupon: e.target.value })}
                            onBlur={(e) => handleValidateCoupon(e.target.value)}
                            disabled={validatingCoupon}
                          />
                          {validatingCoupon && (
                            <p className="text-xs text-muted-foreground mt-1">Validando cupom...</p>
                          )}
                          {couponError && (
                            <p className="text-xs text-destructive mt-1">{couponError}</p>
                          )}
                          {couponData && !couponError && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                              <p className="font-medium">✓ Cupom válido!</p>
                              <p className="text-xs mt-1">
                                Desconto: {couponData.discountKind === "PERCENTAGE" 
                                  ? `${couponData.discount}%` 
                                  : `R$ ${(couponData.discount / 100).toFixed(2)}`}
                              </p>
                            </div>
                          )}
                        </div>

                        {!event?.is_free && (
                          <div className="bg-secondary/50 rounded p-3 text-sm">
                            <div className="flex justify-between mb-2">
                              <span>Valor:</span>
                              <span>R$ {Number(event?.price || 0).toFixed(2)}</span>
                            </div>
                            {calculateDiscountAmount() > 0 && (
                              <>
                                <div className="flex justify-between text-destructive mb-2">
                                  <span>Desconto:</span>
                                  <span>-R$ {calculateDiscountAmount().toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border/30 pt-2 flex justify-between font-bold">
                                  <span>Total a pagar:</span>
                                  <span className="text-green-600">R$ {getFinalPrice().toFixed(2)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        <Button type="submit" className="w-full gradient-gold text-secondary font-semibold shadow-gold" disabled={registerMutation.isPending || isChecking || validatingCoupon}>
                          {registerMutation.isPending
                            ? "Processando..."
                            : isChecking
                              ? "Verificando..."
                              : validatingCoupon
                                ? "Validando cupom..."
                                : event.is_free
                                  ? "Confirmar Inscrição"
                                  : "Inscrever-se e Pagar"}
                        </Button>
                      </form>
                    )}
                  </>
                )}
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetailPage;
