import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Destination as DestinationType } from "@/types/destination";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Navigation, Heart, CheckCircle2, Share2 } from "lucide-react";
import { GoogleMap } from "@/components/GoogleMap";
import { ReviewsList } from "@/components/ReviewsList";
import { toast } from "sonner";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Destination() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [destination, setDestination] = useState<DestinationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchDestination() {
      if (!params.slug) return;

      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (error) {
        console.error('Error fetching destination:', error);
        setLocation('/');
        return;
      }

      setDestination({
        ...data,
        mainImage: data.main_image,
        michelinStars: data.michelin_stars || 0,
        additionalImages: data.additional_images || []
      });
      setLoading(false);
    }

    fetchDestination();
  }, [params.slug, setLocation]);

  useEffect(() => {
    async function checkSavedAndVisited() {
      if (!user || !destination) return;

      // Check if saved
      const { data: savedData } = await supabase
        .from('saved_destinations')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug)
        .single();

      setIsSaved(!!savedData);

      // Check if visited
      const { data: visitedData } = await supabase
        .from('visited_destinations')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug)
        .single();

      setIsVisited(!!visitedData);
    }

    checkSavedAndVisited();
  }, [user, destination]);

  const handleShare = async () => {
    if (!destination) return;
    
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save destinations");
      return;
    }

    if (!destination) return;

    if (isSaved) {
      const { error } = await supabase
        .from('saved_destinations')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug);

      if (error) {
        toast.error("Failed to remove from saved");
      } else {
        setIsSaved(false);
        toast.success("Removed from saved");
      }
    } else {
      const { error } = await supabase
        .from('saved_destinations')
        .insert({
          user_id: user.id,
          destination_slug: destination.slug
        });

      if (error) {
        toast.error("Failed to save destination");
      } else {
        setIsSaved(true);
        toast.success("Saved!");
      }
    }
  };

  const handleVisited = async () => {
    if (!user) {
      toast.error("Please sign in to mark as visited");
      return;
    }

    if (!destination) return;

    if (isVisited) {
      const { error } = await supabase
        .from('visited_destinations')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug);

      if (error) {
        toast.error("Failed to remove from visited");
      } else {
        setIsVisited(false);
        toast.success("Removed from visited");
      }
    } else {
      const { error } = await supabase
        .from('visited_destinations')
        .insert({
          user_id: user.id,
          destination_slug: destination.slug,
          visited_at: new Date().toISOString()
        });

      if (error) {
        toast.error("Failed to mark as visited");
      } else {
        setIsVisited(true);
        toast.success("Marked as visited!");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  if (!destination) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[80vh]">
        {/* Left Column: Metadata */}
        <div className="px-8 sm:px-12 lg:px-16 py-16 lg:py-24 bg-gray-50">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal mb-16">
            {destination.name}
          </h1>

          {/* Metadata Grid */}
          <div className="space-y-10">
            {/* Category */}
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Category
              </div>
              <div className="text-base">{destination.category}</div>
            </div>

            {/* Location */}
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Location
              </div>
              <div className="text-base">{capitalizeCity(destination.city)}</div>
            </div>

            {/* Michelin Stars */}
            {destination.michelinStars > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Michelin Stars
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(destination.michelinStars)].map((_, i) => (
                    <img 
                      key={i}
                      src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                      alt={`Michelin Star ${i + 1}`}
                      className="h-5 w-5"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {destination.website && (
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Website
                </div>
                <a
                  href={destination.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base hover:underline"
                >
                  {destination.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hero Image + Description */}
        <div className="flex flex-col">
          {/* Hero Image */}
          <div className="w-full h-[50vh] lg:h-[60vh]">
            <img
              src={destination.mainImage}
              alt={destination.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Description */}
          <div className="px-8 sm:px-12 lg:px-16 py-16 bg-gray-50">
            {destination.content && (
              <p className="text-lg lg:text-xl leading-relaxed text-gray-700 mb-12">
                {destination.content.replace(/<[^>]*>/g, '')}
              </p>
            )}

            {/* Action Buttons */}
            {user && (
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-5 py-3 text-sm border transition-colors ${
                    isSaved
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleVisited}
                  className={`flex items-center gap-2 px-5 py-3 text-sm border transition-colors ${
                    isVisited
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${isVisited ? 'fill-current' : ''}`} />
                  <span>{isVisited ? 'Visited' : 'Mark as Visited'}</span>
                </button>
              </div>
            )}

            {/* Directions and Share */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                <span>Directions</span>
              </a>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Image Section (if available) */}
      {destination.additionalImages && destination.additionalImages.length > 0 && (
        <div className="w-full h-[60vh]">
          <img
            src={destination.additionalImages[0]}
            alt={`${destination.name} additional view`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Map Section */}
      <div className="px-8 sm:px-12 lg:px-16 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-8">
            Location
          </h2>
          <GoogleMap destination={destination} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="px-8 sm:px-12 lg:px-16 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ReviewsList
            destinationSlug={destination.slug}
            destinationName={destination.name}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white px-8 sm:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal mb-6">
            Explore More Destinations
          </h2>
          <p className="text-lg text-blue-200 mb-12">
            Discover curated places around the world
          </p>
          <button
            onClick={() => setLocation('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-950 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            View All Destinations
          </button>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}

