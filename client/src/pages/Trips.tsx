import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Trash2, Edit, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { SkeletonGrid } from "@/components/SkeletonCard";

export default function Trips() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
  });

  const { data: trips, isLoading, refetch } = trpc.trips.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.trips.create.useMutation({
    onSuccess: (data) => {
      toast.success("Trip created successfully!");
      setIsCreateDialogOpen(false);
      setNewTrip({ title: "", description: "", destination: "", startDate: "", endDate: "" });
      refetch();
      if (data.insertId) {
        setLocation(`/trip/${data.insertId}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create trip: ${error.message}`);
    },
  });

  const deleteMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      toast.success("Trip deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete trip: ${error.message}`);
    },
  });

  const handleCreateTrip = () => {
    if (!newTrip.title.trim()) {
      toast.error("Please enter a trip title");
      return;
    }
    createMutation.mutate(newTrip);
  };

  const handleDeleteTrip = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-500";
      case "upcoming": return "bg-green-500";
      case "ongoing": return "bg-purple-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Header />
        <main className="px-6 md:px-10 py-12 dark:text-white">
          <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer mb-2" />
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
              </div>
              <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-shimmer" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-shimmer" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">My Trips</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Plan and organize your travel itineraries
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Trip</DialogTitle>
                  <DialogDescription>
                    Plan a new adventure. You can add details and itinerary items later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Trip Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Summer in Paris"
                      value={newTrip.title}
                      onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="e.g., Paris, France"
                      value={newTrip.destination}
                      onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newTrip.startDate}
                        onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newTrip.endDate}
                        onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What's this trip about?"
                      value={newTrip.description}
                      onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTrip} disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Trip"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Trips Grid */}
          {trips && trips.length === 0 ? (
            <div className="text-center py-20 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="mb-6">
                <MapPin className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-black dark:text-white">No trips yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start planning your next adventure
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips?.map((trip, index) => (
                <Card
                  key={trip.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group animate-scale-in dark:bg-gray-900 dark:border-gray-800"
                  style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                >
                  <CardHeader className="pb-3" onClick={() => setLocation(`/trip/${trip.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(trip.status || "planning")}>
                        {trip.status || "planning"}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/trip/${trip.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrip(trip.id, trip.title);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
                    {trip.destination && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {trip.destination}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent onClick={() => setLocation(`/trip/${trip.id}`)}>
                    {trip.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {trip.description}
                      </p>
                    )}
                    {(trip.startDate || trip.endDate) && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(trip.startDate)}
                          {trip.endDate && ` - ${formatDate(trip.endDate)}`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-gray-400 dark:text-gray-600" onClick={() => setLocation(`/trip/${trip.id}`)}>
                    Created {formatDate(trip.createdAt)}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}
