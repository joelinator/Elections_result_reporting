// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { Toast } from '@/components/shared/Toast';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toast />
      </body>
    </html>
  );
}