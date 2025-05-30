import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";

export interface AppSwitcherUrlConfig {
  name: string;
  url: string;
  logo: React.ElementType;
}

export const AppsSwitcherRoutes: AppSwitcherUrlConfig[] = [
  {
    name: "Employee Management App",
    logo: GalleryVerticalEnd,
    url: "em.site",
  },
  {
    name: "Inventory Managenement App",
    logo: AudioWaveform,
    url: "im.site",
  },
  {
    name: "Selas Management App",
    logo: Command,
    url: "sm.site",
  },
];