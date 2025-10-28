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
      <div className="px-4 md:px-6 lg:px-10 py-8 max-w-4xl mx-auto dark:text-white min-h-screen">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Destination not found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Return to catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-10 py-8 max-w-4xl mx-auto dark:text-white min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Hero Image */}
      {destination.image && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
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
          <h1 className="text-3xl md:text-4xl font-bold">
            {destination.name}
          </h1>
          {destination.crown && (
            <span className="text-3xl flex-shrink-0">👑</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => router.push(`/city/${encodeURIComponent(destination.city)}`)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{destination.city}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm">
            <Tag className="h-4 w-4" />
            <span className="font-medium">{destination.category}</span>
          </div>

          {destination.michelin_stars && destination.michelin_stars > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm">
              <img
                src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                alt="Michelin star"
                className="h-4 w-4"
              />
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
      <div className="flex gap-3 pt-8 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => router.push('/')}
          className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all font-medium"
        >
          Back to Catalogue
        </button>
        <button
          onClick={() => router.push(`/city/${encodeURIComponent(destination.city)}`)}
          className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-80 transition-opacity font-medium"
        >
          Explore {destination.city}
        </button>
      </div>
    </div>
  );
}
