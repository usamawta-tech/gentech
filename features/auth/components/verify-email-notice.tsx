"use client";

import * as React from "react";
import Link from "next/link";
import { MailCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { sendVerificationEmail } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Shown after sign-up (or when an unverified user tries to sign in).
 * Lets the user re-send the verification email.
 */
export function VerifyEmailNotice({ email }: { email: string | null }) {
  const [pending, setPending] = React.useState(false);

  async function resend() {
    if (!email) {
      toast.error("We don't have your email address. Please sign in again.");
      return;
    }
    setPending(true);
    const { error } = await sendVerificationEmail({ email, callbackURL: ROUTES.dashboard });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Could not resend the verification email.");
      return;
    }
    toast.success("Verification email sent.");
  }

  return (
    <div className="grid gap-4 text-center">
      <MailCheck className="text-primary mx-auto size-10" />
      <p className="text-sm">
        We&apos;ve sent a verification link{email ? ` to ` : ""}
        {email ? <span className="text-foreground font-medium">{email}</span> : ""}. Click it to
        activate your account.
      </p>
      <Button onClick={resend} variant="outline" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Resend verification email
      </Button>
      <Link href={ROUTES.signIn} className={cn(buttonVariants({ variant: "ghost" }), "w-full")}>
        Back to sign in
      </Link>
    </div>
  );
}
