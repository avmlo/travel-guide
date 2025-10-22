import { useState, useEffect } from "react";
import { X, Share2, Check, Navigation, Heart, CheckCircle2 } from "lucide-react";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { GoogleMap } from "@/components/GoogleMap";

interface DestinationDrawerProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Category color mapping
const categoryColors: Record<string, string> = {
  'Hotel': 'bg-blue-100 text-blue-800',
  'Restaurant': 'bg-red-100 text-red-800',
  'Cafe': 'bg-yellow-100 text-yellow-800',
  'Bar': 'bg-purple-100 text-purple-800',
  'Museum': 'bg-green-100 text-green-800',
  'Gallery': 'bg-pink-100 text-pink-800',
  'Shop': 'bg-orange-100 text-orange-800',
  'Park': 'bg-teal-100 text-teal-800',
  'default': 'bg-gray-100 text-gray-800'
};

export function DestinationDrawer({ destination, isOpen, onClose }: DestinationDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function checkSavedAndVisited() {
      if (!user || !destination) return;

      // Check if saved
      const { data: savedData } = await supabase
        .from('saved_places')
        .select('id')
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug)
        .single();
      
      setIsSaved(!!savedData);

      // Check if visited
      const { data: visitedData } = await supabase
        .from('visited_places')
        .select('id')
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug)
        .single();
      
      setIsVisited(!!visitedData);
    }

    checkSavedAndVisited();
  }, [user, destination]);

  if (!destination) return null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?destination=${destination.slug}`;
    const shareData = {
      title: destination.name,
      text: `Check out ${destination.name} in ${destination.city}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleToggleSaved = async () => {
    if (!user) {
      toast.error("Please sign in to save places");
      return;
    }

    if (isSaved) {
      // Remove from saved
      await supabase
        .from('saved_places')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug);
      
      setIsSaved(false);
      toast.success("Removed from saved");
    } else {
      // Add to saved
      const { data: destData } = await supabase
        .from('destinations')
        .select('id')
        .eq('slug', destination.slug)
        .single();

      if (destData) {
        await supabase
          .from('saved_places')
          .insert({
            user_id: user.id,
            destination_id: destData.id,
            destination_slug: destination.slug
          });
        
        setIsSaved(true);
        toast.success("Added to saved");
      }
    }
  };

  const handleToggleVisited = async () => {
    if (!user) {
      toast.error("Please sign in to mark as visited");
      return;
    }

    if (isVisited) {
      // Remove from visited
      await supabase
        .from('visited_places')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug);
      
      setIsVisited(false);
      toast.success("Removed from visited");
    } else {
      // Add to visited
      const { data: destData } = await supabase
        .from('destinations')
        .select('id')
        .eq('slug', destination.slug)
        .single();

      if (destData) {
        await supabase
          .from('visited_places')
          .insert({
            user_id: user.id,
            destination_id: destData.id,
            destination_slug: destination.slug,
            visited_date: new Date().toISOString().split('T')[0],
            rating: 0,
            notes: ''
          });
        
        setIsVisited(true);
        toast.success("Marked as visited");
      }
    }
  };

  const categoryColor = categoryColors[destination.category] || categoryColors['default'];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-[85%] md:w-2/3 lg:w-1/2 bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Hero Image - Full Width */}
        {destination.mainImage && (
          <div className="relative w-full h-[60vh] overflow-hidden">
            <img 
              src={destination.mainImage} 
              alt={destination.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content - Generous Padding */}
        <div className="px-8 py-12 max-w-3xl">
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-normal mb-4 leading-tight">
            {destination.name}
          </h1>

          {/* Location & Category Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-sm text-gray-600">{capitalizeCity(destination.city)}</span>
            <span className="text-gray-300">•</span>
            <span className={`px-2 py-1 text-xs font-medium ${categoryColor}`}>
              {destination.category}
            </span>
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleToggleSaved}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  isSaved 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleToggleVisited}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  isVisited 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${isVisited ? 'fill-current' : ''}`} />
                {isVisited ? 'Visited' : 'Mark as Visited'}
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Directions Button */}
          <div className="mb-12">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              <span>Directions</span>
            </a>
          </div>

          {/* Michelin Stars */}
          {destination.michelinStars > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2">
                {[...Array(destination.michelinStars)].map((_, i) => (
                  <img 
                    key={i}
                    src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                    alt={`Michelin Star ${i + 1}`}
                    className="h-6 w-6"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {destination.content && (
            <>
              <h2 className="text-lg font-normal mb-6">About</h2>
              <div className="mb-12">
                <p className="text-base text-gray-700 leading-relaxed">
                  {destination.content.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            </>
          )}

          {/* Additional Images Gallery */}
          {destination.additionalImages && destination.additionalImages.length > 0 && (
            <>
              <h2 className="text-lg font-normal mb-6">Gallery</h2>
              <div className="grid grid-cols-2 gap-4 mb-12">
                {destination.additionalImages.map((image, index) => (
                  <div key={index} className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${destination.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* Map Section */}
          <div className="mb-12">
            <h2 className="text-lg font-normal mb-6">Location</h2>
            <GoogleMap destination={destination} />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* Share Section */}
          <div className="mb-12">
            <button
              onClick={handleShare}
              className="flex items-center gap-3 text-base hover:opacity-60 transition-opacity"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

