"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { clerkAppearance } from "./appearance";

/** Header account control: avatar menu when signed in, link to /sign-in otherwise. */
export function AccountButton({ size = 20 }: { size?: number }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn)
    return (
      <span className="flex h-11 w-11 items-center justify-center">
        {/* "Manage account" opens the full /account page rather than a modal */}
        <UserButton appearance={clerkAppearance} userProfileMode="navigation" userProfileUrl="/account" />
      </span>
    );
  return (
    <Link href="/sign-in" aria-label="Sign in" className="flex h-11 w-11 items-center justify-center rounded-sm hover:bg-paper-shade">
      <User size={size} strokeWidth={1.75} />
    </Link>
  );
}
