// React context for esttings
//

import { ReactNode, useState, createContext, createElement } from "react";

export type ShadowQuality = "off" | "low" | "medium" | "high";

type SettingnsContextType = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  shadowQuality: ShadowQuality;
  setShadowQuality: (quality: ShadowQuality) => void;
  toggleSound: () => void;
};

const SettingsContext = createContext<SettingnsContextType>({
  shadowQuality: "low",
  setShadowQuality: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
  toggleSound: () => {},
});

const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [shadowQuality, setShadowQuality] = useState<ShadowQuality>("low");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  const value: SettingnsContextType = {
    shadowQuality,
    setShadowQuality,
    soundEnabled,
    setSoundEnabled,
    toggleSound,
  };
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
