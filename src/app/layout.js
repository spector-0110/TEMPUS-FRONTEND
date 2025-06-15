import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import ThemeProvider from '@/context/ThemeProvider';
import { HospitalProvider } from '@/context/HospitalProvider';
import { LogoutButton } from '@/components/ui/logout-button';
// import { ThemeToggle } from '@/components/ui/theme-toggle';

export const metadata = {
  title: 'Tiqora - Hospital Management System',
  description: 'Modern healthcare management platform',
  metadataBase: new URL('https://tiqora.in'),
  openGraph: {
    title: 'Tiqora - Hospital Management System',
    description: 'Modern healthcare management platform',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load Razorpay script only when needed instead of on all pages */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" defer data-lazy="true"></script>
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://backend.tiqora.in" />
        <link rel="dns-prefetch" href="https://backend.tiqora.in" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false} // disable following user's OS theme
          disableTransitionOnChange
        >
          <div className="fixed bottom-4 right-4 z-50">
            {/* <ThemeToggle /> */}
          </div>
          <AuthProvider>
            <HospitalProvider>
              <main className="min-h-[calc(100vh-64px)]">
                {children}
              </main>
              <LogoutButton />
            </HospitalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}