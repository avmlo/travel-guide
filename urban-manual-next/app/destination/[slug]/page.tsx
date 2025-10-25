'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, MapPin, ArrowLeft, ExternalLink, Heart, CheckCircle2 } from "lucide-react";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";

interface DestinationDetailProps {
  params: {
    slug: string;
  };
}

export default function DestinationDetail({ params }: DestinationDetailProps) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadDestination() {
      try {
        setLoading(true);

        // Load destination from Supabase
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (error) throw error;

        if (data) {
          // Transform Supabase data to match Destination type
          const transformedData: Destination = {
            name: data.name,
            slug: data.slug,
            city: data.city,
            category: data.category,
            content: data.content || data.description || '',
            mainImage: data.image || '',
            michelinStars: data.michelin_stars || 0,
            crown: data.crown || false,
            brand: '',
            cardTags: '',
            lat: 0,
            long: 0,
            myRating: 0,
            reviewed: false,
            subline: '',
          };
          setDestination(transformedData);
        }

        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          // Check if saved
          const { data: savedData } = await supabase
            .from('saved_places')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('destination_slug', params.slug)
            .single();

          setIsSaved(!!savedData);

          // Check if visited
          const { data: visitedData } = await supabase
            .from('visited_places')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('destination_slug', params.slug)
            .single();

          setIsVisited(!!visitedData);
        }
      } catch (error) {
        console.error("Error loading destination:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDestination();
  }, [params.slug]);

  const handleSaveToggle = async () => {
    if (!user) {
      router.push('/account');
      return;
    }

    try {
      if (isSaved) {
        // Remove from saved
        await supabase
          .from('saved_places')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_slug', params.slug);
        setIsSaved(false);
      } else {
        // Add to saved
        await supabase
          .from('saved_places')
          .insert({
            user_id: user.id,
            destination_slug: params.slug,
            saved_at: new Date().toISOString(),
          });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleVisitToggle = async () => {
    if (!user) {
      router.push('/account');
      return;
    }

    try {
      if (isVisited) {
        // Remove from visited
        await supabase
          .from('visited_places')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_slug', params.slug);
        setIsVisited(false);
      } else {
        // Add to visited
        await supabase
          .from('visited_places')
          .insert({
            user_id: user.id,
            destination_slug: params.slug,
            visited_at: new Date().toISOString(),
          });
        setIsVisited(true);
      }
    } catch (error) {
      console.error('Error toggling visit:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-lg text-gray-400 dark:text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="flex flex-col items-center justify-center gap-4 h-[60vh]">
          <div className="text-lg text-gray-400 dark:text-gray-600">Destination not found</div>
          <Button onClick={() => router.push("/")} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero Image */}
      <section className="relative h-[60vh] bg-gray-100 dark:bg-gray-900">
        {destination.mainImage ? (
          <img
            src={destination.mainImage}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <MapPin className="h-32 w-32 opacity-20" />
          </div>
        )}
        {destination.crown && (
          <div className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg">
            <Crown className="h-6 w-6" />
          </div>
        )}
      </section>

      {/* Content */}
      <section className="py-12 dark:text-white">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Title */}
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              {destination.name}
            </h2>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{destination.city.charAt(0).toUpperCase() + destination.city.slice(1)}</span>
              </div>

              {destination.category && (
                <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full">
                  {destination.category}
                </Badge>
              )}

              {destination.michelinStars > 0 && (
                <Badge className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-full">
                  {destination.michelinStars} ⭐ Michelin
                </Badge>
              )}

              {destination.reviewed && (
                <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                  Reviewed
                </Badge>
              )}
            </div>

            {/* User Actions */}
            {user && (
              <div className="flex gap-3 mb-8">
                <Button
                  variant={isSaved ? "default" : "outline"}
                  onClick={handleSaveToggle}
                  className="rounded-full"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant={isVisited ? "default" : "outline"}
                  onClick={handleVisitToggle}
                  className="rounded-full"
                >
                  <CheckCircle2 className={`h-4 w-4 mr-2 ${isVisited ? 'fill-current' : ''}`} />
                  {isVisited ? 'Visited' : 'Mark as Visited'}
                </Button>
              </div>
            )}

            {/* Rating */}
            {destination.myRating > 0 && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">Rating</div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < destination.myRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-semibold">
                    {destination.myRating}/5
                  </span>
                </div>
              </div>
            )}

            {/* Subline */}
            {destination.subline && (
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {destination.subline}
              </p>
            )}

            {/* Description */}
            {destination.content && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {destination.content}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ', ' + destination.city)}`, '_blank')}
              >
                <MapPin className="h-5 w-5 mr-2" />
                View on Map
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SimpleFooter />
    </div>
  );
}
