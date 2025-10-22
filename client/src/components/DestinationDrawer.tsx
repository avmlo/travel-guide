import { useState } from "react";
import { X, Share2, Check, Navigation } from "lucide-react";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { GoogleMap } from "@/components/GoogleMap";

interface DestinationDrawerProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  isVisited?: boolean;
}

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DestinationDrawer({ destination, isOpen, onClose }: DestinationDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!destination) return null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?destination=${destination.slug}`;
    const shareData = {
      title: destination.name,
      text: `Check out ${destination.name} in ${destination.city}`,
      url: shareUrl,
    };

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
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
          <h1 className="text-3xl sm:text-4xl font-normal mb-8 leading-tight">
            {destination.name}
          </h1>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Location & Category */}
          <div className="mb-8">
            <div className="flex flex-col gap-2 text-base text-gray-600">
              <div>
                <span className="text-gray-900">{capitalizeCity(destination.city)}</span>
              </div>
              <div>
                <span className="text-gray-900">{destination.category}</span>
              </div>
            </div>
          </div>

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
          {destination.michelinStars && destination.michelinStars > 0 && (
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

