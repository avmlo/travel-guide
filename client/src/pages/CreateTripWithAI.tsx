import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, MapPin, Calendar } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function CreateTripWithAI() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [city, setCity] = useState("");
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const createTripMutation = trpc.trips.createFromAI.useMutation({
    onSuccess: (data) => {
      toast.success("Trip created successfully!");
      setLocation(`/trip/${data.tripId}`);
    },
    onError: (error) => {
      toast.error(`Failed to create trip: ${error.message}`);
    },
  });

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleGenerateItinerary = async () => {
    if (!city.trim()) {
      toast.error("Please enter a city");
      return;
    }

    setIsGenerating(true);
    try {
      // Fetch destinations from Supabase
      const { data: destinations } = await supabase
        .from('destinations')
        .select('*')
        .order('name');

      if (!destinations) {
        toast.error("Failed to load destinations");
        return;
      }

      // Call AI itinerary generation through tRPC
      const response = await fetch('/api/trpc/ai.generateItinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city.toLowerCase().replace(/\s+/g, '-'),
          days,
          interests: interests.length > 0 ? interests : ['sightseeing', 'dining'],
          destinations: destinations.map(d => ({
            name: d.name,
            slug: d.slug,
            category: d.category,
            city: d.city,
            description: d.description || d.content,
            michelinStars: d.michelin_stars,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const result = await response.json();
      setGeneratedItinerary(result.result.data);
      toast.success("Itinerary generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate itinerary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsTrip = () => {
    if (!generatedItinerary) return;

    createTripMutation.mutate({
      title: generatedItinerary.title,
      description: generatedItinerary.description,
      destination: city,
      days: generatedItinerary.days,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              Create Trip with AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let AI help you create the perfect itinerary based on your preferences
            </p>
          </div>

          {!generatedItinerary ? (
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>
                  Tell us about your trip and we'll generate a personalized itinerary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="city">Destination City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Paris, Tokyo, New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="days">Number of Days</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="interests">Interests (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="interests"
                      placeholder="e.g., food, art, history, shopping"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddInterest} variant="outline">
                      Add
                    </Button>
                  </div>
                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating || !city.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Your Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Itinerary with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Generated Itinerary */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{generatedItinerary.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {generatedItinerary.description}
                      </CardDescription>
                    </div>
                    <Button onClick={() => setGeneratedItinerary(null)} variant="outline">
                      Start Over
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedItinerary.days.map((day: any) => (
                    <div key={day.day} className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold -ml-10">
                          {day.day}
                        </div>
                        {day.title}
                      </h3>
                      <div className="space-y-3">
                        {day.activities.map((activity: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                          >
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              {activity.time}
                            </div>
                            <h4 className="font-semibold mb-1">{activity.destination}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {generatedItinerary.tips && generatedItinerary.tips.length > 0 && (
                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Travel Tips</h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {generatedItinerary.tips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <Button
                      onClick={handleSaveAsTrip}
                      disabled={createTripMutation.isPending}
                      className="flex-1"
                    >
                      {createTripMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Save as Trip
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
