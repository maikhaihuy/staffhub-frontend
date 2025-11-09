import Providers from '@/app/providers';
import '@/app/globals.css';
import { ReactNode } from 'react';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
