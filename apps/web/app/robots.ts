import type { MetadataRoute } from "next";

function getBaseUrl(): string | null {
  try {
    return new URL(process.env.WEB_URL).origin;
  } catch {
    return null;
  }
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
