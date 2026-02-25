import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Webhooksmith",
    short_name: "Webhooksmith",
    description: "Take control of your services' webhooks.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/webhooksmith.png",
        sizes: "800x800",
        type: "image/png",
      },
    ],
  };
}
