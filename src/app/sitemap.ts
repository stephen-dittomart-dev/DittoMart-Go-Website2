import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] =
  [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/network", priority: 0.95, changeFrequency: "weekly" },
    { path: "/platform", priority: 0.9, changeFrequency: "monthly" },
    { path: "/cold-chain", priority: 0.85, changeFrequency: "monthly" },
    { path: "/developers", priority: 0.9, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
