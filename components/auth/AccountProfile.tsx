"use client";

// Clerk's custom profile pages (UserProfile.Page) must be declared in a client component.
import { UserProfile } from "@clerk/nextjs";
import { Package } from "lucide-react";
import { OrdersPanel } from "@/components/orders/OrdersPanel";
import { clerkAppearance } from "./appearance";

export function AccountProfile() {
  return (
    <UserProfile
      path="/account"
      appearance={{
        ...clerkAppearance,
        elements: { ...clerkAppearance.elements, rootBox: "w-full", cardBox: "w-full max-w-none shadow-none rounded-sm border border-hairline" },
      }}
    >
      <UserProfile.Page label="account" />
      <UserProfile.Page label="Orders" url="orders" labelIcon={<Package size={16} />}>
        <OrdersPanel />
      </UserProfile.Page>
      <UserProfile.Page label="security" />
    </UserProfile>
  );
}
