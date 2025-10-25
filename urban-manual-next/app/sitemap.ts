import { MetadataRoute } from 'next';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://theurbanmanual.com'; // Update with your actual domain

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/cities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  if (!isSupabaseConfigured()) {
    return staticPages;
  }

  try {
    const supabase = getSupabaseClient();

    // Fetch all destinations
    const { data: destinations } = await supabase
      .from('destinations')
      .select('slug, updated_at');

    const destinationPages: MetadataRoute.Sitemap = destinations?.map((dest) => ({
      url: `${baseUrl}/destination/${dest.slug}`,
      lastModified: dest.updated_at ? new Date(dest.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })) || [];

    // Fetch all cities
    const { data: citiesData } = await supabase
      .from('destinations')
      .select('city');

    const uniqueCities = [...new Set(citiesData?.map(d => d.city))];
    const cityPages: MetadataRoute.Sitemap = uniqueCities.map((city) => ({
      url: `${baseUrl}/city/${city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...cityPages, ...destinationPages];
  } catch (error) {
    console.error('Failed to generate sitemap from Supabase data:', error);
    return staticPages;
  }
}
