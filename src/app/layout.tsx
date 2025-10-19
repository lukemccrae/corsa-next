// app/layout.tsx
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./globals.css";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import "leaflet/dist/leaflet.css"; // <-- ensure Leaflet CSS is loaded globally
import "./globals.css";
export const metadata = {
  title: "My App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Make the page a column flex container limited to viewport height */}
      <body className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}