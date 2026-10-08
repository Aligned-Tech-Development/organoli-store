import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/components/auth/appearance";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthShell eyebrow="Your account" title="Welcome back." lede="Sign in to your Organoli account. Your bag and wishlist stay on this device either way.">
      <SignIn appearance={clerkAppearance} path="/sign-in" signUpUrl="/sign-up" />
    </AuthShell>
  );
}
