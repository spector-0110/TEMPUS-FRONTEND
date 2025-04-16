import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthProvider';

export const metadata = {
  title: 'Swasthify - Hospital Management System',
  description: 'Modern healthcare management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
