import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The account area and staff pages need a signed-in user; the store stays public.
const isAccountRoute = createRouteMatcher(["/account(.*)", "/admin(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isAccountRoute(req)) return;
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url });
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Clerk's auto-proxy path
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
