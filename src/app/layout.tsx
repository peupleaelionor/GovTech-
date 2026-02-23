import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "GovTech AI — Intelligence Suite for African Governance",
  description: "Transform governance across African nations with AI-powered analytics, budget optimization, and real-time dashboards. Built for modern public administration.",
  keywords: ["GovTech", "AI Governance", "African Nations", "Public Administration", "Budget Optimization", "Analytics Dashboard"],
  authors: [{ name: "GovTech AI" }],
  openGraph: {
    title: "GovTech AI — Intelligence Suite",
    description: "AI-powered governance platform for African nations",
    siteName: "GovTech AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
