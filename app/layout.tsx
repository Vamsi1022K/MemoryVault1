import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemoryVault - AI Personal Memory Assistant",
  description: "Keep track of physical items, important documents, reminders, and inventory with an AI-powered assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="dark h-full antialiased"
      >
        <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
