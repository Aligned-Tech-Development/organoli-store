// Who can manage orders: accounts whose email is in STAFF_EMAILS (comma-separated)
// or whose Clerk public metadata has { "role": "staff" } or { "role": "admin" }.
import { currentUser } from "@clerk/nextjs/server";

export async function isStaff() {
  const user = await currentUser();
  if (!user) return false;
  const role = (user.publicMetadata as { role?: string }).role;
  if (role === "staff" || role === "admin") return true;
  const allowed = (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return user.emailAddresses.some((e) => e.verification?.status === "verified" && allowed.includes(e.emailAddress.toLowerCase()));
}
