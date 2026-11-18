import { createFileRoute } from "@tanstack/react-router";

/** /sitemap.xml — every public page, on the production address. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { siteOrigin, PUBLIC_PATHS } = await import("@/server/site-url");
        const origin = siteOrigin(request);
        const urls = PUBLIC_PATHS.map(
          (path) =>
            `  <url>\n    <loc>${origin}${path}</loc>\n    <changefreq>${path === "/collections" ? "weekly" : "monthly"}</changefreq>\n    <priority>${path === "/" ? "1.0" : path === "/collections" ? "0.9" : "0.7"}</priority>\n  </url>`,
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
