import { MetadataRoute } from 'next';

import { supabase } from '@/lib/supabase';

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theurbanmanual.com').replace(/\/$/, '');

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: MetadataRoute.Sitemap[number]['priority'];
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/cities', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/explore', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/account', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/saved', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/trips', changeFrequency: 'weekly', priority: 0.6 },
];

const now = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const [destinationsResult, citiesResult] = await Promise.all([
    supabase.from('destinations').select('slug, updated_at').not('slug', 'is', null),
    supabase.from('destinations').select('city').not('city', 'is', null),
  ]);

  const destinationPages: MetadataRoute.Sitemap = (destinationsResult.data ?? [])
    .filter((destination): destination is { slug: string; updated_at: string | null } => Boolean(destination.slug))
    .map((destination) => ({
      url: `${BASE_URL}/destination/${encodeURIComponent(destination.slug)}`,
      lastModified: destination.updated_at ? new Date(destination.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const cityPages: MetadataRoute.Sitemap = Array.from(
    new Set((citiesResult.data ?? []).map((cityRecord) => cityRecord.city).filter((city): city is string => Boolean(city)))
  )
    .sort()
    .map((city) => ({
      url: `${BASE_URL}/city/${encodeURIComponent(city)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [...staticPages, ...cityPages, ...destinationPages];
}
