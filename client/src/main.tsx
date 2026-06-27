import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in client/.env");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      localization={{
        optionalField: "(optional)",
      } as any}
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#090d16",
          colorText: "#f1f5f9",
          colorInputBackground: "#020617",
          colorInputText: "#f1f5f9",
          colorBorder: "#1e293b",
          colorTextSecondary: "#94a3b8",
        },
        elements: {
          card: "bg-[#090d16] border border-slate-800/80 rounded-2xl shadow-2xl",
          formButtonPrimary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-2.5",
          formFieldInput: "bg-[#020617] border border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
          socialButtonsBlockButton: "bg-[#020617] border border-slate-800 text-slate-200 hover:bg-slate-900 rounded-xl",
          dividerLine: "bg-slate-850",
          footer: "bg-[#090d16] border-t border-slate-800/80",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
          identityPreview: "bg-slate-900 border border-slate-800 text-slate-100 rounded-xl",
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
