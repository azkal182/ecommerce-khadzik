import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { applyStoreTheme } from "@/lib/theme";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { CartProvider } from "@/contexts/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dual Store - Indonesia's Premium Shopping Destination",
  description: "Discover amazing products from our curated stores. Fashion, watches, and more - all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased store-theme-transition`}
        suppressHydrationWarning
      >
        <SessionProviderWrapper>
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
