import type { Tables } from "@/lib/supabase/database.types";

export type Product = Tables<"products">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

// Cart (client-side only)
export type CartItem = {
  product: Product;
  quantity: number;
};

// DexPay types
export type DexPayProvider = {
  provider_name: string;
  provider_short_name: string;
  provider_logo: string;
  provider_country: string;
  provider_currency: string;
  provider_type: "mobile_money" | "card";
  provider_status: "active" | "inactive";
  provider_fee_type: "percentage" | "fixed";
  provider_fee: number;
  isSandbox: boolean;
};

export type DexPaySession = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  payment_url: string;
  created_at: string;
};

export type DexPayAttemptResponse = {
  status: string;
  cashout_url: string | null;
  sandbox_payment_url?: string;
  expires_at: string;
};

export type DexPayWebhookPayload = {
  event: string;
  reference: string;
  checkout_session_id?: string;
  transaction_id?: string;
  status: string;
  amount: number;
  currency: string;
  timestamp: string;
  payment_url?: string;
  metadata?: Record<string, unknown>;
};
