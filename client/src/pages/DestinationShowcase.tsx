import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { EnhancedFooter } from "@/components/EnhancedFooter";

import { capitalizeCity } from "@/lib/stringUtils";
import { Destination } from "@/types/destination";

export default function DestinationShowcase() {
  const [, params] = useRoute("/showcase/:slug");
  const slug = params?.slug || "";
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadDestination() {
      if (!slug) return;

      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error loading destination:', error);
      } else if (data) {
        setDestination(data);
      }

      setLoading(false);
    }

    loadDestination();
  }, [slug]);

  useEffect(() => {
    async function loadReviews() {
      if (!slug) return;

      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('destination_slug', slug)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data) {
        setReviews(data);
      }
    }

    loadReviews();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Destination not found</div>
      </div>
    );
  }

  const topReview = reviews[0];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1440px] mx-auto px-10">
        {/* Hero Section - Split Layout */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Title Card */}
            <div className="bg-[#fbf9f7] rounded-xl p-8 flex items-end min-h-[480px]">
              <h1 className="text-5xl font-light text-gray-800">{destination.name}</h1>
            </div>

            {/* Right - Hero Image */}
            <div className="rounded-xl overflow-hidden min-h-[480px]">
              {destination.image && (
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </section>

        {/* Info Section - Split Layout */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Metadata */}
            <div className="bg-[#fbf9f7] rounded-xl p-8 space-y-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="text-base text-gray-700">{destination.category}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="text-base text-gray-700">{capitalizeCity(destination.city)}</p>
              </div>

              {destination.michelin_stars > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Michelin Stars</p>
                  <div className="flex gap-1">
                    {[...Array(destination.michelin_stars)].map((_, i) => (
                      <span key={i} className="text-red-600 text-xl">★</span>
                    ))}
                  </div>
                </div>
              )}

              {destination.brand && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Brand</p>
                  <Link href={`/brand/${destination.brand}`}>
                    <a className="text-base text-gray-900 hover:underline">
                      {destination.brand.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </a>
                  </Link>
                </div>
              )}

              {destination.website && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  <a
                    href={destination.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-900 hover:underline"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>

            {/* Right - Description */}
            <div className="bg-[#fbf9f7] rounded-xl p-8">
              <p className="text-2xl font-light text-gray-800 mb-8 leading-relaxed">
                {destination.description || destination.content?.substring(0, 200) + '...'}
              </p>

              {destination.content && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {destination.content.substring(0, 400)}
                  {destination.content.length > 400 && '...'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Full Width Image Section */}
        {destination.additional_images && destination.additional_images[0] && (
          <section className="py-12">
            <div className="rounded-xl overflow-hidden h-[560px]">
              <img
                src={destination.additional_images[0]}
                alt={`${destination.name} view`}
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        )}

        {/* Testimonial Section */}
        {topReview && (
          <section className="py-12">
            <div className="bg-[#fbf9f7] rounded-xl p-12">
              <Link href={`/destination/${slug}`}>
                <a className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors mb-12">
                  View all reviews
                </a>
              </Link>

              <blockquote className="mb-8">
                <p className="text-4xl font-light text-gray-800 leading-relaxed mb-8">
                  "{topReview.content.substring(0, 200)}
                  {topReview.content.length > 200 && '..."'}
                </p>
              </blockquote>

              <div className="border-t border-gray-300 pt-8">
                <div className="flex items-center gap-4">
                  {topReview.user_profiles?.avatar_url && (
                    <img
                      src={topReview.user_profiles.avatar_url}
                      alt={topReview.user_profiles.display_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {topReview.user_profiles?.display_name || 'Anonymous'}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(topReview.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <EnhancedFooter />
    </div>
  );
}

