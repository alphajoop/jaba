import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/dexpay";
import { createServerClient } from "@/lib/supabase/server";
import { generateReference } from "@/lib/utils";

const CheckoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
  }),
  country_iso: z.string().length(2),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        product_name: z.string(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive(),
      }),
    )
    .min(1),
  currency: z.string().default("XOF"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { customer, country_iso, items, currency } = parsed.data;
  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const reference = generateReference();
  const supabase = createServerClient();

  // 1. Créer la commande en DB
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      reference,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      country_iso,
      total_amount: total,
      currency,
      status: "pending",
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }

  // 2. Insérer les lignes de commande
  const { error: itemsErr } = await supabase.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.unit_price * i.quantity,
    })),
  );

  if (itemsErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Failed to save order items" },
      { status: 500 },
    );
  }

  // 3. Créer la session DexPay
  try {
    const session = await createCheckoutSession({
      reference,
      item_name: `Commande ${reference}`,
      amount: total,
      currency,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
    });

    // DexPay n'a pas de champ `id` — on utilise `reference` comme identifiant de session
    // On stocke aussi le payment_url pour une éventuelle redirection hosted
    await supabase
      .from("orders")
      .update({
        dexpay_session_id: session.reference ?? reference,
        status: "processing",
      })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      reference,
      session_reference: session.reference ?? reference,
      payment_url: session.payment_url,
      total,
      currency,
    });
  } catch (err) {
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment init failed" },
      { status: 502 },
    );
  }
}
