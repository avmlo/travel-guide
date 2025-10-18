import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Loader2, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Destination } from "@/types/destination";

interface ItineraryGeneratorProps {
  destinations: Destination[];
  cities: string[];
}

export function ItineraryGenerator({ destinations, cities }: ItineraryGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState("");
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState<any>(null);

  const generateMutation = trpc.ai.generateItinerary.useMutation();

  const handleGenerate = async () => {
    if (!city || !interests.trim()) return;

    try {
      const result = await generateMutation.mutateAsync({
        city,
        days,
        interests: interests.split(",").map((i) => i.trim()),
        destinations,
      });

      setItinerary(result);
    } catch (error) {
      console.error("Itinerary generation error:", error);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setCity("");
    setDays(3);
    setInterests("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-gray-300">
          <Calendar className="h-4 w-4" />
          Generate Itinerary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Itinerary Generator</DialogTitle>
        </DialogHeader>

        {!itinerary ? (
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select a city</option>
                {cities.slice(0, 50).map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Number of Days (1-14)
              </label>
              <Input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 3)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Interests (comma-separated)
              </label>
              <Input
                placeholder="e.g., food, culture, nightlife, shopping"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!city || !interests.trim() || generateMutation.isPending}
              className="w-full bg-black hover:bg-gray-800"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{itinerary.title}</h3>
              <p className="text-gray-600">{itinerary.description}</p>
            </div>

            <div className="space-y-6">
              {itinerary.days.map((day: any) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-3">
                    Day {day.day}: {day.title}
                  </h4>
                  <div className="space-y-3">
                    {day.activities.map((activity: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{activity.activity}</p>
                              <p className="text-sm text-gray-600">{activity.destination}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {activity.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Travel Tips</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {itinerary.tips.map((tip: string, idx: number) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Generate Another Itinerary
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

