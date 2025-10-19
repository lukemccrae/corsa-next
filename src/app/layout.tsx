// app/layout.tsx
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./globals.css";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import "leaflet/dist/leaflet.css";
import Providers from "../components/Providers";

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
          <main className="flex-1 min-h-0 overflow-hidden">
            {children}
          </main>
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}