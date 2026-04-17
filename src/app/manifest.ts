import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WearWise — AI-Powered Personal Stylist",
    short_name: "WearWise",
    description:
      "Shop, get outfit recommendations, and track orders through conversation with an AI stylist.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#4A7C59",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "AI Stylist",
        short_name: "Chat",
        url: "/assistant",
        description: "Open the AI stylist chat",
      },
      {
        name: "Browse",
        short_name: "Shop",
        url: "/browse",
      },
    ],
  }
}
