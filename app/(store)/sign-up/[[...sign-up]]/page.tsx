import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";
import { labelAppearance } from "@/components/auth/appearance";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp appearance={labelAppearance} path="/sign-up" signInUrl="/sign-in" />
    </AuthShell>
  );
}
