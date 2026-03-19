import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const supabase = createServerClient();

  let query = supabase
    .from("orders")
    .select(
      `
      id, reference, customer_name, customer_email,
      customer_phone, country_iso, total_amount, currency,
      status, payment_provider, created_at, updated_at,
      order_items (
        id, product_name, quantity, unit_price, subtotal
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
