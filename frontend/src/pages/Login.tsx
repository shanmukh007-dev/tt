import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Car, CarFront, CheckCircle2, ClipboardList, ShieldCheck, Wrench } from "lucide-react";
import { ApiError, apiPost } from "@/lib/api";
import { beginSession } from "@/lib/session";
import { useMe } from "@/hooks/useMe";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DEMO_ACCOUNTS = {
  staff: "staff@autovsm.com",
  customer: "customer@autovsm.com",
};
const DEMO_PASSWORD = "password123";

export default function Login() {
  const me = useMe();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: (creds: { email: string; password: string }) => apiPost<User>("/auth/login", creds),
    onSuccess: (user) => {
      beginSession();
      navigate(user.role === "staff" ? "/" : "/customer-portal", { replace: true });
    },
    onError: (err) =>
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password."
          : "Sign-in failed — please try again.",
      ),
  });

  // Already signed in → straight to the right workspace.
  if (me.data) return <Navigate to={me.data.role === "staff" ? "/" : "/customer-portal"} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate({ email: email.trim(), password });
  };

  const demo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
    login.mutate({ email: demoEmail, password: DEMO_PASSWORD });
  };

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2" data-testid="login-page">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-[#0F172A] p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sky-400/15 text-sky-400">
            <Wrench className="size-5" />
          </div>
          <div>
            <p className="font-heading text-base font-bold tracking-tight">AutoPulse VSM</p>
            <p className="text-xs text-slate-400">Vehicle Service Management</p>
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Service operations, in one place.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Customers, vehicles, service records and history — one clean system for the workshop and the
            people it serves.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-200">
            <li className="flex items-center gap-3">
              <ClipboardList className="size-4 shrink-0 text-sky-400" /> Service records with a live status workflow
            </li>
            <li className="flex items-center gap-3">
              <Car className="size-4 shrink-0 text-sky-400" /> Full vehicle registry tied to each customer
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="size-4 shrink-0 text-sky-400" /> Complete service history per vehicle
            </li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">Staff manage records · Customers track their own vehicles</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#0F172A] text-sky-400">
              <Wrench className="size-5" />
            </div>
            <div>
              <p className="font-heading text-base font-bold tracking-tight">AutoPulse VSM</p>
              <p className="text-xs text-muted-foreground">Vehicle Service Management</p>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use your staff or customer account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                data-testid="login-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                data-testid="login-password-input"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" data-testid="login-error-message">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={login.isPending} data-testid="login-submit-button">
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or one-click demo access
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => demo(DEMO_ACCOUNTS.staff)} disabled={login.isPending} data-testid="staff-demo-button">
              <ShieldCheck className="size-4 text-primary" /> Staff demo
            </Button>
            <Button variant="outline" onClick={() => demo(DEMO_ACCOUNTS.customer)} disabled={login.isPending} data-testid="customer-demo-button">
              <CarFront className="size-4 text-primary" /> Customer demo
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground" data-testid="demo-credentials-hint">
            Demo accounts: staff@autovsm.com · customer@autovsm.com — password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
