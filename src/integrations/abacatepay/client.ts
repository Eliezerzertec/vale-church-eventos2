// AbacatePay API Client - v1.0
// Este cliente facilita integração com AbacatePay para pagamentos PIX e CARD

import { supabase } from "@/integrations/supabase/client";

const API_BASE = "https://api.abacatepay.com";
const API_VERSION = "v1";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const PROXY_URL = `${SUPABASE_URL}/functions/v1/abacatepay-proxy`;

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
      console.log("📤 AbacatePay Request (via proxy):", { method, endpoint, body });

      // Corpo padrão do proxy
      const proxyBody = { method, endpoint, body, apiKey: this.apiKey };

      // 1) Tentar via supabase.functions.invoke
      try {
        const { data: responseData, error: proxyError } = await supabase.functions.invoke("abacatepay-proxy", {
          body: proxyBody,
        });

        const status = (proxyError as any)?.status ?? 200;

        console.log("📥 AbacatePay Response (proxy invoke):", {
          status,
          body: responseData,
          proxyError,
        });

        if (proxyError) {
          throw proxyError;
        }

        if ((responseData as any)?.error) {
          const errorMessage = (responseData as any)?.error?.message || (responseData as any)?.error || `HTTP ${status}`;
          console.error("❌ AbacatePay Error Body:", errorMessage);
          return { data: null, error: errorMessage };
        }

        return { data: responseData as T, error: null };
      } catch (invokeError: any) {
        console.warn("⚠️ invoke falhou, tentando fetch direto", invokeError);

        // 2) Fallback: fetch direto para Edge Function com headers de auth
        const response = await fetch(PROXY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(proxyBody),
        });

        const responseData = await response.json().catch(() => null);

        console.log("📥 AbacatePay Response (proxy fetch):", {
          status: response.status,
          body: responseData,
        });

        if (!response.ok) {
          const errorMessage = responseData?.error?.message || responseData?.error || responseData?.message || `HTTP ${response.status}`;
          console.error("❌ AbacatePay Error (fetch):", errorMessage);
          return { data: null, error: errorMessage };
        }

        if (responseData?.error) {
          const errorMessage = responseData?.error?.message || responseData?.error || `HTTP ${response.status}`;
          console.error("❌ AbacatePay Error Body (fetch):", errorMessage);
          return { data: null, error: errorMessage };
        }

        return { data: responseData as T, error: null };
      }
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
    create: async (params: CreateBillingParams): Promise<AbacatePayResponse<BillingResponse>> => {
      const payload: any = {
        amount: params.amount,
        description: params.description,
        methods: params.methods || ["PIX", "CARD"],
      };

      // Apenas adicionar customer se exisitir
      if (params.customer) {
        payload.customer = params.customer;
      }

      // Apenas adicionar frequency se não for padrão
      if (params.frequency && params.frequency !== "ONE_TIME") {
        payload.frequency = params.frequency;
      }

      // Apenas adicionar nextBilling se existir
      if (params.nextBilling) {
        payload.nextBilling = params.nextBilling;
      }

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
}

// Inicializar cliente
const apiKey = import.meta.env.VITE_ABACATEPAY_KEY;
const isDev = import.meta.env.DEV || import.meta.env.VITE_ABACATEPAY_DEV === "true";

export const abacatepay = new AbacatePay(apiKey, isDev);

export default abacatepay;
