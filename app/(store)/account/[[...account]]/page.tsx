import type { Metadata } from "next";
import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/appearance";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="px-4 pb-20 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
      <span className="eyebrow">Your account</span>
      <h1 className="m-0 mt-4 font-display text-[60px] font-medium leading-[.85] lg:text-[112px]">Account</h1>
      <div className="mt-10">
        <UserProfile
          path="/account"
          appearance={{
            ...clerkAppearance,
            elements: { ...clerkAppearance.elements, rootBox: "w-full", cardBox: "w-full max-w-none shadow-none rounded-sm border border-hairline" },
          }}
        />
      </div>
    </div>
  );
}
