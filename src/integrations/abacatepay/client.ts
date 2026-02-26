// AbacatePay API Client - v1.2
// Integração direta com AbacatePay (Bearer token) para PIX e Cartão

const API_BASE = "https://api.abacatepay.com";
const API_VERSION = "v1";

export interface BillingProduct {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number; // em centavos
}

export interface BillingCreateParams {
  frequency?: "ONE_TIME" | "MULTIPLE_TIMES";
  methods?: ("PIX" | "CARD")[];
  products: BillingProduct[];
  returnUrl?: string;
  completionUrl?: string;
  customer?: {
    id?: string;
    metadata?: {
      name?: string;
      email?: string;
      cellphone?: string;
      taxId?: string;
      [key: string]: any;
    };
  };
  couponId?: string;
}

export interface BillingResponse {
  id: string;
  url?: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  paymentLink?: string;
  payment_link?: string;
  redirectUrl?: string;
  redirect_url?: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "EXPIRED" | "CANCELLED";
  devMode: boolean;
  methods: ("PIX" | "CARD")[];
  frequency: "ONE_TIME" | "MULTIPLE_TIMES";
  nextBilling: string | null;
  customer: {
    id?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AbacatePayResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PixQrCodeRequest {
  amount: number; // centavos
  expiresIn?: number; // segundos
  description?: string; // max 37 chars
  customerId?: string; // ID de cliente já criado
  metadata?: Record<string, any>;
}

export interface PixQrCodeResponse {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  devMode: boolean;
  brCode: string;
  brCodeBase64: string;
  platformFee?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

class AbacatePay {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("AbacatePay API key não configurada. Defina VITE_ABACATEPAY_KEY nos .env");
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<AbacatePayResponse<T>> {
    try {
      // Em dev: usa backend local para evitar CORS
      // Em produção: usa AbacatePay direto (hosting próprio com CORS habilitado)
      // ✅ FIX: Usar VITE_BACKEND_URL para determinar se deve usar backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const isDev = import.meta.env.DEV || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));
      const useBackend = isDev && !!backendUrl;
      
      console.log("🔍 Request Config:", { isDev, useBackend, backendUrl, hostname: typeof window !== "undefined" ? window.location.hostname : "SSR" });

      let response: Response;

      if (useBackend) {
        // Chamar via backend local (sem CORS bloqueado)
        // Usa o mesmo hostname do browser + porta 3001 do backend
        const backendHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
        const backendUrl = `http://${backendHost}:3001/api/payment/create`;
        
        console.log("📤 AbacatePay Request (via backend):", { endpoint, bodyKeys: Object.keys(body || {}), backendUrl });

        response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method, endpoint, body }),
        });
      } else {
        // Chamar direto a API AbacatePay (servidor/produção com CORS permitido)
        const url = `${API_BASE}/${API_VERSION}${endpoint}`;
        console.log("📤 AbacatePay Request (direto):", { method, url, bodyKeys: Object.keys(body || {}) });

        response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: body ? JSON.stringify(body) : undefined,
        });
      }

      const responseData = await response.json().catch(() => null);

      console.log("📥 AbacatePay Response:", {
        status: response.status,
        statusText: response.statusText,
        body: responseData,
        keys: responseData ? Object.keys(responseData) : [],
      });

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}`;
        console.error("❌ AbacatePay Error:", errorMessage);
        return { data: null, error: errorMessage };
      }

      // Se chegou aqui pelo backend, responseData tem { error, data }
      if (useBackend && responseData?.error) {
        console.error("❌ AbacatePay Error (backend):", responseData.error);
        return { data: null, error: responseData.error };
      }

      // Se chegou direto, verifica error no body
      if (!useBackend && (responseData as any)?.error) {
        const errorMessage = (responseData as any)?.error?.message || (responseData as any)?.error || `HTTP ${response.status}`;
        console.error("❌ AbacatePay Error Body:", errorMessage);
        return { data: null, error: errorMessage };
      }

      // Retornar data (se backend, já vem em responseData.data)
      const finalData = useBackend ? responseData?.data : responseData;
      
      console.log("✅ Final Data Extracted:", {
        useBackend,
        finalDataKeys: finalData ? Object.keys(finalData) : [],
        hasUrl: !!(finalData?.url || finalData?.paymentUrl || finalData?.checkoutUrl),
        url: finalData?.url || finalData?.paymentUrl || finalData?.checkoutUrl,
      });
      
      return { data: finalData as T, error: null };
    } catch (error: any) {
      console.error("❌ AbacatePay Exception:", {
        message: error.message,
        name: error.name,
      });

      return {
        data: null,
        error: `Erro na requisição: ${error.message}`,
      };
    }
  }

  billing = {
    create: async (params: BillingCreateParams): Promise<AbacatePayResponse<BillingResponse>> => {
      const payload: any = {
        frequency: params.frequency || "ONE_TIME",
        methods: params.methods || ["PIX", "CARD"],
        products: params.products,
        returnUrl: params.returnUrl,
        completionUrl: params.completionUrl,
        customer: params.customer,
        couponId: params.couponId,
      };

      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

      return this.request<BillingResponse>("POST", "/billing/create", payload);
    },

    get: async (billingId: string): Promise<AbacatePayResponse<BillingResponse>> => {
      return this.request<BillingResponse>("GET", `/billing/${billingId}`);
    },

    list: async (skip: number = 0, take: number = 50): Promise<AbacatePayResponse<BillingResponse[]>> => {
      return this.request<BillingResponse[]>("GET", `/billing/list?skip=${skip}&take=${take}`);
    },

    cancel: async (billingId: string): Promise<AbacatePayResponse<{ success: boolean }>> => {
      return this.request<{ success: boolean }>("POST", `/billing/${billingId}/cancel`);
    },

    refund: async (billingId: string): Promise<AbacatePayResponse<{ success: boolean }>> => {
      return this.request<{ success: boolean }>("POST", `/billing/${billingId}/refund`);
    },
  };

  pixQrCode = {
    create: async (params: PixQrCodeRequest): Promise<AbacatePayResponse<PixQrCodeResponse>> => {
      const payload: any = {
        amount: params.amount,
        description: params.description ? params.description.slice(0, 37) : undefined,
        expiresIn: params.expiresIn,
        customerId: params.customerId,
        metadata: params.metadata,
      };

      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

      return this.request<PixQrCodeResponse>("POST", "/pixQrCode/create", payload);
    },
  };
}

// Inicializar cliente
const apiKey = import.meta.env.VITE_ABACATEPAY_KEY;

export const abacatepay = new AbacatePay(apiKey);
export default abacatepay;
