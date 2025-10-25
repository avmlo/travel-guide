import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, MapPin, Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TripDetail() {
  const [, params] = useRoute("/trip/:id");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const tripId = params?.id ? parseInt(params.id) : 0;

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    day: 1,
    time: "",
    title: "",
    description: "",
    destinationSlug: "",
  });
  const [editingTrip, setEditingTrip] = useState(false);
  const [tripData, setTripData] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
  });

  const { data, isLoading, refetch } = trpc.trips.get.useQuery(
    { id: tripId },
    { enabled: !!user && tripId > 0 }
  );

  const updateTripMutation = trpc.trips.update.useMutation({
    onSuccess: () => {
      toast.success("Trip updated successfully!");
      setEditingTrip(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update trip: ${error.message}`);
    },
  });

  const addItemMutation = trpc.trips.addItem.useMutation({
    onSuccess: () => {
      toast.success("Item added successfully!");
      setIsAddingItem(false);
      setNewItem({ day: 1, time: "", title: "", description: "", destinationSlug: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });

  const updateItemMutation = trpc.trips.updateItem.useMutation({
    onSuccess: () => {
      toast.success("Item updated successfully!");
      setEditingItemId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  const deleteItemMutation = trpc.trips.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Item deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  const handleSaveTrip = () => {
    if (!tripData.title.trim()) {
      toast.error("Please enter a trip title");
      return;
    }
    updateTripMutation.mutate({
      id: tripId,
      ...tripData,
    });
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) {
      toast.error("Please enter an activity title");
      return;
    }
    addItemMutation.mutate({
      tripId,
      ...newItem,
      orderIndex: (data?.items.filter(i => i.day === newItem.day).length || 0),
    });
  };

  const handleDeleteItem = (id: number, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      deleteItemMutation.mutate({ id });
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  const groupedItems = data?.items.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = [];
    }
    acc[item.day].push(item);
    return acc;
  }, {} as Record<number, typeof data.items>);

  const maxDay = Math.max(...(data?.items.map(i => i.day) || [0]), 1);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Trip not found</h2>
          <Button onClick={() => setLocation("/trips")}>Back to Trips</Button>
        </div>
      </div>
    );
  }

  const { trip, items } = data;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation("/trips")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Button>

          {/* Trip Header */}
          <Card className="mb-8">
            <CardHeader>
              {editingTrip ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Edit Trip Details</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTrip(false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveTrip}
                        disabled={updateTripMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="edit-title">Trip Title</Label>
                      <Input
                        id="edit-title"
                        value={tripData.title}
                        onChange={(e) => setTripData({ ...tripData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-destination">Destination</Label>
                      <Input
                        id="edit-destination"
                        value={tripData.destination || ""}
                        onChange={(e) => setTripData({ ...tripData, destination: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-start">Start Date</Label>
                        <Input
                          id="edit-start"
                          type="date"
                          value={tripData.startDate}
                          onChange={(e) => setTripData({ ...tripData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-end">End Date</Label>
                        <Input
                          id="edit-end"
                          type="date"
                          value={tripData.endDate}
                          onChange={(e) => setTripData({ ...tripData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={tripData.description || ""}
                        onChange={(e) => setTripData({ ...tripData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-3xl">{trip.title}</CardTitle>
                        <Badge>{trip.status || "planning"}</Badge>
                      </div>
                      {trip.destination && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{trip.destination}</span>
                        </div>
                      )}
                      {(trip.startDate || trip.endDate) && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(trip.startDate)}
                            {trip.endDate && ` - ${formatDate(trip.endDate)}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTripData({
                          title: trip.title,
                          description: trip.description || "",
                          destination: trip.destination || "",
                          startDate: formatDateForInput(trip.startDate),
                          endDate: formatDateForInput(trip.endDate),
                        });
                        setEditingTrip(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  {trip.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                      {trip.description}
                    </p>
                  )}
                </>
              )}
            </CardHeader>
          </Card>

          {/* Itinerary */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Itinerary</h2>
              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <Button onClick={() => setIsAddingItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Activity</DialogTitle>
                    <DialogDescription>
                      Add a new activity to your trip itinerary
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="day">Day</Label>
                        <Input
                          id="day"
                          type="number"
                          min="1"
                          value={newItem.day}
                          onChange={(e) => setNewItem({ ...newItem, day: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          placeholder="e.g., 9:00 AM"
                          value={newItem.time}
                          onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="activity-title">Activity Title *</Label>
                      <Input
                        id="activity-title"
                        placeholder="e.g., Visit Eiffel Tower"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-description">Description</Label>
                      <Textarea
                        id="activity-description"
                        placeholder="Add details about this activity..."
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem} disabled={addItemMutation.isPending}>
                      {addItemMutation.isPending ? "Adding..." : "Add Activity"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start building your itinerary by adding activities
                  </p>
                  <Button onClick={() => setIsAddingItem(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Activity
                  </Button>
                </CardContent>
              </Card>
            ) : (
              Array.from({ length: maxDay }).map((_, dayIndex) => {
                const dayNumber = dayIndex + 1;
                const dayItems = groupedItems?.[dayNumber] || [];

                return (
                  <div key={dayNumber}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold">
                        {dayNumber}
                      </div>
                      Day {dayNumber}
                    </h3>
                    <div className="space-y-3 ml-12">
                      {dayItems.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="py-6 text-center text-sm text-gray-500">
                            No activities for this day
                          </CardContent>
                        </Card>
                      ) : (
                        dayItems.map((item) => (
                          <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {item.time && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                      {item.time}
                                    </div>
                                  )}
                                  <h4 className="font-semibold mb-1">{item.title}</h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.notes && (
                                    <p className="text-sm text-gray-500 dark:text-gray-500 italic mt-2">
                                      Note: {item.notes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                    onClick={() => handleDeleteItem(item.id, item.title)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
