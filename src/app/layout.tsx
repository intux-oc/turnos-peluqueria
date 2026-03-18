import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "@/components/nav-bar";
import { RegisterSW } from "@/components/RegisterSW";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Intux Studio - Peluquería Premium",
  description: "Reserva tu turno en la mejor peluquería y barbería de la ciudad.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Turnos Peluquería",
  },
  openGraph: {
    type: "website",
    siteName: "Turnos Peluquería",
    title: "Intux Studio - Reservas Online",
    description: "La forma más fácil de reservar tu turno en las mejores peluquerías.",
    images: ["/icons/icon-512x512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intux Studio - Reservas Online",
    description: "Reservá tu turno en segundos.",
    images: ["/icons/icon-512x512.png"],
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <Toaster theme="dark" position="bottom-right" />
          <RegisterSW />
          <NavBar />
          <main className="flex-1 flex flex-col pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
