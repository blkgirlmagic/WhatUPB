import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://whatupb.com",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://whatupb.com/login",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://whatupb.com/signup",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://whatupb.com/privacy",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://whatupb.com/terms",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://whatupb.com/content-policy",
      lastModified,
      changeFrequency: "weekly",
    },
  ];
}
