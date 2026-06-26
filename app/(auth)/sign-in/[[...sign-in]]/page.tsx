import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <SignIn
        routing="path"
        path="/sign-in"
        appearance={{
          elements: {
            card: "bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-6",
            headerTitle: "text-white font-bold text-xl",
            headerSubtitle: "text-slate-400 text-sm",
            socialButtonsBlockButton: "bg-slate-950 border border-slate-800 text-slate-250 hover:bg-slate-900/60 rounded-xl h-11 transition-all",
            socialButtonsBlockButtonText: "text-slate-250 font-medium",
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold h-10 shadow-md shadow-indigo-500/10 transition-all",
            formFieldLabel: "text-slate-350 text-xs font-semibold",
            formFieldInput: "bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all",
            footerActionText: "text-slate-450",
            footerActionLink: "text-indigo-400 hover:text-indigo-350 font-semibold",
            dividerLine: "bg-slate-805",
            dividerText: "text-slate-500 text-[11px]",
          },
        }}
      />
    </div>
  );
}
