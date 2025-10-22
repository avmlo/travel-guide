import { useState } from "react";
import { X, Calendar, Star, StickyNote, Share2, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AISuggestions } from "@/components/AISuggestions";
import { GoogleMap } from "@/components/GoogleMap";

interface DestinationDrawerProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DestinationDrawer({ destination, isOpen, onClose }: DestinationDrawerProps) {
  const [showVisitedForm, setShowVisitedForm] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
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

  const handleQuickMarkAsVisited = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to mark places as visited");
        return;
      }

      const { data: destData } = await supabase
        .from('destinations')
        .select('id')
        .eq('slug', destination.slug)
        .single();

      if (!destData) {
        toast.error("Destination not found");
        return;
      }

      const { error } = await supabase
        .from('visited_places')
        .upsert({
          user_id: session.user.id,
          destination_id: destData.id,
          visited_date: null,
          rating: null,
          notes: null
        }, {
          onConflict: 'user_id,destination_id'
        });

      if (error) throw error;

      setIsVisited(true);
      toast.success("Marked as visited! Add details below if you'd like.");
      setShowVisitedForm(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as visited");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVisitDetails = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to mark places as visited");
        return;
      }

      // Get destination ID from Supabase
      const { data: destData } = await supabase
        .from('destinations')
        .select('id')
        .eq('slug', destination.slug)
        .single();

      if (!destData) {
        toast.error("Destination not found");
        return;
      }

      const { error } = await supabase
        .from('visited_places')
        .upsert({
          user_id: session.user.id,
          destination_id: destData.id,
          visited_date: visitDate || null,
          rating: rating || null,
          notes
        }, {
          onConflict: 'user_id,destination_id'
        });

      if (error) throw error;

      toast.success("Place marked as visited!");
      setShowVisitedForm(false);
      setVisitDate("");
      setRating(0);
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as visited");
    } finally {
      setSaving(false);
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
        {/* Header Buttons */}
        <div className="absolute top-6 right-6 z-10 flex gap-3">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
            title="Share destination"
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Share2 className="h-5 w-5" />
            )}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image */}
        {destination.mainImage && (
          <div className="relative h-80 sm:h-96 md:h-[28rem] w-full overflow-hidden">
            <img 
              src={destination.mainImage} 
              alt={`${destination.name} in ${destination.city} - ${destination.category}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8 sm:p-12 md:p-16">
          {/* Header with new design */}
          <div className="mb-12">
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl mb-8 leading-tight font-black">
              {destination.name}
            </h1>
            
            {/* Pills and Michelin Stars */}
            <div className="flex flex-wrap items-center gap-4">
              {/* City Pill - Black Border */}
              <span className="inline-flex items-center px-6 py-3 border-2 border-black bg-white text-black text-sm font-bold uppercase tracking-wide">
                {destination.city}
              </span>
              
              {/* Category Pill - Black Border */}
              <span className="inline-flex items-center px-6 py-3 border-2 border-black bg-white text-black text-sm font-bold uppercase tracking-wide">
                {destination.category}
              </span>
              
              {/* Michelin Stars - Black Border */}
              {destination.michelinStars && destination.michelinStars > 0 && (
                <div className="flex items-center gap-2 border-2 border-black bg-white px-4 py-3">
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
              )}
            </div>
          </div>

          {/* Subline */}
          {destination.subline && (
            <div className="mb-12">
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                {destination.subline.replace(/<[^>]*>/g, '')}
              </p>
            </div>
          )}

          {/* Content */}
          {destination.content && (
            <div className="mb-12 prose prose-gray max-w-none">
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {destination.content.replace(/<[^>]*>/g, '')}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-8 border-t-2 border-black space-y-6">
            {!showVisitedForm ? (
              <div className="flex gap-4">
                <Button className="flex-1 bg-black hover:bg-gray-800 text-white h-14 text-base font-bold uppercase tracking-wide rounded-none" size="lg">
                  Save Place
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-2 border-black hover:bg-black hover:text-white h-14 text-base font-bold uppercase tracking-wide rounded-none"
                  onClick={handleQuickMarkAsVisited}
                  disabled={saving || isVisited}
                >
                  {isVisited ? "✓ Visited" : "Mark as Visited"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 p-8 bg-gray-50 border-2 border-black">
                <h3 className="font-bold text-xl uppercase tracking-wide">
                  {isVisited ? "Update Visit Details (Optional)" : "Add Visit Details"}
                </h3>
                
                <div>
                  <Label htmlFor="visit-date" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                    <Calendar className="h-4 w-4" />
                    Visit Date (optional)
                  </Label>
                  <Input
                    id="visit-date"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-2 bg-white border-2 border-black rounded-none h-12"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                    <Star className="h-4 w-4" />
                    Rating (optional)
                  </Label>
                  <div className="flex gap-3 mt-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRating(r)}
                        className={`w-12 h-12 border-2 transition-all ${
                          r <= rating
                            ? "bg-black border-black text-white"
                            : "bg-white border-black text-gray-400 hover:bg-black hover:text-white"
                        }`}
                      >
                        <Star className={`h-5 w-5 mx-auto ${
                          r <= rating ? "fill-current" : ""
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                    <StickyNote className="h-4 w-4" />
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="mt-2 bg-white border-2 border-black rounded-none"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleUpdateVisitDetails}
                    disabled={saving}
                    className="flex-1 bg-black hover:bg-gray-800 text-white h-12 font-bold uppercase tracking-wide rounded-none"
                  >
                    {saving ? "Saving..." : "Update Details"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowVisitedForm(false)}
                    disabled={saving}
                    className="border-2 border-black hover:bg-black hover:text-white h-12 font-bold uppercase tracking-wide rounded-none"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          <AISuggestions 
            destination={destination}
            onSelectDestination={(slug: string) => {
              // This will be handled by parent component
              console.log('Selected suggestion:', slug);
            }}
          />

          {/* Google Map & Location */}
          <div className="mt-12 pt-8 border-t-2 border-black">
            <h3 className="text-xl font-bold mb-6 uppercase tracking-wide">Location & Map</h3>
            <GoogleMap destination={destination} />
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t-2 border-black">
            <h3 className="font-bold text-xl mb-6 uppercase tracking-wide">Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium uppercase tracking-wide">Category</span>
                <span className="font-bold uppercase tracking-wide">{destination.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium uppercase tracking-wide">Location</span>
                <span className="font-bold uppercase tracking-wide">{destination.city}</span>
              </div>
              {destination.crown && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium uppercase tracking-wide">Featured</span>
                  <span className="font-bold">👑 Crown Selection</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

