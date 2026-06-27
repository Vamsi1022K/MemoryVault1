import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Sparkles, ShieldCheck, Database, Box } from "lucide-react";
import LandingShowcase from "@/components/LandingShowcase";
import GlowCard from "@/components/GlowCard";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-appBg text-appTextPrimary relative overflow-hidden animate-fade-in">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />

      {/* Drifting ambient glows */}
      <div className="absolute top-[10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-appPrimary/5 blur-[130px] pointer-events-none animate-float-1" />
      <div className="absolute top-[40%] right-[-15%] w-[450px] h-[450px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none animate-float-2" />
      <div className="absolute top-[70%] left-[10%] w-[350px] h-[350px] rounded-full bg-amber-550/3 blur-[120px] pointer-events-none animate-float-3" />

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-appBorder bg-white/75 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-appPrimary font-bold text-white shadow-md shadow-appPrimary/25">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-appTextPrimary">
            MemoryVault
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-appPrimary hover:bg-appPrimary-hover px-4 text-sm font-semibold text-white shadow-soft transition-all hover:scale-[1.01]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className="text-sm font-medium text-appTextSecondary hover:text-appTextPrimary transition-colors">
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-appPrimary hover:bg-appPrimary-hover px-4 text-sm font-semibold text-white shadow-soft transition-all hover:scale-[1.01]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 text-center max-w-7xl mx-auto w-full relative z-10 space-y-24">

        {/* Hero */}
        <section className="max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-appPrimary/25 bg-appPrimary-light/65 text-appPrimary text-[10px] font-bold tracking-wider uppercase shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-appPrimary animate-pulse" />
            AI-Powered Personal Memory Assistant
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-appTextPrimary leading-tight">
            Never forget where you kept your{" "}
            <span className="bg-gradient-to-r from-appPrimary via-purple-650 to-pink-500 bg-clip-text text-transparent block md:inline mt-1.5 md:mt-0 animate-text-shimmer">
              passports, keys, or gold
            </span>{" "}
            again.
          </h1>

          <p className="text-sm md:text-base text-appTextSecondary max-w-xl leading-relaxed">
            MemoryVault secure-logs your physical belongings, folders, and warranties. Talk naturally with an AI assistant that knows your vault to find anything instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none pt-4">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-appPrimary hover:bg-appPrimary-hover px-8 text-sm font-bold text-white shadow-lg shadow-appPrimary/20 transition-all hover:scale-[1.01] hover:-translate-y-0.5"
              >
                Access Your Vault
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-appPrimary hover:bg-appPrimary-hover px-8 text-sm font-bold text-white shadow-lg shadow-appPrimary/20 transition-all hover:scale-[1.01] hover:-translate-y-0.5"
                >
                  Start Free Today
                </Link>
                <Link
                  to="/sign-in"
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-appBorder bg-white px-8 text-sm font-semibold text-appTextPrimary hover:bg-appMuted shadow-soft transition-all hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="w-full space-y-8">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-appTextPrimary tracking-tight">
              Designed for physical storage tracking
            </h2>
            <p className="text-xs md:text-sm text-appTextSecondary">
              Explore the features that power MemoryVault's custom catalog.
            </p>
          </div>
          <LandingShowcase />
        </section>

        {/* Core Capabilities */}
        <section className="w-full max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-appTextPrimary tracking-tight">Core Capabilities</h2>
            <p className="text-xs md:text-sm text-appTextSecondary">High-value tracking features out of the box.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <GlowCard className="p-6 h-48">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-appPrimary-light text-appPrimary mb-4 group-hover:bg-appPrimary group-hover:text-white transition-all shadow-soft">
                    <Database className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-appTextPrimary mb-2">MongoDB Catalog</h3>
                  <p className="text-appTextSecondary text-xs leading-relaxed">
                    Map locations, categories, and item records stored in a MongoDB Atlas document database.
                  </p>
                </div>
              </div>
            </GlowCard>

            <GlowCard className="p-6 h-48">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-appPrimary-light text-appPrimary mb-4 group-hover:bg-appPrimary group-hover:text-white transition-all shadow-soft">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-appTextPrimary mb-2">Clerk Secure Auth</h3>
                  <p className="text-appTextSecondary text-xs leading-relaxed">
                    Protect catalog assets with Clerk enterprise-grade login authentication and protected routes.
                  </p>
                </div>
              </div>
            </GlowCard>

            <GlowCard className="p-6 h-48">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-appPrimary-light text-appPrimary mb-4 group-hover:bg-appPrimary group-hover:text-white transition-all shadow-soft">
                    <Box className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-appTextPrimary mb-2">Preservation Advisory</h3>
                  <p className="text-appTextSecondary text-xs leading-relaxed">
                    Query storage best-practices and safety tips powered by Gemini 2.5 Flash suggestions.
                  </p>
                </div>
              </div>
            </GlowCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-appTextSecondary border-t border-appBorder bg-white/90 backdrop-blur-md relative z-10">
        &copy; {new Date().getFullYear()} MemoryVault. Built with the MERN Stack.
      </footer>
    </div>
  );
}
