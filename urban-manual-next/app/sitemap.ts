import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use environment variable or default to production URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theurbanmanual.com';
  const currentDate = new Date().toISOString();

  let destinationData: Destination[] = [];
  let cities: string[] = [];

  try {
    // Fetch all destinations and cities
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('slug, city')
      .order('slug');

    if (error) {
      console.warn('Sitemap: Could not fetch destinations from Supabase:', error.message);
    } else {
      destinationData = (destinations || []) as Destination[];
      // Get unique cities
      cities = Array.from(new Set(destinationData.map(d => d.city)));
    }
  } catch (error) {
    console.warn('Sitemap: Supabase not available during build, generating basic sitemap');
    // This is fine during build without env vars
  }

  // Static pages (public only - no auth-required pages)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cities`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // City pages
  const cityPages: MetadataRoute.Sitemap = cities.map(city => ({
    url: `${baseUrl}/city/${encodeURIComponent(city)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Destination pages - highest priority as they are the core content
  const destinationPages: MetadataRoute.Sitemap = destinationData.map(dest => ({
    url: `${baseUrl}/destination/${dest.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages, ...destinationPages];
}
