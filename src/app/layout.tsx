// app/layout.tsx
import "./globals.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import "leaflet/dist/leaflet.css";
import Providers from "../components/Providers";
import Sidebar from "../components/Sidebar"; // Sidebar is a client component (has "use client")

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
      <body className="flex flex-col h-screen">
        <Providers>
          <Header />
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 min-h-0 overflow-auto">
              {children}
            </main>
          </div>
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}