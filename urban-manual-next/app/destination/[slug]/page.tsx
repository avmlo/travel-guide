'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Destination } from '@/types/destination';
import { MapPin, Star, ArrowLeft, Tag } from 'lucide-react';

export default function DestinationPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestination();
  }, [slug]);

  const fetchDestination = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setDestination(data);
    } catch (error) {
      console.error('Error fetching destination:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 dark:text-gray-400 hover:opacity-60"
          >
            Return to catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:opacity-60 mb-8 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Hero Image */}
      {destination.image && (
        <div className="aspect-[16/9] rounded-lg overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            {destination.name}
          </h1>
          {destination.crown && (
            <span className="text-4xl flex-shrink-0">👑</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
          <button
            onClick={() => router.push(`/city/${encodeURIComponent(destination.city)}`)}
            className="flex items-center gap-2 hover:opacity-60 transition-opacity"
          >
            <MapPin className="h-5 w-5" />
            <span className="font-medium">{destination.city}</span>
          </button>

          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <span className="font-medium">{destination.category}</span>
          </div>

          {destination.michelin_stars && destination.michelin_stars > 0 && (
            <div className="flex items-center gap-2">
              {Array.from({ length: destination.michelin_stars }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-red-500 text-red-500" />
              ))}
              <span className="font-medium">
                {destination.michelin_stars} Michelin Star{destination.michelin_stars !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {destination.content && (
        <div className="prose dark:prose-invert max-w-none mb-8">
          <div className="text-lg leading-relaxed whitespace-pre-wrap">
            {destination.content}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-900 dark:hover:border-gray-100 transition-colors font-medium"
        >
          Back to Catalogue
        </button>
        <button
          onClick={() => router.push(`/city/${encodeURIComponent(destination.city)}`)}
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity font-medium"
        >
          Explore {destination.city}
        </button>
      </div>
    </div>
  );
}
