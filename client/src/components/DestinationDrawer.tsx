import { useState } from "react";
import { X, MapPin, Star, Calendar, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

  if (!destination) return null;

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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        {destination.mainImage && (
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
            <img 
              src={destination.mainImage} 
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="capitalize">{destination.city}</span>
              <span>•</span>
              <span className="capitalize">{destination.category}</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-3">{destination.name}</h1>
            
            {destination.michelinStars && destination.michelinStars > 0 && (
              <div className="flex items-center gap-1.5">
                {[...Array(destination.michelinStars)].map((_, i) => (
                  <img 
                    key={i} 
                    src="/michelin-star.png" 
                    alt="Michelin Star" 
                    className="h-5 w-5"
                  />
                ))}
                <span className="ml-1 text-sm font-medium text-gray-700">
                  {destination.michelinStars} Michelin Star{destination.michelinStars > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Subline */}
          {destination.subline && (
            <div className="mb-8">
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {destination.subline.replace(/<[^>]*>/g, '')}
              </p>
            </div>
          )}

          {/* Content */}
          {destination.content && (
            <div className="mb-8 prose prose-gray max-w-none">
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {destination.content.replace(/<[^>]*>/g, '')}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-6 border-t space-y-4">
            {!showVisitedForm ? (
              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  Save Place
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleQuickMarkAsVisited}
                  disabled={saving || isVisited}
                >
                  {isVisited ? "✓ Visited" : "Mark as Visited"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">
                  {isVisited ? "Update Visit Details (Optional)" : "Add Visit Details"}
                </h3>
                
                <div>
                  <Label htmlFor="visit-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Visit Date (optional)
                  </Label>
                  <Input
                    id="visit-date"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating (optional)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRating(r)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          r <= rating
                            ? "bg-yellow-400 border-yellow-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
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
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdateVisitDetails}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? "Saving..." : "Update Details"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowVisitedForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4">Details</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium capitalize">{destination.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-medium capitalize">{destination.city}</span>
              </div>
              {destination.crown && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Featured</span>
                  <span className="font-medium">👑 Crown Selection</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

