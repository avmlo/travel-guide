import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "The Urban Manual",
  description: "Your guide to the world's best destinations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
