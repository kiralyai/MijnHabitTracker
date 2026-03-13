"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Chrome, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";
import { APP_NAME } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type FormValues = z.output<typeof schema>;

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabaseEnabled = isSupabaseConfigured();
  const supabase = createSupabaseBrowserClient();
  const { siteUrl } = getSupabaseEnv();
  const nextPath = searchParams.get("next") || "/app/dashboard";
  const redirectError = searchParams.get("error");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (redirectError) {
      setAuthError(redirectError);
    }
  }, [redirectError]);

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    setAuthError(null);

    try {
      const parsed = schema.safeParse({
        ...values,
        fullName: values.fullName?.trim(),
        email: values.email.trim(),
      });

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            form.setError(path as keyof FormValues, { message: issue.message });
          }
        });
        return;
      }

      if (!supabaseEnabled || !supabase) {
        throw new Error("Supabase is not configured. Add the required environment variables to enable authentication.");
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (error) {
          throw error;
        }

        toast.success("Welcome back.");
        router.push(nextPath);
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
          },
          emailRedirectTo: `${siteUrl}/auth/confirm`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success("Account created.");
        router.push("/app/dashboard");
        router.refresh();
        return;
      }

      toast.success("Account created. Check your inbox to confirm your email before signing in.");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  });

  async function handleGoogle() {
    setAuthError(null);
    setPending(true);

    if (!supabaseEnabled || !supabase) {
      const message = "Supabase is not configured. Add the required environment variables to enable authentication.";
      setAuthError(message);
      toast.error(message);
      setPending(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setAuthError(error.message);
      toast.error(error.message);
      setPending(false);
    }
  }

  return (
    <Card className="w-full rounded-[32px] border-white/10 bg-card/90 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <CardHeader className="space-y-4 border-b border-border/70 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-muted)]">
            {APP_NAME}
          </p>
          <CardTitle className="font-heading text-3xl tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription className="max-w-md text-sm leading-6">
            {mode === "login"
              ? "Pick up today’s habits, weekly targets, and challenge pacing in one place."
              : "Create a real account with Supabase authentication and keep your data private to your session."}
          </CardDescription>
        </div>
        {!supabaseEnabled ? (
          <div className="rounded-2xl border border-[color:var(--brand-teal)]/20 bg-[color:var(--brand-teal)]/8 px-4 py-3 text-sm text-[color:var(--brand-teal)]">
            Supabase environment variables are missing. The auth buttons stay interactive, but requests will fail until they are configured.
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="Stanley Redemann" {...form.register("fullName")} />
              {form.formState.errors.fullName ? (
                <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="At least 8 characters" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          {authError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {authError}
            </div>
          ) : null}

          <Button
            className="h-12 w-full rounded-2xl bg-[color:var(--brand-coral)] text-white hover:bg-[color:var(--brand-coral)]/90"
            disabled={pending}
            type="submit"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="relative flex items-center justify-center text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <span className="absolute inset-x-0 h-px bg-border" />
          <span className="relative bg-card px-3">or continue with</span>
        </div>

        <Button className="h-12 w-full rounded-2xl" disabled={pending} variant="outline" onClick={handleGoogle} type="button">
          <Chrome />
          Continue with Google
        </Button>

        <p className="text-sm text-muted-foreground">
          {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 text-[color:var(--brand-teal)]")}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </Link>
        </p>
        {mode === "login" ? (
          <p className="text-sm text-muted-foreground">
            Password reset is not wired yet. Use Supabase Auth email templates/flows next if you want recovery enabled.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
