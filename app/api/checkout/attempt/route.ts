import { NextResponse } from "next/server";
import { z } from "zod";
import { createTransactionAttempt } from "@/lib/dexpay";
import { createServerClient } from "@/lib/supabase/server";

const AttemptSchema = z.object({
  reference: z.string(),
  operator: z.string(),
  payment_method: z.enum(["mobile_money", "card"]),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }),
  country_iso: z.string().length(2),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error" }, { status: 422 });
  }

  const { reference, operator, payment_method, customer, country_iso } =
    parsed.data;

  // Update order with chosen provider
  const supabase = createServerClient();
  await supabase
    .from("orders")
    .update({ payment_provider: operator })
    .eq("reference", reference);

  try {
    const attempt = await createTransactionAttempt(reference, {
      payment_method,
      operator,
      customer,
      countryISO: country_iso,
    });

    return NextResponse.json(attempt);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Attempt failed" },
      { status: 502 },
    );
  }
}
