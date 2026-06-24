"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { requestPasswordReset } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const { error } = await requestPasswordReset({
      email: values.email,
      redirectTo: ROUTES.resetPassword,
    });

    // Always show success to avoid leaking which emails are registered.
    if (error && error.status !== 200) {
      // Still present a neutral message; log for diagnostics only.
      console.error("[forgot-password]", error);
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="grid gap-4 text-center">
        <MailCheck className="text-primary mx-auto size-10" />
        <p className="text-sm">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href={ROUTES.signIn} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
          Back to sign in
        </Link>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
        <Link href={ROUTES.signIn} className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
          Back to sign in
        </Link>
      </form>
    </Form>
  );
}
