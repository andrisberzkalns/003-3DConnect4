import React from "react";
import router from "next/router";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Toggle } from "~/components/ui/toggle";
import { SettingsContext, ShadowQuality } from "~/contexts/settingsContext";
import {
  Menu,
  Home,
  Tally1,
  Tally2,
  Tally3,
  Tally4,
  Share2,
  Info,
} from "lucide-react";

const shadowQualityMap = {
  off: {
    value: 0,
    icon: <Tally1 className="mr-4" />,
  },
  low: {
    value: 1,
    icon: <Tally2 className="mr-4" />,
  },
  medium: {
    value: 2,
    icon: <Tally3 className="mr-4" />,
  },
  high: {
    value: 3,
    icon: <Tally4 className="mr-4" />,
  },
};

export default function NavBar() {
  const [isOpen, setMenuOpen] = React.useState(false); // [1
  const settings = React.useContext(SettingsContext);
  const shadowQuality = settings.shadowQuality;

  let defaultShadowQuality = shadowQualityMap[shadowQuality].value;

  return (
    <>
      <div className="z-19 absolute left-8 top-8 w-64">
        <Button onClick={() => setMenuOpen(!isOpen)}>
          <Menu />
        </Button>
        {isOpen && (
          <div className="mt-2 flex flex-col gap-2 rounded-xl rounded-tl-none bg-gray-900 bg-opacity-60 p-4">
            <Button
              className="w-full p-4"
              onClick={() => {
                void router.push("/");
              }}
            >
              <Home className="mr-4" />
              <p className="ml-2">Menu</p>
            </Button>

            <Button
              className="w-full p-4"
              onClick={() => {
                void router.push("/about");
              }}
            >
              <Info className="mr-4" />
              <p className="ml-2">About</p>
            </Button>

            <Button
              className="w-full p-4"
              onClick={() => {
                void router.push("/");
              }}
            >
              <Share2 className="mr-4" />
              <p className="ml-2">Share</p>
            </Button>
            <Label className="my-2 text-gray-300">Shadow quality</Label>
            <div className="flex flex-row gap-2">
              <Slider
                defaultValue={[defaultShadowQuality]}
                max={3}
                step={1}
                onValueChange={(event) => {
                  console.log();
                  switch (event[0]) {
                    case 0:
                      settings.setShadowQuality?.("off");
                      break;
                    case 1:
                      settings.setShadowQuality?.("low");
                      break;
                    case 2:
                      settings.setShadowQuality?.("medium");
                      break;
                    case 3:
                      settings.setShadowQuality?.("high");
                      break;
                  }
                }}
              />
            </div>
            <Label></Label>
            <Toggle
              className="text-white"
              onClick={() => settings.toggleSound()}
              pressed={settings.soundEnabled}
            >
              Sound {settings.soundEnabled ? "ON" : "OFF"}
            </Toggle>
          </div>
        )}
      </div>
    </>
  );
}
