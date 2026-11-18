import { createFileRoute } from "@tanstack/react-router";

/**
 * /robots.txt — lets search engines crawl the public site, keeps them out of /admin, and points
 * them at the sitemap. Vercel preview deployments are blocked entirely so only production is indexed.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { siteOrigin, isIndexable } = await import("@/server/site-url");
        const body = isIndexable()
          ? `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteOrigin(request)}/sitemap.xml\n`
          : "User-agent: *\nDisallow: /\n";
        return new Response(body, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
