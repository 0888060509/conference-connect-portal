
import React from "react";
import {
  Projector,
  Tv,
  Video,
  PenTool,
  Coffee,
  Droplet,
  Speaker,
  Wifi,
  Plug,
  Thermometer,
  Package,
  Presentation,
  Server,
  HelpCircle
} from "lucide-react";

interface AmenityIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function AmenityIcon({ icon, className, size = 20 }: AmenityIconProps) {
  const IconComponent = getIconComponent(icon);
  
  return <IconComponent className={className} size={size} />;
}

function getIconComponent(icon: string) {
  switch (icon.toLowerCase()) {
    case "projector":
      return Projector;
    case "tv":
      return Tv;
    case "video":
      return Video;
    case "pen-tool":
      return PenTool;
    case "coffee":
      return Coffee;
    case "droplet":
      return Droplet;
    case "speaker":
      return Speaker;
    case "wifi":
      return Wifi;
    case "plug":
      return Plug;
    case "thermometer":
      return Thermometer;
    case "package":
      return Package;
    case "presentation":
      return Presentation;
    case "server":
      return Server;
    default:
      return HelpCircle;
  }
}
