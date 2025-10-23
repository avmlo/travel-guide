import { useState, useEffect } from "react";
import { X, Share2, Navigation, Heart, CheckCircle2, Maximize2, Minimize2 } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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
    
    const url = `${window.location.origin}?place=${destination.slug}`;
    
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
      // Remove from saved
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
      // Add to saved
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
      // Remove from visited
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
      // Add to visited
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

  if (!destination) return null;

  const categoryColor = categoryColors[destination.category] || categoryColors.default;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-950 shadow-xl transition-all duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isExpanded ? "w-full" : "w-full sm:w-[600px]"}`}
      >
        <div className="h-full overflow-y-auto">
          {/* Header with Close and Expand buttons */}
          <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 flex justify-between items-center px-8 py-6 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {isExpanded ? (
            // Expanded: Two-column layout (Clarity Ventures style)
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-80px)]">
              {/* Left Column: Metadata */}
              <div className="px-12 py-16 bg-gray-50 dark:bg-gray-900">
                <h1 className="text-4xl lg:text-5xl font-normal mb-12 text-black dark:text-white">{destination.name}</h1>

                {/* Metadata Grid */}
                <div className="space-y-8">
                  {/* Category */}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Category</div>
                    <div className="text-base text-black dark:text-white">{destination.category}</div>
                  </div>

                  {/* City */}
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Location</div>
                    <div className="text-base text-black dark:text-white">{capitalizeCity(destination.city)}</div>
                  </div>

                  {/* Michelin Stars */}
                  {destination.michelinStars > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Michelin Stars</div>
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

                  {/* Actions */}
                  {user && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Actions</div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          className={`flex items-center gap-2 px-4 py-2 text-sm border transition-colors ${
                            isSaved
                              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                              : 'bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          onClick={handleVisited}
                          className={`flex items-center gap-2 px-4 py-2 text-sm border transition-colors ${
                            isVisited
                              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                              : 'bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
                          }`}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${isVisited ? 'fill-current' : ''}`} />
                          <span>{isVisited ? 'Visited' : 'Mark as Visited'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Directions */}
                  <div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Directions</span>
                    </a>
                  </div>

                  {/* Share */}
                  <div>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{copied ? "Copied!" : "Share"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Image + Description */}
              <div className="flex flex-col">
                {/* Hero Image */}
                <div className="w-full aspect-square max-h-[60vh]">
                  <img
                    src={destination.mainImage}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Description */}
                <div className="px-12 py-16">
                  {destination.content && (
                    <p className="text-lg lg:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                      {destination.content.replace(/<[^>]*>/g, '')}
                    </p>
                  )}

                  {/* Map */}
                  <div className="mt-16">
                    <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Location</div>
                    <GoogleMap destination={destination} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Collapsed: Original single-column layout
            <div className="px-8 py-12">
              {/* Hero Image */}
              <div className="w-full aspect-square max-h-[60vh] mb-8">
                <img
                  src={destination.mainImage}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Title and Category */}
              <h1 className="text-3xl sm:text-4xl font-normal mb-4 text-black dark:text-white">{destination.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 text-xs font-medium ${categoryColor}`}>
                  {destination.category}
                </span>
                <span className="text-base text-gray-600 dark:text-gray-400">{capitalizeCity(destination.city)}</span>
              </div>

              {/* Action Buttons */}
              {user && (
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2 text-sm border transition-colors ${
                      isSaved
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleVisited}
                    className={`flex items-center gap-2 px-4 py-2 text-sm border transition-colors ${
                      isVisited
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-gray-900 text-black dark:text-white border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${isVisited ? 'fill-current' : ''}`} />
                    <span>{isVisited ? 'Visited' : 'Mark as Visited'}</span>
                  </button>
                </div>
              )}

              {/* Directions Button */}
              <div className="mb-12">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
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
                  <h2 className="text-lg font-normal mb-6 text-black dark:text-white">About</h2>
                  <div className="mb-12">
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {destination.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-12"></div>

              {/* Map Section */}
              <div className="mb-12">
                <h2 className="text-lg font-normal mb-6 text-black dark:text-white">Location</h2>
                <GoogleMap destination={destination} />
              </div>

              {/* Share Button */}
              <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{copied ? "Link Copied!" : "Share"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

