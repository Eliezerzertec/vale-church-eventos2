// AbacatePay API Client - v1.0
// Este cliente facilita integração com AbacatePay para pagamentos PIX e CARD

const API_BASE = "https://api.abacatepay.com";
const API_VERSION = "v1";

export interface CreateBillingParams {
  amount: number; // em centavos (ex: 1000 = R$ 10,00)
  description: string;
  methods?: ("PIX" | "CARD")[]; // Padrão: ["PIX", "CARD"]
  customer?: {
    id?: string;
    metadata?: Record<string, any>;
  };
  frequency?: "ONE_TIME" | "MONTHLY"; // Padrão: "ONE_TIME"
  nextBilling?: string; // ISO date para recorrência
}

export interface BillingResponse {
  id: string;
  url: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  devMode: boolean;
  methods: ("PIX" | "CARD")[];
  frequency: "ONE_TIME" | "MONTHLY";
  nextBilling: string | null;
  customer: {
    id: string;
    metadata: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AbacatePayResponse<T> {
  data: T | null;
  error: string | null;
}

class AbacatePay {
  private apiKey: string;
  private isDev: boolean;

  constructor(apiKey: string, isDev: boolean = false) {
    if (!apiKey) {
      throw new Error("AbacatePay API key não configurada. Defina VITE_ABACATEPAY_KEY nos .env");
    }
    this.apiKey = apiKey;
    this.isDev = isDev;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<AbacatePayResponse<T>> {
    try {
      const url = `${API_BASE}/${API_VERSION}${endpoint}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          data: null,
          error: errorData?.error?.message || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        data: data as T,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Erro desconhecido na requisição",
      };
    }
  }

  billing = {
    create: async (params: CreateBillingParams): Promise<AbacatePayResponse<BillingResponse>> => {
      return this.request<BillingResponse>("POST", "/billing/create", {
        amount: params.amount,
        description: params.description,
        methods: params.methods || ["PIX", "CARD"],
        customer: params.customer,
        frequency: params.frequency || "ONE_TIME",
        nextBilling: params.nextBilling,
        devMode: this.isDev,
      });
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
}

// Inicializar cliente
const apiKey = import.meta.env.VITE_ABACATEPAY_KEY;
const isDev = import.meta.env.DEV || import.meta.env.VITE_ABACATEPAY_DEV === "true";

export const abacatepay = new AbacatePay(apiKey, isDev);

export default abacatepay;
