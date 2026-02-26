// AbacatePay SDK Initializer
// Integração com SDK oficial do AbacatePay

export interface AbacatePaySDKConfig {
  apiKey: string;
  environment?: 'production' | 'development';
}

export interface AbacateBillingRequest {
  frequency?: string;
  methods?: string[];
  products: Array<{
    externalId: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  returnUrl?: string;
  completionUrl?: string;
  customer?: {
    name?: string;
    email?: string;
    cellphone?: string;
    taxId?: string;
    metadata?: Record<string, any>;
  };
  couponId?: string;
  metadata?: Record<string, any>;
}

export interface AbacateBillingResponse {
  id: string;
  url?: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  paymentLink?: string;
  payment_link?: string;
  redirectUrl?: string;
  redirect_url?: string;
  amount: number;
  status: string;
  devMode: boolean;
  methods: string[];
  frequency: string;
  customer?: {
    id?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Função auxiliar para normalizar URLs de checkout retornadas pela AbacatePay
 * O SDK pode retornar em diferentes campos dependendo da versão
 */
export const resolveCheckoutUrl = (billing: any): string | null => {
  if (!billing) return null;

  const candidates = [
    billing.url,
    billing.paymentUrl,
    billing.checkoutUrl,
    billing.paymentLink,
    billing.payment_link,
    billing.redirectUrl,
    billing.redirect_url,
  ].filter((v) => typeof v === 'string' && v.length > 0);

  return candidates.length > 0 ? candidates[0] : null;
};

/**
 * Normaliza a resposta da AbacatePay para um formato padrão
 */
export const normalizeAbacatePayResponse = (response: any): AbacateBillingResponse => {
  const data = response?.data || response;
  
  return {
    id: data.id,
    url: resolveCheckoutUrl(data),
    paymentUrl: resolveCheckoutUrl(data),
    amount: data.amount,
    status: data.status || 'PENDING',
    devMode: data.devMode || false,
    methods: data.methods || [],
    frequency: data.frequency || 'ONE_TIME',
    customer: data.customer,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

console.log('✅ AbacatePay SDK Initializer carregado');
