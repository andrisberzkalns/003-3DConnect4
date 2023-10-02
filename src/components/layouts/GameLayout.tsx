import { ReactNode } from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

const GameLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <main className="flex min-h-screen bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="flex h-screen flex-col items-center justify-center">
          {children}
        </div>
      </main>
      <Navbar />
      <Footer />
    </>
  );
};

export default GameLayout;
