import { CheckoutForm } from "@/components/checkout-form";
import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
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
          <span className="font-medium text-foreground">DexPay</span> · Wave ·
          Orange Money · MTN
        </p>
      </main>
    </div>
  );
}
