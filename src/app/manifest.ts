import type { MetadataRoute } from "next";
import { business } from "@/config/businessData";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: business.name,
    short_name: "Garg Paints",
    description: business.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F1E6",
    theme_color: "#8E3520",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
