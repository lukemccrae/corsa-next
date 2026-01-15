// app/layout.tsx (root layout) — remove the Sidebar here so sub-layouts can opt-in
import "./globals.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import "leaflet/dist/leaflet.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "CORSA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen">
        <Providers>
          <Header />
          {/* children decide the content shell (some may provide a sidebar) */}
          <main className="flex-1 min-h-0 overflow-auto">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}