import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const protectedPaths = ["/admin/", "/api/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: protectedPaths,
      },
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "DuckDuckBot",
          "Applebot",
        ],
        allow: "/",
        disallow: protectedPaths,
      },
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "OAI-AdsBot",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: protectedPaths,
      },
    ],
    sitemap: "https://uxdimeji.com/sitemap.xml",
    host: "https://uxdimeji.com",
  };
}
