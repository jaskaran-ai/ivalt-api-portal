"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Smartphone, Lock, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { toast } from "sonner";
import PhoneInput, { type CountryCode, COUNTRY_CODES } from "@/components/ui/phone-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const themeIcons = { light: Sun, dark: Moon, system: Monitor };
const themeLabels = { light: "Light", dark: "Dark", system: "System" };
const nextTheme = { light: "dark" as const, dark: "system" as const, system: "light" as const };

type Step = "phone" | "waiting" | "success";

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState<Step>("phone");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const startPolling = useCallback(
    (phoneNumber: string) => {
      let attempts = 0;
      const maxAttempts = 150;
      const interval = setInterval(async () => {
        attempts++;
        setPollCount(attempts);
        try {
          const res = await fetch("/api/admin/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber }),
          });
          const data = await res.json();

          if (data.status === "authenticated") {
            clearInterval(interval);
            setStep("success");
            setTimeout(() => router.push("/admin/dashboard"), 1500);
          } else if (data.status === "failed" || data.status === "not_found") {
            clearInterval(interval);
            toast.error("Authentication failed. Please try again.");
            setStep("phone");
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            toast.error("Authentication timed out. Please try again.");
            setStep("phone");
          }
        } catch {
          // Keep polling on transient errors.
        }
      }, 2000);
    },
    [router],
  );

  const fullNumber = `${selectedCountry.code}${phoneNumber.replace(/\D/g, "")}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Authentication failed");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep("waiting");
      startPolling(fullNumber);
    } catch {
      toast.error("Network error");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(97,31,105,0.13),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(53,91,146,0.12),transparent_30%),linear-gradient(135deg,rgba(97,31,105,0.06),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(97,31,105,0.05),transparent)]" />

      <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTheme(nextTheme[theme])}
          className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:bg-muted"
          aria-label={`Switch theme (current: ${themeLabels[theme]})`}
        >
          {(() => {
            const Icon = themeIcons[theme];
            return <Icon className="size-3.5" />;
          })()}
          {themeLabels[theme]}
        </button>
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        {/* Left — Branding */}
        <section className="flex flex-col justify-center gap-8 px-6 py-12 lg:flex-1 lg:px-12 lg:py-0">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.03em]">iVALT</p>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
            <Badge variant="destructive" className="ml-2">Admin</Badge>
          </div>

          <div className="max-w-xl">
            <Badge variant="outline" className="mb-5 w-fit border-red-200 bg-red-50 text-red-700">
              <Lock className="mr-1 size-3" />
              Restricted Access
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-4xl">
              Admin authentication required
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              This portal is restricted to authorized administrators only. Use your registered mobile number to access.
            </p>
          </div>
        </section>

        {/* Right — Form (no card, no shadow) */}
        <section className="flex flex-col justify-center px-6 pb-16 pt-8 lg:flex-1 lg:px-16 lg:py-0">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-[-0.03em]">iVALT</span>
            <Badge variant="destructive">Admin</Badge>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">
              {step === "waiting"
                ? "Approve on your phone"
                : step === "success"
                  ? "Authenticated"
                  : "Admin Login"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === "waiting"
                ? `Request sent to ${fullNumber}`
                : step === "success"
                  ? "Redirecting to admin dashboard"
                  : "Enter your registered mobile number for biometric authentication"}
            </p>

            <div className="mt-8">
              {step === "phone" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      countryCode={selectedCountry}
                      onCountryChange={setSelectedCountry}
                      placeholder="98765 43210"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : null}
                    {isLoading ? "Sending request..." : "Continue"}
                    {!isLoading && <ArrowRight className="ml-2 size-4" />}
                  </Button>

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    <Lock className="size-3 mr-1 inline" />
                    Secured by iVALT biometric authentication
                  </p>
                </form>
              )}

              {step === "waiting" && (
                <div className="flex flex-col gap-5 py-4 text-center">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary">
                    <Smartphone className="size-10" />
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/70 p-4 text-left">
                    <p className="mb-3 text-sm font-semibold">Approval checklist</p>
                    <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <li>1. Open the iVALT app.</li>
                      <li>2. Tap the authentication notification.</li>
                      <li>3. Verify with Face ID or fingerprint.</li>
                    </ol>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Waiting&hellip; {Math.ceil((150 - pollCount) * 2)}s remaining
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep("phone")}>
                    Use different number
                  </Button>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center gap-5 py-8 text-center">
                  <div className="flex size-20 items-center justify-center rounded-[2rem] bg-emerald-500/10 text-emerald-700">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="size-2 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
