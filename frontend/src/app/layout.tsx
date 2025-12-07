import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import PWAInit from "@/components/PWAInit";
import InstallPWA from "@/components/InstallPWA";
import BluetoothPrinterManager from "@/components/BluetoothPrinterManager";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Professional fonts for printing
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Restaurant POS System",
  description:
    "Complete restaurant management with offline support, orders, inventory, and Bluetooth printing",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Restaurant POS",
  },
  applicationName: "Restaurant POS",
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Restaurant POS" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.className} ${sourceSans.variable} ${robotoMono.variable}`}
        suppressHydrationWarning
      >
        <PWAInit />
        <InstallPWA />
        {children}
        <BluetoothPrinterManager />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
