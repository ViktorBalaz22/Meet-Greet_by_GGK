import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/contexts/SupabaseContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Business Cards",
  description: "Connect with event participants through digital business cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <link
          rel="preload"
          href="/fonts/WolpePegasus-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/WolpePegasus-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* Preload critical images for main page */}
        <link
          rel="preload"
          href="/Octopus-icon.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/bg.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/mobile-bg.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/1-Black.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/2-Black.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/3-Black.png"
          as="image"
          type="image/png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
