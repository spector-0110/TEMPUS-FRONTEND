import { Metadata } from "next/types";
import { Geist } from "next/font/google";
import { EnhancedThemeProvider } from '@/context/ThemeProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { HospitalProvider } from '@/context/HospitalProvider';
import { LogoutButton } from '@/components/ui/logout-button';
import { Toaster } from "@/components/ui/Toaster";
import "@/styles/globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Tiqora - Healthcare Management Platform",
  description: "Modern healthcare management platform with seamless appointment scheduling and analytics",
  keywords: ["healthcare", "appointments", "hospital management", "medical"],
  authors: [{ name: "Tiqora Team" }],
  creator: "Tiqora",
  publisher: "Tiqora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/tiqora.ico",
    shortcut: "/tiqora.ico",
    apple: "/tiqora.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning className="cursor-safe">
      <body className={`${geistSans.className} antialiased cursor-safe`}>
        <EnhancedThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
           <AuthProvider>
            <HospitalProvider>
              <main className="min-h-[calc(100vh-64px)]">
                {children}
              </main>
              {/* <LogoutButton/> */}
            </HospitalProvider>
          </AuthProvider>
        </EnhancedThemeProvider>
      </body>
    </html>
  );
}
