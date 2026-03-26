import { CheckoutForm } from "@/components/checkout-form";
import { Header } from "@/components/header";
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
      <main className="mx-auto max-w-md px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-2 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary" />
            Paiement sécurisé
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Finaliser
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Payez en toute sécurité via Mobile Money
          </p>
        </div>

        <div className="h-px w-full bg-border mb-8" />

        {/* Form card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <CheckoutForm />
        </div>

        {/* Trust badge */}
        <p className="mt-5 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          Sécurisé par{" "}
          <span className="text-foreground font-medium normal-case">
            DexPay
          </span>
          {uniqueProviders.length > 0 && <> · {uniqueProviders.join(" · ")}</>}
        </p>
      </main>
    </div>
  );
}
