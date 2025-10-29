import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StytchProvider } from '@/components/StytchProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Urban Manual - Discover Premium Destinations',
  description: 'A curated guide to the world\'s most exceptional places',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StytchProvider>
          {children}
        </StytchProvider>
      </body>
    </html>
  );
}
