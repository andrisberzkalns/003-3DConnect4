import React from "react";
import router from "next/router";
import { Button } from "~/components/ui/button";
import { Home } from "lucide-react";

export default function NavBar() {
  return (
    <>
      <div className="z-19 absolute left-8 top-8">
        <Button
          type="submit"
          className="w-full"
          onClick={() => {
            void router.push("/");
          }}
        >
          <Home className="mr-4" /> Menu
        </Button>
      </div>
    </>
  );
}
