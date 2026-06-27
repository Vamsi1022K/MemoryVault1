import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Sparkles, ShieldCheck, Database, Box } from "lucide-react";
import LandingShowcase from "@/components/LandingShowcase";
import GlowCard from "@/components/GlowCard";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />

      {/* Drifting ambient glows */}
      <div className="absolute top-[10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-float-1" />
      <div className="absolute top-[40%] right-[-15%] w-[450px] h-[450px] rounded-full bg-fuchsia-500/10 blur-[130px] pointer-events-none animate-float-2" />
      <div className="absolute top-[70%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-float-3" />

      {/* Blueprint rings */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-cyan-500/[0.025] pointer-events-none" style={{ animation: "spin 240s linear infinite" }} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-dashed border-fuchsia-500/[0.02] pointer-events-none" style={{ animation: "spin 120s linear infinite reverse" }} />

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-slate-900/80 bg-slate-950/65 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-500 font-bold text-slate-950 shadow-md shadow-cyan-500/10">
            M
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-fuchsia-300 bg-clip-text text-transparent">
            MemoryVault
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/10 transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/10 transition-all hover:opacity-90 hover:scale-[1.02]"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/25 bg-cyan-950/40 text-cyan-400 text-[10px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            AI-Powered Personal Memory Assistant
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Never forget where you kept your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent block md:inline mt-1.5 md:mt-0 animate-text-shimmer">
              passports, keys, or gold
            </span>{" "}
            again.
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-xl leading-relaxed">
            MemoryVault secure-logs your physical belongings, folders, and warranties. Talk naturally with an AI assistant that knows your vault to find anything instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none pt-4">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 px-8 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-90 hover:scale-[1.02] hover:-translate-y-0.5"
              >
                Access Your Vault
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 px-8 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-90 hover:scale-[1.02] hover:-translate-y-0.5"
                >
                  Start Free Today
                </Link>
                <Link
                  to="/sign-in"
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/45 px-8 text-sm font-semibold text-slate-200 hover:bg-slate-900/50 hover:text-white transition-all hover:-translate-y-0.5"
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
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Designed for physical storage tracking
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Explore the features that power MemoryVault's custom catalog.
            </p>
          </div>
          <LandingShowcase />
        </section>

        {/* Core Capabilities */}
        <section className="w-full max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Core Capabilities</h2>
            <p className="text-xs md:text-sm text-slate-500">High-value tracking features out of the box.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <GlowCard className="p-6 border border-slate-900/80 bg-slate-950/50 transition-all duration-300 hover:border-cyan-500/20 h-48 hover:-translate-y-1">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-cyan-400 mb-4 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                    <Database className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">MongoDB Catalog</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Map locations, categories, and item records stored in a MongoDB Atlas document database.
                  </p>
                </div>
              </div>
            </GlowCard>

            <GlowCard className="p-6 border border-slate-900/80 bg-slate-950/50 transition-all duration-300 hover:border-fuchsia-500/20 h-48 hover:-translate-y-1">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-fuchsia-400 mb-4 group-hover:bg-fuchsia-500 group-hover:text-slate-950 transition-all">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Clerk Secure Auth</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Protect catalog assets with Clerk enterprise-grade login authentication and protected routes.
                  </p>
                </div>
              </div>
            </GlowCard>

            <GlowCard className="p-6 border border-slate-900/80 bg-slate-950/50 transition-all duration-300 hover:border-pink-500/20 h-48 hover:-translate-y-1">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-pink-400 mb-4 group-hover:bg-pink-500 group-hover:text-slate-950 transition-all">
                    <Box className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Preservation Advisory</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Query storage best-practices and safety tips powered by Gemini 2.5 Flash suggestions.
                  </p>
                </div>
              </div>
            </GlowCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-700 border-t border-slate-900 bg-slate-950/90 backdrop-blur-md relative z-10">
        &copy; {new Date().getFullYear()} MemoryVault. Built with the MERN Stack.
      </footer>
    </div>
  );
}
