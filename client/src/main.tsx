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
          colorPrimary: "#6D5BD0",
          colorBackground: "#FFFFFF",
          colorText: "#1F2937",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#1F2937",
          colorBorder: "#E7E5E4",
          colorTextSecondary: "#6B7280",
        },
        elements: {
          card: "bg-white border border-appBorder rounded-xl shadow-soft",
          formButtonPrimary: "bg-appPrimary hover:bg-appPrimary-hover text-white rounded-xl py-2.5 shadow-soft",
          formFieldInput: "bg-white border border-appBorder text-appTextPrimary rounded-xl focus:border-appPrimary focus:ring-1 focus:ring-appPrimary",
          socialButtonsBlockButton: "bg-white border border-appBorder text-appTextPrimary hover:bg-stone-50 rounded-xl",
          dividerLine: "bg-appBorder",
          footer: "bg-white border-t border-appBorder",
          footerActionLink: "text-appPrimary hover:text-appPrimary-hover",
          identityPreview: "bg-stone-50 border border-appBorder text-appTextPrimary rounded-xl",
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
