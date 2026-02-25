import type { MetadataRoute } from "next";

function getBaseUrl(): string | null {
  try {
    return new URL(process.env.WEB_URL).origin;
  } catch {
    return null;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return baseUrl
    ? [
        {
          url: `${baseUrl}/`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 1,
        },
      ]
    : [];
}
