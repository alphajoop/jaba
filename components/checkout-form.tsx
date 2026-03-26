"use client";

import { Check, ChevronRight, Smartphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const REGIONAL_GROUPS = [
  {
    label: "Afrique de l'Ouest",
    items: COUNTRY_OPTIONS.filter((c) => ["SN", "CI", "GN"].includes(c.value)),
  },
  {
    label: "Afrique Centrale",
    items: COUNTRY_OPTIONS.filter((c) => ["CM"].includes(c.value)),
  },
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart, mounted } = useCart();

  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryISO, setCountryISO] = useState("SN");
  const [reference, setReference] = useState("");
  const [cashoutUrl, setCashoutUrl] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrError, setQrError] = useState(false);
  const [providers, setProviders] = useState<DexPayProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<DexPayProvider | null>(null);

  useEffect(() => {
    if (step !== "provider") return;
    setLoadingProviders(true);
    fetch(`/api/providers?country=${countryISO}`)
      .then((r) => r.json())
      .then((json) => setProviders(json.data ?? []))
      .catch(() => toast.error("Impossible de charger les opérateurs"))
      .finally(() => setLoadingProviders(false));
  }, [step, countryISO]);

  useEffect(() => {
    if (!cashoutUrl || !qrCanvasRef.current) return;
    QRCode.toCanvas(qrCanvasRef.current, cashoutUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => setQrError(true));
  }, [cashoutUrl]);

  useEffect(() => {
    if (step !== "payment" || !reference) return;
    const INTERVAL = 4000;
    const TIMEOUT = 10 * 60 * 1000;
    const startedAt = Date.now();
    const poll = async () => {
      if (Date.now() - startedAt > TIMEOUT) {
        clearInterval(timer);
        return;
      }
      try {
        const res = await fetch(`/api/orders/status?reference=${reference}`);
        const data = await res.json();
        if (data.status === "paid") {
          clearInterval(timer);
          router.push(`/checkout/success?ref=${reference}`);
        } else if (data.status === "failed" || data.status === "cancelled") {
          clearInterval(timer);
          router.push(`/checkout/failure?ref=${reference}`);
        }
      } catch {}
    };
    const timer = setInterval(poll, INTERVAL);
    poll();
    return () => clearInterval(timer);
  }, [step, reference, router]);

  useEffect(() => {
    if (mounted && items.length === 0 && step === "info")
      router.replace("/cart");
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
        const url = data.cashout_url ?? data.sandbox_payment_url;
        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = url;
        } else {
          setCashoutUrl(url);
          setStep("payment");
          clearCart();
        }
      } else {
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
      {/* Progress */}
      <div className="flex items-center gap-2">
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

      {/* ─── Step 1 ─── */}
      {step === "info" && (
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Nom complet
            </Label>
            <Input
              id="name"
              placeholder="Alpha Diop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Email
            </Label>
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
            <Label
              htmlFor="country"
              className="text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Pays
            </Label>
            <Select value={countryISO} onValueChange={setCountryISO}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {REGIONAL_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Téléphone Mobile Money
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+221 77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full noise-matcha"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Création de la commande…
              </>
            ) : (
              <>
                Continuer <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      {/* ─── Step 2 ─── */}
      {step === "provider" && (
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Choisissez votre opérateur
          </p>

          {loadingProviders ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-5 w-5 text-primary" />
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
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-secondary hover:border-primary/40"
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
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Total
                </span>
                <span className="font-bold text-primary">
                  {formatPrice(total, "XOF")}
                </span>
              </div>
              <Button
                className="w-full rounded-full noise-matcha"
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
                    Payer avec {selectedProvider.provider_name}{" "}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setStep("info")}
            className="w-full text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
        </div>
      )}

      {/* ─── Step 3 ─── */}
      {step === "payment" && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>

          {cashoutUrl ? (
            <>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Scannez pour payer
                </p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  Ouvrez{" "}
                  <span className="text-foreground font-medium">
                    {selectedProvider?.provider_name}
                  </span>{" "}
                  et scannez ce QR code.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-white">
                {qrError ? (
                  <a
                    href={cashoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    Ouvrir le lien de paiement
                  </a>
                ) : (
                  <canvas ref={qrCanvasRef} />
                )}
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">
                Confirmez sur votre téléphone
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Validez le paiement de{" "}
                <span className="font-bold text-primary">
                  {formatPrice(total, "XOF")}
                </span>{" "}
                via {selectedProvider?.provider_name ?? "Mobile Money"}.
              </p>
            </div>
          )}

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Réf · <span className="font-mono normal-case">{reference}</span>
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="h-3 w-3 text-primary" />
            En attente de confirmation…
          </div>
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
        className={`text-[9px] uppercase tracking-wider ${active || done ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}
