import './globals.css';

export const metadata = {
  title: 'My App',
  description: 'Map app using Leaflet and Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
