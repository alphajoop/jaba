"use client";

import { Check, ChevronRight, Smartphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { DexPayProvider } from "@/types";

type Step = "info" | "provider" | "payment";

const COUNTRY_OPTIONS = [
  { label: "Sénégal (+221)", value: "SN" },
  { label: "Côte d'Ivoire (+225)", value: "CI" },
  { label: "Cameroun (+237)", value: "CM" },
  { label: "Guinée (+224)", value: "GN" },
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart, mounted } = useCart();

  // Step
  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);

  // Customer info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryISO, setCountryISO] = useState("SN");

  // Checkout session
  const [reference, setReference] = useState("");
  //const [sessionId, setSessionId] = useState("");

  // Providers
  const [providers, setProviders] = useState<DexPayProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<DexPayProvider | null>(null);

  // Fetch providers when entering provider step
  useEffect(() => {
    if (step !== "provider") return;
    setLoadingProviders(true);
    fetch(`/api/providers?country=${countryISO}`)
      .then((r) => r.json())
      .then((json) => {
        setProviders(json.data ?? []);
      })
      .catch(() => toast.error("Impossible de charger les opérateurs"))
      .finally(() => setLoadingProviders(false));
  }, [step, countryISO]);

  // Redirect if cart empty after mount
  useEffect(() => {
    if (mounted && items.length === 0 && step === "info") {
      router.replace("/cart");
    }
  }, [mounted, items, step, router]);

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Tous les champs sont requis");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone },
          country_iso: countryISO,
          currency: "XOF",
          items: items.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            quantity: i.quantity,
            unit_price: i.product.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");

      setReference(data.reference);
      setStep("provider");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleAttempt() {
    if (!selectedProvider) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          operator: selectedProvider.provider_short_name,
          payment_method: selectedProvider.provider_type,
          customer: { name, phone, email },
          country_iso: countryISO,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      if (data.cashout_url || data.sandbox_payment_url) {
        // Wave / QR redirect
        const url = data.cashout_url ?? data.sandbox_payment_url;
        window.location.href = url;
      } else {
        // USSD — show waiting screen
        setStep("payment");
        clearCart();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur paiement");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <StepDot
          active={step === "info"}
          done={step !== "info"}
          label="Infos"
        />
        <div className="h-px flex-1 bg-border" />
        <StepDot
          active={step === "provider"}
          done={step === "payment"}
          label="Paiement"
        />
        <div className="h-px flex-1 bg-border" />
        <StepDot
          active={step === "payment"}
          done={false}
          label="Confirmation"
        />
      </div>

      {/* ─── Step 1: Customer info ─── */}
      {step === "info" && (
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              placeholder="Alpha Diop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alpha@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone Mobile Money</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+221 77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Pays</Label>
            <select
              id="country"
              value={countryISO}
              onChange={(e) => setCountryISO(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Création de la commande…
              </>
            ) : (
              <>
                Continuer
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      {/* ─── Step 2: Provider selection ─── */}
      {step === "provider" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choisissez votre opérateur Mobile Money
          </p>

          {loadingProviders ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-5 w-5" />
            </div>
          ) : providers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucun opérateur disponible pour ce pays.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {providers.map((p) => (
                <button
                  type="button"
                  key={p.provider_short_name}
                  onClick={() => setSelectedProvider(p)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    selectedProvider?.provider_short_name ===
                    p.provider_short_name
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                  }`}
                >
                  {p.provider_logo ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={p.provider_logo}
                        alt={p.provider_name}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {p.provider_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.provider_fee}% de frais
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedProvider && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total à payer</span>
                <span className="font-bold">{formatPrice(total, "XOF")}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleAttempt}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Initiation du paiement…
                  </>
                ) : (
                  <>
                    Payer avec {selectedProvider.provider_name}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setStep("info")}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
        </div>
      )}

      {/* ─── Step 3: USSD waiting / confirmation ─── */}
      {step === "payment" && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Confirmez sur votre téléphone
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Un appel USSD a été initié. Ouvrez votre application{" "}
              {selectedProvider?.provider_name ?? "Mobile Money"} et validez le
              paiement de{" "}
              <span className="font-semibold text-foreground">
                {formatPrice(total, "XOF")}
              </span>
              .
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Référence : <span className="font-mono">{reference}</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/checkout/success?ref=${reference}`)}
          >
            J'ai confirmé le paiement
          </Button>
        </div>
      )}
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-medium transition-all ${
          done
            ? "border-primary bg-primary text-primary-foreground"
            : active
              ? "border-primary text-primary"
              : "border-border text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : null}
      </div>
      <span
        className={`text-[10px] ${active || done ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}
