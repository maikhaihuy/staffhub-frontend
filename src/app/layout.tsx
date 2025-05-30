import Providers from '@/components/providers';
import '@/app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
