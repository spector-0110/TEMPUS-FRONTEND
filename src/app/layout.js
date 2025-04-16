import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata = {
  title: 'Swasthify - Hospital Management System',
  description: 'Modern healthcare management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <main className="min-h-[calc(100vh-64px)]">
              {children}
            </main>
            <ThemeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
