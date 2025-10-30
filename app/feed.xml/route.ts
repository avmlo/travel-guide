import { NextResponse } from 'next/server';
import { Feed } from 'feed';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';

export async function GET() {
  try {
    // Determine base URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'https://theurbanmanual.com';

    // Initialize the feed
    const feed = new Feed({
      title: 'The Urban Manual',
      description: 'Discover the best restaurants, cafes, bars, and places around the world',
      id: baseUrl,
      link: baseUrl,
      language: 'en',
      image: `${baseUrl}/og-image.png`,
      favicon: `${baseUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, The Urban Manual`,
      updated: new Date(),
      generator: 'The Urban Manual RSS Generator',
      feedLinks: {
        rss2: `${baseUrl}/feed.xml`,
      },
    });

    // Fetch all destinations with full details
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .order('last_enriched_at', { ascending: false })
      .limit(100); // Limit to most recent 100 destinations

    if (error) {
      console.error('RSS Feed: Could not fetch destinations from Supabase:', error.message);
    } else if (destinations) {
      // Add each destination to the feed
      (destinations as Destination[]).forEach((dest) => {
        const destUrl = `${baseUrl}/destination/${dest.slug}`;

        // Build description with available details
        let description = dest.content || `${dest.name} in ${dest.city}`;

        // Add category info
        if (dest.category) {
          description = `${dest.category} - ${description}`;
        }

        // Add rating if available
        if (dest.rating) {
          description += ` (Rating: ${dest.rating}/5)`;
        }

        // Add Michelin stars if applicable
        if (dest.michelin_stars) {
          description += ` ${'⭐'.repeat(dest.michelin_stars)} Michelin`;
        }

        // Add crown badge if featured
        if (dest.crown) {
          description = `⭐ ${description}`;
        }

        feed.addItem({
          title: dest.name,
          id: destUrl,
          link: destUrl,
          description,
          content: dest.content || description,
          author: [
            {
              name: 'The Urban Manual',
              link: baseUrl,
            },
          ],
          date: dest.last_enriched_at ? new Date(dest.last_enriched_at) : new Date(),
          image: dest.image || undefined,
          category: dest.tags?.map(tag => ({ name: tag })) || (dest.category ? [{ name: dest.category }] : []),
        });
      });
    }

    // Generate RSS 2.0 XML
    const rss = feed.rss2();

    // Return the RSS feed with proper content type
    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('RSS Feed generation error:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
