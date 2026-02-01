import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meet&Greet by MullenLowe GGK",
  description: "Connect with event participants through digital business cards",
  icons: {
    icon: '/Octopus-icon.png',
    shortcut: '/Octopus-icon.png',
    apple: '/Octopus-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <link rel="icon" href="/Octopus-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/Octopus-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Octopus-icon.png" />
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
        <link
          rel="preload"
          href="/fonts/auditype_extendednormal.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/auditype_extendedbold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* Preload critical images for main page - high priority */}
        <link
          rel="preload"
          href="/Octopus-icon.png"
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
        {/* DNS prefetch for external resources if needed */}
        <link rel="dns-prefetch" href="https://js.hcaptcha.com" />
        {/* Theme applied before paint to avoid flash (persisted in localStorage) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var id = localStorage.getItem('meetgreet-theme');
    if (id === 'audi') {
      var d = document.documentElement;
      d.setAttribute('data-theme', 'audi');
      d.style.setProperty('--theme-primary', '#000000');
      d.style.setProperty('--theme-primary-dark', '#1a1a1a');
      d.style.setProperty('--theme-button-gradient', 'linear-gradient(135deg, #bb0a30 0%, #8b0823 100%)');
      d.style.setProperty('--theme-logo-container', 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)');
      d.style.setProperty('--theme-font-family', "Audi Type Extended, Outfit, sans-serif");
    }
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
