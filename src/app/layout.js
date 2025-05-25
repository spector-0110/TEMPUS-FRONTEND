import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import ThemeProvider from '@/context/ThemeProvider';
import { HospitalProvider } from '@/context/HospitalProvider';
import { LogoutButton } from '@/components/ui/logoutButton';
// import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata = {
  title: 'Tempus - Hospital Management System',
  description: 'Modern healthcare management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
           attribute="class"
           defaultTheme="system"
           enableSystem
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