import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/dexpay";
import { createServerClient } from "@/lib/supabase/server";
import type { DexPayWebhookPayload } from "@/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[DexPay] webhook raw:", JSON.stringify(body));

  // Vérification signature HMAC (peut être absente en sandbox)
  const signature = request.headers.get("x-webhook-signature") ?? "";
  if (signature) {
    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.warn("[DexPay] invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = body as DexPayWebhookPayload;
  const { event, reference } = payload;

  console.log("[DexPay] webhook event:", event, "| reference:", reference);

  if (!reference) {
    return NextResponse.json({ received: true });
  }

  const supabase = createServerClient();

  switch (event) {
    case "checkout.completed": {
      await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("reference", reference);

      // Décrémenter le stock
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("reference", reference)
        .single();

      if (order) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", order.id);

        if (orderItems) {
          for (const item of orderItems) {
            await supabase.rpc("decrement_stock", {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          }
        }
      }
      break;
    }

    case "checkout.failed":
      await supabase
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("reference", reference);
      break;

    case "checkout.cancelled":
      await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("reference", reference);
      break;

    case "checkout.initiated":
    case "checkout.processing":
      // Informatif seulement — pas de changement de statut nécessaire
      break;

    default:
      console.log("[DexPay] unhandled event:", event);
      break;
  }

  // Toujours 200 pour stopper les retries DexPay
  return NextResponse.json({ received: true });
}
