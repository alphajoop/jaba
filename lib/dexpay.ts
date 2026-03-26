import type {
  DexPayAttemptResponse,
  DexPayProvider,
  DexPaySession,
} from "@/types";

//const BASE_URL = "https://api.dexpay.africa/api/v1";
const BASE_URL = "https://api-sandbox.dexpay.africa/api/v1";

function getHeaders() {
  const apiKey = process.env.DEXPAY_API_KEY;
  const apiSecret = process.env.DEXPAY_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error(
      "Missing DexPay environment variables: DEXPAY_API_KEY and/or DEXPAY_API_SECRET",
    );
  }
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "x-api-secret": apiSecret,
  };
}

// Create a checkout session
export async function createCheckoutSession(params: {
  reference: string;
  item_name: string;
  amount: number;
  currency: "XOF" | "XAF" | "GNF";
  countryISO: string;
  webhook_url: string;
  success_url: string;
  failure_url: string;
  customer?: {
    phone: string;
    email: string;
    name: string;
  };
}): Promise<DexPaySession> {
  const res = await fetch(`${BASE_URL}/checkout-sessions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Failed to create checkout session");
  }

  const json = await res.json();
  console.log("[DexPay] checkout session raw:", JSON.stringify(json));
  return json.data as DexPaySession;
}

// Get ALL providers — le filtre DexPay ne fonctionne pas, on filtre manuellement dans la route
export async function getProviders(): Promise<DexPayProvider[]> {
  const res = await fetch(`${BASE_URL}/payment-providers`, {
    headers: getHeaders(),
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) throw new Error("Failed to fetch providers");

  const json = await res.json();
  return (json?.data ?? []) as DexPayProvider[];
}

// Create a transaction attempt (direct integration)
export async function createTransactionAttempt(
  reference: string,
  params: {
    payment_method: "mobile_money" | "card";
    operator: string;
    customer: { name: string; phone: string; email: string };
    countryISO: string;
  },
): Promise<DexPayAttemptResponse> {
  const res = await fetch(
    `${BASE_URL}/checkout-sessions/${reference}/transaction-attempt`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params),
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? "Failed to initiate payment");
  }

  return res.json();
}

// Verify webhook HMAC-SHA256 signature
export async function verifyWebhookSignature(
  payload: unknown,
  signature: string,
): Promise<boolean> {
  const secret = process.env.DEXPAY_API_SECRET;
  if (!secret) {
    throw new Error("Missing DexPay environment variable: DEXPAY_API_SECRET");
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(JSON.stringify(payload)),
  );

  // Convertir en hex correctement
  const hashArray = Array.from(new Uint8Array(signed));
  const hexSignature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  console.log("[Webhook] Expected signature:", hexSignature);
  console.log("[Webhook] Received signature:", signature);

  return hexSignature === signature;
}
