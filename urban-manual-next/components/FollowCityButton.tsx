'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FollowCityButtonProps {
  city: string;
  variant?: 'default' | 'compact';
}

export function FollowCityButton({ city, variant = 'default' }: FollowCityButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndFollowStatus();
  }, [city]);

  const checkAuthAndFollowStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    if (session?.user) {
      // Check if user is already following this city
      const { data } = await supabase
        .from('followed_cities')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('city', city)
        .single();

      setIsFollowing(!!data);
    }
  };

  const toggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick

    if (!user) {
      toast.error('Please sign in to follow cities');
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followed_cities')
          .delete()
          .eq('user_id', user.id)
          .eq('city', city);

        if (error) throw error;

        setIsFollowing(false);
        toast.success(`Unfollowed ${city}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('followed_cities')
          .insert({
            user_id: user.id,
            city
          });

        if (error) throw error;

        setIsFollowing(true);
        toast.success(`Following ${city}`);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleFollow}
        disabled={isLoading}
        className={`p-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${
          isFollowing
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isFollowing ? `Unfollow ${city}` : `Follow ${city}`}
        aria-pressed={isFollowing}
      >
        <Heart
          className={`h-4 w-4 transition-transform ${isFollowing ? 'fill-current scale-110' : ''}`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 ${
        isFollowing
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isFollowing ? `Unfollow ${city}` : `Follow ${city}`}
      aria-pressed={isFollowing}
    >
      <Heart
        className={`h-4 w-4 transition-transform ${isFollowing ? 'fill-current' : ''}`}
        aria-hidden="true"
      />
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
    </button>
  );
}
