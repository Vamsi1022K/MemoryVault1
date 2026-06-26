import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are protected (require user to be logged in)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/memories(.*)",
  "/categories(.*)",
  "/reminders(.*)",
  "/ai-assistant(.*)",
  "/storage-advisor(.*)",
  "/api(.*)", // Protect all api routes
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if this is a public webhook route
  const isWebhook = req.nextUrl.pathname.startsWith("/api/webhooks");

  if (isProtectedRoute(req) && !isWebhook) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[\\w]+$|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
