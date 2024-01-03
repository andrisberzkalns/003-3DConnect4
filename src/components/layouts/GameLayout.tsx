import { ReactNode } from "react";
import Navbar from "~/components/Navbar";

const GameLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <main className="flex min-h-screen bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="absolute h-full w-full border-[1em] border-white/10"></div>
        <div className="flex h-screen flex-col items-center justify-center">
          {children}
        </div>
      </main>
      <Navbar />
    </>
  );
};

export default GameLayout;
