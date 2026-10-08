import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await currentUser();
  return (
    <CheckoutForm
      signedIn={!!user}
      defaults={{
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
        email: user?.primaryEmailAddress?.emailAddress ?? "",
      }}
    />
  );
}
