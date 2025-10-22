import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Heart, Lock, Globe, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";

interface List {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
  created_at: string;
  owner_username?: string;
  owner_display_name?: string;
}

interface ListItem {
  id: string;
  destination_slug: string;
  note?: string;
  added_by: string;
  created_at: string;
}

export default function ListDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [list, setList] = useState<List | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isOwner = user && list && user.id === list.user_id;

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchList() {
      if (!params.id) return;

      // Fetch list details
      const { data: listData, error: listError } = await supabase
        .from('lists')
        .select(`
          *,
          user_profiles!lists_user_id_fkey (
            username,
            display_name
          )
        `)
        .eq('id', params.id)
        .single();

      if (listError || !listData) {
        console.error('Error fetching list:', listError);
        toast.error('List not found');
        setLocation('/lists');
        return;
      }

      // Check if list is accessible
      if (!listData.is_public && (!user || user.id !== listData.user_id)) {
        toast.error('This list is private');
        setLocation('/lists');
        return;
      }

      const listWithOwner = {
        ...listData,
        owner_username: listData.user_profiles?.username,
        owner_display_name: listData.user_profiles?.display_name
      };

      setList(listWithOwner);

      // Fetch list items
      const { data: itemsData, error: itemsError } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', params.id)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Error fetching list items:', itemsError);
      } else if (itemsData && itemsData.length > 0) {
        // Fetch destination details
        const slugs = itemsData.map(item => item.destination_slug);
        const { data: destinationsData, error: destError } = await supabase
          .from('destinations')
          .select('*')
          .in('slug', slugs);

        if (!destError && destinationsData) {
          setDestinations(destinationsData);
        }
      }

      // Check if user liked this list
      if (user) {
        const { data: likeData } = await supabase
          .from('list_likes')
          .select('*')
          .eq('list_id', params.id)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!likeData);
      }

      // Get like count
      const { count } = await supabase
        .from('list_likes')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', params.id);

      setLikeCount(count || 0);
      setLoading(false);
    }

    fetchList();
  }, [params.id, user, setLocation]);

  async function handleLike() {
    if (!user) {
      toast.error('Please sign in to like lists');
      return;
    }

    if (!list) return;

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('list_likes')
        .delete()
        .eq('list_id', list.id)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to unlike');
      } else {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    } else {
      // Like
      const { error } = await supabase
        .from('list_likes')
        .insert({
          list_id: list.id,
          user_id: user.id
        });

      if (error) {
        toast.error('Failed to like');
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success('Added to liked lists');
      }
    }
  }

  async function handleRemoveFromList(destinationSlug: string) {
    if (!list) return;

    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', list.id)
      .eq('destination_slug', destinationSlug);

    if (error) {
      toast.error('Failed to remove from list');
    } else {
      setDestinations(destinations.filter(d => d.slug !== destinationSlug));
      toast.success('Removed from list');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading list...</div>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        {/* List Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-normal">{list.name}</h1>
                {list.is_public ? (
                  <Globe className="h-5 w-5 text-gray-400" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              {list.description && (
                <p className="text-gray-600 mb-4 max-w-2xl">{list.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  By{' '}
                  <button
                    onClick={() => list.owner_username && setLocation(`/user/${list.owner_username}`)}
                    className="hover:underline font-medium"
                  >
                    {list.owner_display_name || list.owner_username || 'Unknown'}
                  </button>
                </span>
                <span>•</span>
                <span>{destinations.length} {destinations.length === 1 ? 'place' : 'places'}</span>
                {list.is_public && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {likeCount}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {list.is_public && (
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 border transition-colors ${
                    isLiked
                      ? 'border-red-500 text-red-500 hover:bg-red-50'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setLocation('/lists')}
                  className="px-4 py-2 border border-gray-300 hover:border-black transition-colors"
                >
                  Manage Lists
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        {destinations.length === 0 ? (
          <div className="text-center py-24">
            <div className="mb-6">
              <Plus className="h-16 w-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-normal mb-2">No destinations yet</h3>
            <p className="text-gray-600">
              {isOwner ? 'Start adding destinations to this list' : 'This list is empty'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {destinations.map((destination) => (
              <div key={destination.slug} className="relative group">
                <DestinationCard
                  destination={destination}
                  onClick={() => {
                    setSelectedDestination(destination);
                    setDrawerOpen(true);
                  }}
                />
                
                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromList(destination.slug);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white hover:bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SimpleFooter />

      {/* Destination Drawer */}
      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedDestination(null);
          }}
        />
      )}
    </div>
  );
}

