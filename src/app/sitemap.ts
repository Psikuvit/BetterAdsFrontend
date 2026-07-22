import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/login`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/register`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/forgot-password`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
