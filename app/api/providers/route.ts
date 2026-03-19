import { NextResponse } from "next/server";
import { getProviders } from "@/lib/dexpay";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.toUpperCase();

  try {
    // Récupère tous les providers (sans filtre côté DexPay — le filtre ne fonctionne pas)
    const allProviders = await getProviders();

    // Filtre manuel : pays + statut active uniquement
    const providers = allProviders.filter((p) => {
      const matchCountry = country
        ? p.provider_country === country || p.provider_country === "GLOBAL"
        : true;
      const isActive = p.provider_status === "active";
      return matchCountry && isActive;
    });

    return NextResponse.json({ data: providers });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 502 },
    );
  }
}
