/**
 * User-related type definitions
 */

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  createdAt?: Date;
  lastSignedIn?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: Date;
  lastSignedIn: Date;
}

export interface ProfileStats {
  savedPlaces: number;
  visitedPlaces: number;
  reviews: number;
  lists: number;
  followers: number;
  following: number;
}

export interface UserPreferences {
  favoriteCategories: string[];
  favoriteCities: string[];
  interests: string[];
  updatedAt: Date;
}

export interface UserActivity {
  id: number;
  userId: string;
  destinationSlug: string;
  action: 'view' | 'search' | 'save' | 'unsave' | 'visit' | 'review';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SavedPlace {
  id: number;
  userId: string;
  destinationSlug: string;
  savedAt: Date;
  notes?: string;
}

export interface VisitedPlace {
  id: number;
  userId: string;
  destinationSlug: string;
  visitedDate: Date;
  rating?: number;
  notes?: string;
}