export interface UserStats {
  id: string;
  user_id: string;
  
  // Check-in stats
  level: number;
  points: number;
  cities_count: number;
  countries_count: number;
  places_count: number;
  mayorships_count: number;
  
  // Map clearing stats
  world_explored_percentage: number;
  miles_explored: number;
  
  // Premium
  is_premium: boolean;
  premium_expires_at?: string;
  
  // Metadata
  worldwide_rank?: number;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  destination_slug: string;
  checked_in_at: string;
  location_lat?: number;
  location_lng?: number;
  points_earned: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description?: string;
  icon?: string;
  unlocked_at: string;
}

export interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  locked?: boolean;
}

