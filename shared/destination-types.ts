/**
 * Shared types for destinations across client and server
 */

export interface Destination {
  slug: string;
  name: string;
  city: string;
  category: string;
  rating?: string | number;
  description?: string;
  image?: string;
  address?: string;
  website?: string;
  phone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ScoredDestination extends Destination {
  score: number;
}
