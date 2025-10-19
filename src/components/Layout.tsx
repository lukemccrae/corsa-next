import { Footer } from "./Footer";
import { Header } from "./Header";

export const MapLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
};
