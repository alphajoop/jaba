import { CheckoutForm } from "@/components/checkout-form";
import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { getProviders } from "@/lib/dexpay";

async function getAvailableProviders() {
  try {
    const providers = await getProviders();
    return providers.filter((p) => p.provider_status === "active");
  } catch {
    return [];
  }
}

export default async function CheckoutPage() {
  const providers = await getAvailableProviders();
  const uniqueProviders = Array.from(
    new Set(providers.map((p) => p.provider_name.trim())),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Paiement
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Payez en toute sécurité via Mobile Money
          </p>
        </div>

        <Separator className="mb-6" />

        <div className="rounded-lg border border-border p-5">
          <CheckoutForm />
        </div>

        {/* Trust badge */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Paiements sécurisés par{" "}
          <span className="font-medium text-foreground">DexPay</span> ·{" "}
          {uniqueProviders.join(" · ")}
        </p>
      </main>
    </div>
  );
}
