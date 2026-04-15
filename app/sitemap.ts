import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return [
    {
      url: `${baseUrl}/`,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signin`,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      priority: 0.7,
    },
  ];
}
