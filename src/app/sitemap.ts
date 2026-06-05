import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://coinrep.com",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://coinrep.com/login",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://coinrep.com/signup",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://coinrep.com/privacy",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://coinrep.com/terms",
      lastModified,
      changeFrequency: "weekly",
    },
    {
      url: "https://coinrep.com/content-policy",
      lastModified,
      changeFrequency: "weekly",
    },
  ];
}
