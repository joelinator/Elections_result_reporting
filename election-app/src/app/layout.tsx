// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { Toast } from '@/components/shared/Toast';
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
        <Toast />
      </body>
    </html>
  );
}