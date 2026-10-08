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
        <UserButton appearance={clerkAppearance}>
          <UserButton.MenuItems>
            <UserButton.Link label="Your account" labelIcon={<User size={14} />} href="/account" />
          </UserButton.MenuItems>
        </UserButton>
      </span>
    );
  return (
    <Link href="/sign-in" aria-label="Sign in" className="flex h-11 w-11 items-center justify-center rounded-sm hover:bg-paper-shade">
      <User size={size} strokeWidth={1.75} />
    </Link>
  );
}
