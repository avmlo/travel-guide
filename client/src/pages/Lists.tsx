import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Plus, Lock, Globe, Heart, MapPin, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types/user";

interface List {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_collaborative: boolean;
  cover_image?: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
  like_count?: number;
}

export default function Lists() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation('/auth/login');
        return;
      }
      setUser(session.user);
      await fetchLists(session.user.id);
    }
    checkAuth();
  }, [setLocation]);

  async function fetchLists(userId: string) {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching lists:', error);
      toast.error('Failed to load lists');
    } else {
      // Fetch item counts for each list
      const listsWithCounts = await Promise.all(
        (data || []).map(async (list) => {
          const { count } = await supabase
            .from('list_items')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id);

          const { count: likeCount } = await supabase
            .from('list_likes')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id);

          return {
            ...list,
            item_count: count || 0,
            like_count: likeCount || 0
          };
        })
      );

      setLists(listsWithCounts);
    }
    
    setLoading(false);
  }

  async function handleDeleteList(listId: string) {
    if (!confirm('Are you sure you want to delete this list?')) return;

    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (error) {
      toast.error('Failed to delete list');
    } else {
      toast.success('List deleted');
      setLists(lists.filter(l => l.id !== listId));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading lists...</div>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-normal mb-2">My Lists</h1>
            <p className="text-gray-600">Organize your favorite destinations into collections</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New List</span>
          </button>
        </div>

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <div className="text-center py-24">
            <div className="mb-6">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-normal mb-2">No lists yet</h3>
            <p className="text-gray-600 mb-6">Create your first list to start organizing destinations</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Create List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="border border-gray-200 hover:border-black transition-colors cursor-pointer group"
                onClick={() => setLocation(`/list/${list.id}`)}
              >
                {/* Cover Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {list.cover_image ? (
                    <img
                      src={list.cover_image}
                      alt={list.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MapPin className="h-12 w-12" />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingList(list);
                        setShowCreateModal(true);
                      }}
                      className="p-2 bg-white hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id);
                      }}
                      className="p-2 bg-white hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* List Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-normal text-lg">{list.name}</h3>
                    {list.is_public ? (
                      <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  {list.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{list.item_count} {list.item_count === 1 ? 'place' : 'places'}</span>
                    {list.is_public && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {list.like_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SimpleFooter />

      {/* Create/Edit List Modal */}
      {showCreateModal && (
        <CreateListModal
          list={editingList}
          onClose={() => {
            setShowCreateModal(false);
            setEditingList(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingList(null);
            if (user) fetchLists(user.id);
          }}
        />
      )}
    </div>
  );
}

// Create/Edit List Modal Component
function CreateListModal({ 
  list, 
  onClose, 
  onSave 
}: { 
  list: List | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [isPublic, setIsPublic] = useState(list?.is_public ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in');
      return;
    }

    if (list) {
      // Update existing list
      const { error } = await supabase
        .from('lists')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', list.id);

      if (error) {
        toast.error('Failed to update list');
        console.error(error);
      } else {
        toast.success('List updated');
        onSave();
      }
    } else {
      // Create new list
      const { error } = await supabase
        .from('lists')
        .insert({
          user_id: session.user.id,
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic
        });

      if (error) {
        toast.error('Failed to create list');
        console.error(error);
      } else {
        toast.success('List created');
        onSave();
      }
    }

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full p-8">
        <h2 className="text-2xl font-normal mb-6">
          {list ? 'Edit List' : 'Create New List'}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
              List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tokyo Favorites"
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your list..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5"
              />
              <div>
                <div className="font-normal">Make this list public</div>
                <div className="text-xs text-gray-600">Anyone can view this list</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 hover:border-black transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : (list ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

