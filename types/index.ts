// Database types (mirrors Supabase schema)
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number; // in XOF
  currency: string;
  stock: number;
  image_url: string | null;
  category: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country_iso: string;
  total_amount: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "failed" | "cancelled";
  payment_provider: string | null;
  dexpay_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

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
