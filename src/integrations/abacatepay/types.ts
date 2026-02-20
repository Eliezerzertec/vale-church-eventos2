// Types para integração com AbacatePay no projeto Vale Church Manager

export interface PaymentRecord {
  id: string; // ID único do pagamento
  billing_id: string; // ID da cobrança no AbacatePay
  event_registration_id: string; // ID da inscrição no evento
  event_id: string; // ID do evento
  registration_email: string; // Email da pessoa inscrita
  registration_name: string; // Nome da pessoa inscrita
  amount: number; // Valor em centavos
  status: PaymentStatus; // Status do pagamento
  payment_method?: "PIX" | "CARD"; // Método usado
  payment_url?: string; // URL de pagamento do AbacatePay
  pix_qr_code?: string; // QR code PIX (se aplicável)
  paid_at?: string; // Quando foi pago
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>; // Dados adicionais
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "expired";

export interface CreatePaymentParams {
  amount: number; // em centavos
  description: string;
  registration_id: string;
  event_id: string;
  customer_email: string;
  customer_name: string;
  methods?: ("PIX" | "CARD")[];
}

export interface PaymentWebhookPayload {
  billing_id: string;
  status: "paid" | "failed" | "refunded";
  amount: number;
  paid_at?: string;
  payment_method?: "PIX" | "CARD";
  metadata?: Record<string, any>;
}

// Mapa de conversão de status AbacatePay para nosso status
export const abacatepayStatusMap: Record<string, PaymentStatus> = {
  "PENDING": "pending",
  "PAID": "paid",
  "FAILED": "failed",
  "REFUNDED": "refunded",
};

// Formatação de valores
export const formatCurrency = (centavos: number): string => {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const centToReais = (centavos: number): number => {
  return centavos / 100;
};

export const reaisToCent = (reais: number): number => {
  return Math.round(reais * 100);
};
