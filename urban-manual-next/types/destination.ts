export interface Destination {
  name: string;
  brand: string;
  designer?: string;
  cardTags: string;
  category: string;
  city: string;
  content: string;
  description?: string;
  crown: boolean;
  lat: number;
  long: number;
  mainImage: string;
  main_image?: string; // Supabase field name
  additionalImages?: string[];
  michelinStars: number;
  michelin_stars?: number; // Supabase field name
  myRating: number;
  reviewed: boolean;
  slug: string;
  subline: string;
  website?: string;
  instagram?: string;
  google_maps?: string;
  tags?: string[];
}

