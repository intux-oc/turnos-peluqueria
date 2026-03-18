import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "@/components/nav-bar";
import { RegisterSW } from "@/components/RegisterSW";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

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
  title: "Intux Oc - Gestión Premium de Peluquerías",
  description: "La plataforma definitiva para gestionar tu peluquería, barbería o centro de estética.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Intux Oc",
  },
  openGraph: {
    type: "website",
    siteName: "Intux Oc",
    title: "Intux Oc - Reservas Online",
    description: "La forma más fácil de reservar tu turno en segundos.",
    images: ["/icons/icon-512x512.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intux Oc - Reservas Online",
    description: "Reservá tu turno en segundos.",
    images: ["/icons/icon-512x512.png"],
  },
};

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
