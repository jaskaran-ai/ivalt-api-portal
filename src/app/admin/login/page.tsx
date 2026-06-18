"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Smartphone, Lock, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { toast } from "sonner";
import PhoneInput, { type CountryCode, COUNTRY_CODES } from "@/components/ui/phone-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(97,31,105,0.13),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(53,91,146,0.12),transparent_30%)]" />

      <main className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.82fr]">
        <section className="hidden flex-col gap-8 lg:flex">
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

          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-5 w-fit border-red-200 bg-red-50 text-red-700">
              <Lock className="mr-1 size-3" />
              Restricted Access
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl">
              Admin authentication required
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              This portal is restricted to authorized administrators only. Use your registered mobile number to access.
            </p>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <Card className="border-red-200 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
            <CardHeader className="p-6 pb-0">
              <div className="mb-5 flex size-12 items-center justify-center rounded-3xl bg-red-500/10 text-red-700">
                <Smartphone className="size-6" />
              </div>
              <CardTitle className="text-2xl tracking-[-0.025em]">
                {step === "waiting"
                  ? "Approve on your phone"
                  : step === "success"
                    ? "Authenticated"
                    : "Admin Login"}
              </CardTitle>
              <CardDescription>
                {step === "waiting"
                    ? `Request sent to ${fullNumber}`
                  : step === "success"
                    ? "Redirecting to admin dashboard"
                    : "Enter your registered mobile number for biometric authentication"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {step === "phone" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      countryCode={selectedCountry}
                      onCountryChange={setSelectedCountry}
                      placeholder="98765 43210"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use your registered admin mobile number
                    </p>
                  </div>

                  <Button type="submit" disabled={isLoading} size="lg" className="w-full shadow-sm shadow-red-200">
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
                <div className="flex flex-col gap-5 py-2 text-center">
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
                <div className="flex flex-col items-center gap-5 py-4 text-center">
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
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
