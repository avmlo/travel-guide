import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StytchProvider } from '@stytch/nextjs';
import { createStytchUIClient } from '@stytch/nextjs/ui';

const inter = Inter({ subsets: ['latin'] });

const stytch = createStytchUIClient(process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || '');

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
    <StytchProvider stytch={stytch}>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </StytchProvider>
  );
}
