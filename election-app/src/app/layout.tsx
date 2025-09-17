// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'sonner';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}