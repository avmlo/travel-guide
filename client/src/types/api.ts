// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface DestinationApiResponse {
  name: string;
  slug: string;
  city: string;
  category: string;
  content?: string;
  description?: string;
  image?: string;
  michelin_stars?: number;
  crown?: boolean;
  lat?: number;
  long?: number;
  rating?: number;
}

export interface SavedPlaceApiResponse {
  id: number;
  user_id: string;
  destination_slug: string;
  saved_at: string;
  notes?: string;
}

export interface VisitedPlaceApiResponse {
  id: number;
  user_id: string;
  destination_slug: string;
  visited_at: string;
  rating?: number;
  notes?: string;
}

export interface UserPreferencesApiResponse {
  id: number;
  user_id: string;
  favorite_categories?: string;
  favorite_cities?: string;
  interests?: string;
  updated_at: string;
}

export interface UserActivityApiResponse {
  id: number;
  user_id: string;
  destination_slug: string;
  action: 'view' | 'search' | 'save' | 'unsave';
  timestamp: string;
  metadata?: string;
}

// AI Response Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
}

export interface SmartSearchResponse {
  keywords: string[];
  categories: string[];
  cities: string[];
  requirements: string[];
  matchedDestinations: string[];
  explanation: string;
}

export interface ItineraryActivity {
  time: string;
  activity: string;
  destination: string;
  destinationSlug: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface ItineraryResponse {
  title: string;
  description: string;
  days: ItineraryDay[];
  tips: string[];
}

export interface SuggestionItem {
  slug: string;
  reason: string;
}

export interface SuggestionsResponse {
  suggestions: SuggestionItem[];
}

// Map Types
export interface MapKitConfig {
  token: string;
  region?: {
    centerLatitude: number;
    centerLongitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

// Chart Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  data: ChartData[];
  type: 'pie' | 'bar' | 'line';
  width?: number;
  height?: number;
}