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
  console.log("[Webhook] Signature header:", signature);

  if (signature) {
    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.warn("[DexPay] invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = body as DexPayWebhookPayload;
  const { event } = payload;
  const reference = payload.reference;

  console.log("[DexPay] webhook event:", event, "| reference:", reference);

  if (!reference) {
    return NextResponse.json({ received: true });
  }

  const supabase = createServerClient();

  switch (event) {
    case "checkout.completed": {
      console.log(`[DexPay] Payment completed for order: ${reference}`);

      // Mettre à jour la commande avec les détails du paiement
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          transaction_id: payload.transaction_id,
          payment_provider: payload.operator,
          external_transaction_id: payload.external_transaction_id,
          fee_amount: payload.fee_amount,
          net_amount: payload.merchant_net,
          completed_at: payload.completed_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);

      if (error) {
        console.error("[DexPay] Failed to update order:", error);
        break;
      }

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

    case "checkout.failed": {
      console.log(
        `[DexPay] Payment failed for order: ${reference} (${payload.failure_reason || payload.error_message})`,
      );

      await supabase
        .from("orders")
        .update({
          status: "failed",
          transaction_id: payload.transaction_id,
          payment_provider: payload.operator,
          failure_reason: payload.failure_reason || payload.error_message,
          failed_at: payload.failed_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);
      break;
    }

    case "checkout.cancelled": {
      console.log(`[DexPay] Payment cancelled for order: ${reference}`);

      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancelled_at: payload.cancelled_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);
      break;
    }

    case "checkout.refunded": {
      console.log(
        `[DexPay] Payment refunded for order: ${reference} (${payload.refund_amount})`,
      );

      await supabase
        .from("orders")
        .update({
          status: "refunded",
          refund_amount: payload.refund_amount,
          refund_reason: payload.refund_reason,
          refunded_at: payload.refunded_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference);
      break;
    }

    case "checkout.initiated":
      console.log(`[DexPay] Payment initiated for order: ${reference}`);
      // Informatif seulement - la commande est déjà en "processing"
      break;

    default:
      console.log("[DexPay] Unhandled event:", event);
      break;
  }

  // Toujours 200 pour stopper les retries DexPay
  return NextResponse.json({ received: true });
}
