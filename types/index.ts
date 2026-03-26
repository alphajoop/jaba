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
  reference: string;
  amount: number;
  currency: "XOF" | "XAF" | "GNF";
  success_url: string;
  failure_url: string;
  webhook_url: string;
  payment_url: string;
  expires_at: string;
  status: string;
  isSandbox: boolean;
  payment_attempt?: {
    id: string;
    status: string;
    expires_at: string;
  };
  sandbox_payment_url?: string;
};

export type DexPayAttemptResponse = {
  id: string;
  transaction_id: string;
  status:
    | "initiated"
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";
  operator: string;
  is_active: boolean;
  cashout_url: string | null;
  expires_at: string;
};

export type DexPayWebhookPayload = {
  event:
    | "checkout.initiated"
    | "checkout.completed"
    | "checkout.failed"
    | "checkout.cancelled"
    | "checkout.refunded"
    | "subscription.created"
    | "subscription.activated"
    | "subscription.cancelled"
    | "subscription.payment.succeeded"
    | "subscription.payment.failed";
  timestamp: string;
  reference?: string;
  checkout_session_id?: string;
  transaction_id?: string;
  payment_attempt_id?: string;
  amount?: number;
  currency?: "XOF" | "XAF" | "GNF";
  status?: string;
  operator?: string;
  payment_method?: string;
  external_transaction_id?: string;
  fee_amount?: number;
  merchant_net?: number;
  failure_reason?: string;
  error_message?: string;
  refund_amount?: number;
  refund_reason?: string;
  completed_at?: string;
  failed_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  cancellation_reason?: string;

  // Customer info
  customer?: {
    phone?: string;
    email?: string;
    name?: string;
  };

  // Metadata
  metadata?: Record<string, unknown>;
};
