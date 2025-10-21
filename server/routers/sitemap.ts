import { Router } from "express";
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

router.get("/sitemap.xml", async (req, res) => {
  try {
    // Get all destinations from Supabase
    const { data: allDestinations, error } = await supabase
      .from('destinations')
      .select('slug');
    
    if (error) throw error;
    if (!allDestinations) throw new Error('No destinations found');
    
    const baseUrl = "https://urbanmanual.co";
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Account Page -->
  <url>
    <loc>${baseUrl}/account</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Auth Pages -->
  <url>
    <loc>${baseUrl}/auth/login</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Destinations -->
`;

    // Add each destination
    allDestinations.forEach((dest: any) => {
      sitemap += `  <url>
    <loc>${baseUrl}/?destination=${dest.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;

