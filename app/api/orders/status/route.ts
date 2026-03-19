import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "reference requis" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("status")
    .eq("reference", reference)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: data.status });
}
