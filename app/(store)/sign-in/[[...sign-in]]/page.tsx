import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { labelAppearance } from "@/components/auth/appearance";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn appearance={labelAppearance} path="/sign-in" signUpUrl="/sign-up" />
    </AuthShell>
  );
}
