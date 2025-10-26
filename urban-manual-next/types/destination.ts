export interface Destination {
  slug: string;
  name: string;
  city: string;
  category: string;
  content?: string;
  image?: string;
  michelin_stars?: number;
  crown?: boolean;
}
