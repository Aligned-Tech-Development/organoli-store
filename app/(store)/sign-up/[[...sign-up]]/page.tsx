import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/components/auth/appearance";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell eyebrow="New here" title="Join the shelf." lede="Create an Organoli account with your email and a password. It takes a minute.">
      <SignUp appearance={clerkAppearance} path="/sign-up" signInUrl="/sign-in" />
    </AuthShell>
  );
}
