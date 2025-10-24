import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
);

interface DestinationRecord {
  slug: string | null;
  city: string | null;
}

const hasSlug = (
  destination: DestinationRecord,
): destination is DestinationRecord & { slug: string } =>
  typeof destination.slug === "string" && destination.slug.length > 0;

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const toUrlElement = ({ loc, lastmod, changefreq, priority }: UrlEntry) => {
  const lines = [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
  ];

  if (lastmod) {
    lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  }
  if (changefreq) {
    lines.push(`    <changefreq>${escapeXml(changefreq)}</changefreq>`);
  }
  if (priority) {
    lines.push(`    <priority>${escapeXml(priority)}</priority>`);
  }

  lines.push("  </url>");

  return lines.join("\n");
};

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("destinations")
      .select("slug, city");

    if (error) throw error;

    const destinations: DestinationRecord[] = data ?? [];

    const baseUrl = "https://urbanmanual.co";
    const today = new Date().toISOString().split("T")[0];

    const staticRoutes: UrlEntry[] = [
      { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0", lastmod: today },
      { loc: `${baseUrl}/auth/login`, changefreq: "monthly", priority: "0.5", lastmod: today },
      { loc: `${baseUrl}/account`, changefreq: "weekly", priority: "0.7", lastmod: today },
      { loc: `${baseUrl}/saved`, changefreq: "weekly", priority: "0.6", lastmod: today },
      { loc: `${baseUrl}/lists`, changefreq: "weekly", priority: "0.6", lastmod: today },
      { loc: `${baseUrl}/explore`, changefreq: "weekly", priority: "0.6", lastmod: today },
      { loc: `${baseUrl}/cities`, changefreq: "weekly", priority: "0.6", lastmod: today },
      { loc: `${baseUrl}/feed`, changefreq: "weekly", priority: "0.5", lastmod: today },
      { loc: `${baseUrl}/stats`, changefreq: "monthly", priority: "0.4", lastmod: today },
      { loc: `${baseUrl}/editorial`, changefreq: "weekly", priority: "0.5", lastmod: today },
      { loc: `${baseUrl}/privacy`, changefreq: "yearly", priority: "0.3", lastmod: today },
    ];

    const destinationEntries: UrlEntry[] = destinations
      .filter(hasSlug)
      .map((destination) => ({
        loc: `${baseUrl}/destination/${encodeURIComponent(destination.slug)}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod: today,
      }));

    const cityEntries: UrlEntry[] = Array.from(
      new Set(
        destinations
          .map((destination) => destination.city)
          .filter((city): city is string => Boolean(city))
      ),
    ).map((city) => ({
      loc: `${baseUrl}/city/${encodeURIComponent(city)}`,
      changefreq: "weekly",
      priority: "0.6",
      lastmod: today,
    }));

    const urls = [...staticRoutes, ...cityEntries, ...destinationEntries]
      .map(toUrlElement)
      .join("\n");

    const sitemap = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urls,
      "</urlset>",
    ]
      .filter(Boolean)
      .join("\n");

    res.header("Content-Type", "application/xml");
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
