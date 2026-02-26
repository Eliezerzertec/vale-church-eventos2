import { CheckCircle, Download, Mail, Calendar, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PaymentReceiptProps {
  eventTitle: string;
  participantName: string;
  participantEmail: string;
  amount: number; // em reais
  paymentMethod: "PIX" | "CARD";
  transactionId: string;
  paidAt?: string;
  eventDate?: string;
  billingId?: string;
  receiptUrl?: string; // URL do comprovante no AbacatePay
  couponCode?: string; // Código do cupom usado
  discountAmount?: number; // Valor do desconto em reais
}

/**
 * Comprovante de Pagamento
 * Exibe confirmação de pagamento com detalhes
 */
export const PaymentReceipt = ({
  eventTitle,
  participantName,
  participantEmail,
  amount,
  paymentMethod,
  transactionId,
  paidAt = new Date().toISOString(),
  eventDate,
  billingId,
  receiptUrl,
  couponCode,
  discountAmount,
}: PaymentReceiptProps) => {
  const handleDownloadReceipt = () => {
    const receiptText = `
COMPROVANTE DE PAGAMENTO
═══════════════════════════════════════

Data: ${format(new Date(paidAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}

EVENTO
─────────────────────────────────────
${eventTitle}
${eventDate ? `Data do evento: ${format(new Date(eventDate), "dd/MM/yyyy", { locale: ptBR })}` : ""}

PARTICIPANTE
─────────────────────────────────────
Nome: ${participantName}
Email: ${participantEmail}

PAGAMENTO
─────────────────────────────────────
Valor: R$ ${amount.toFixed(2)}
Método: ${paymentMethod === "PIX" ? "PIX" : "Cartão de Crédito"}
Status: ✓ PAGO

═══════════════════════════════════════
Um email de confirmação foi enviado para ${participantEmail}
    `;

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comprovante-${transactionId}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendEmail = async () => {
    try {
      // Implementar envio de email se necessário
      console.log("Reenviando comprovante para", participantEmail);
      alert(`Comprovante será reenviado para ${participantEmail}`);
    } catch (error) {
      console.error("Erro ao reenviar:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ícone de sucesso */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <CheckCircle className="h-20 w-20 text-green-600 relative z-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-green-600">Pagamento Confirmado!</h2>
        <p className="text-muted-foreground">Sua inscrição foi processada com sucesso</p>
      </div>

      {/* Card do Comprovante */}
      <Card className="border-2 border-green-200 bg-green-50/50 shadow-lg">
        <CardHeader className="border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Comprovante de Pagamento
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Seção 1: Evento */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Evento
            </h3>
            <p className="text-lg font-semibold text-foreground">{eventTitle}</p>
            {eventDate && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(eventDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>

          <div className="border-t border-green-200" />

          {/* Seção 2: Participante */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Participante
            </h3>
            <p className="text-foreground">
              <span className="text-sm text-muted-foreground">Nome: </span>
              <span className="font-semibold">{participantName}</span>
            </p>
            <p className="text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email: </span>
              <span className="font-semibold">{participantEmail}</span>
            </p>
          </div>

          <div className="border-t border-green-200" />

          {/* Seção 3: Pagamento */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Pagamento
            </h3>

            {/* Valor Original e Desconto */}
            {couponCode && discountAmount && discountAmount > 0 ? (
              <div className="bg-white rounded-lg p-4 border border-green-200 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Valor Original</p>
                  <p className="text-sm text-muted-foreground line-through">R$ {(amount + discountAmount).toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center bg-green-50 -mx-4 -my-2 px-4 py-2 rounded">
                  <p className="text-sm font-semibold text-green-700">Cupom: {couponCode}</p>
                  <p className="text-sm font-semibold text-green-700">-R$ {discountAmount.toFixed(2)}</p>
                </div>
                <div className="border-t border-green-200 pt-2 flex justify-between items-center">
                  <p className="text-sm font-semibold text-muted-foreground">Valor Final</p>
                  <p className="text-2xl font-bold text-green-600">R$ {amount.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm text-muted-foreground mb-1">Valor Pago</p>
                <p className="text-3xl font-bold text-green-600">R$ {amount.toFixed(2)}</p>
              </div>
            )}

            {/* Método e Data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Método</p>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  {paymentMethod === "PIX" ? (
                    <>
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">
                        P
                      </div>
                      PIX
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Cartão
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Data/Hora</p>
                <p className="text-sm font-semibold text-foreground">
                  {format(new Date(paidAt), "dd/MM/yyyy", { locale: ptBR })}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(paidAt), "HH:mm", { locale: ptBR })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-green-200" />

          {/* Mensagem Final */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-1">✓ E-mail enviado</p>
            <p>Um comprovante detalhado foi enviado para <strong>{participantEmail}</strong>. Verifique sua caixa de entrada e spam.</p>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        {receiptUrl && (
          <Button
            onClick={() => window.open(receiptUrl, "_blank", "noopener,noreferrer")}
            className="gap-2 flex-1 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Ver Comprovante
          </Button>
        )}

        <Button
          onClick={handleDownloadReceipt}
          variant="outline"
          className="gap-2 flex-1"
        >
          <Download className="h-4 w-4" />
          Baixar Comprovante
        </Button>

        <Button
          onClick={handleSendEmail}
          variant="outline"
          className="gap-2 flex-1"
        >
          <Mail className="h-4 w-4" />
          Reenviar para Email
        </Button>
      </div>
    </div>
  );
};

export default PaymentReceipt;
