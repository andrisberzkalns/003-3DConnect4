import React from "react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Home } from "lucide-react";

export default () => {
  const router = useRouter();

  return (
    <main className="bg-gradient-to-b from-yellow-500 to-orange-900">
      <div className="z-19 absolute left-8 top-8 w-64">
        <Button
          onClick={() => {
            void router.push("/");
          }}
        >
          <Home />
        </Button>
      </div>
      <div className="flex h-screen items-center justify-center p-8 ">
        <div className="flex flex-col space-y-4 rounded-xl bg-black bg-opacity-20 p-8 text-white">
          <h1 className="mb-4 text-3xl font-bold">About</h1>
          <p>
            This is a 3D version of the classic 4 in a row game. It is made with
            React, Next.js, and Three.js.
          </p>
          <p>
            The source code is available on{" "}
            <a
              href="https://github.com/andrisberzkalns/003-3DConnect4"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              GitHub
            </a>
            .
          </p>
          <p>
            The game is made by{" "}
            <a
              href="https://berzkalns.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              Andris Bērzkalns
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
};
