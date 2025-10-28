import { router, publicProcedure } from '@/lib/trpc/server';
import { z } from 'zod';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const placesRouter = router({
  // Enrich a destination with Google Places data
  enrichDestination: publicProcedure
    .input(z.object({
      name: z.string(),
      city: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        if (!GOOGLE_PLACES_API_KEY) {
          throw new Error('Google Places API key not configured');
        }

        const { name, city } = input;
        const query = `${name}, ${city}`;

        // Find Place from Text
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
        const searchParams = {
          input: query,
          inputtype: 'textquery',
          fields: 'place_id,name',
          key: GOOGLE_PLACES_API_KEY,
        };

        const searchResponse = await axios.get(searchUrl, { params: searchParams });

        if (!searchResponse.data.candidates || searchResponse.data.candidates.length === 0) {
          throw new Error('Place not found on Google');
        }

        const placeId = searchResponse.data.candidates[0].place_id;

        // Get Place Details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
        const detailsParams = {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total,price_level,geometry,url,editorial_summary,reviews',
          key: GOOGLE_PLACES_API_KEY,
        };

        const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });

        if (detailsResponse.data.status !== 'OK') {
          throw new Error(`Failed to fetch place details: ${detailsResponse.data.status}`);
        }

        const result = detailsResponse.data.result;

        return {
          success: true,
          data: {
            name: result.name,
            address: result.formatted_address,
            phone: result.formatted_phone_number || result.international_phone_number,
            website: result.website,
            opening_hours: result.opening_hours,
            rating: result.rating,
            user_ratings_total: result.user_ratings_total,
            price_level: result.price_level,
            location: result.geometry?.location,
            google_maps_url: result.url,
            place_id: placeId,
            editorial_summary: result.editorial_summary?.overview,
            reviews: result.reviews?.slice(0, 3), // Only return top 3 reviews
          }
        };

      } catch (error: any) {
        console.error('Error enriching destination:', error.message);
        return {
          success: false,
          error: error.message || 'Failed to enrich destination'
        };
      }
    }),
});
