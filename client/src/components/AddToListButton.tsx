import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Check, List } from "lucide-react";
import { toast } from "sonner";

interface List {
  id: string;
  name: string;
  is_public: boolean;
  item_count?: number;
}

interface AddToListButtonProps {
  destinationSlug: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function AddToListButton({ 
  destinationSlug, 
  variant = 'button',
  className = '' 
}: AddToListButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (showModal && user) {
      fetchLists();
    }
  }, [showModal, user]);

  async function fetchLists() {
    if (!user) return;

    setLoading(true);

    // Fetch user's lists
    const { data: listsData, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (listsError) {
      console.error('Error fetching lists:', listsError);
      setLoading(false);
      return;
    }

    // Check which lists already contain this destination
    const { data: itemsData } = await supabase
      .from('list_items')
      .select('list_id')
      .eq('destination_slug', destinationSlug);

    const existingListIds = new Set(itemsData?.map(item => item.list_id) || []);
    setAddedToLists(existingListIds);

    // Get item counts for each list
    const listsWithCounts = await Promise.all(
      (listsData || []).map(async (list) => {
        const { count } = await supabase
          .from('list_items')
          .select('*', { count: 'exact', head: true })
          .eq('list_id', list.id);

        return {
          ...list,
          item_count: count || 0
        };
      })
    );

    setLists(listsWithCounts);
    setLoading(false);
  }

  async function handleToggleList(listId: string) {
    if (!user) return;

    const isAdded = addedToLists.has(listId);

    if (isAdded) {
      // Remove from list
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('list_id', listId)
        .eq('destination_slug', destinationSlug);

      if (error) {
        toast.error('Failed to remove from list');
      } else {
        setAddedToLists(prev => {
          const next = new Set(prev);
          next.delete(listId);
          return next;
        });
        toast.success('Removed from list');
      }
    } else {
      // Add to list
      const { error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          destination_slug: destinationSlug,
          added_by: user.id
        });

      if (error) {
        toast.error('Failed to add to list');
      } else {
        setAddedToLists(prev => new Set(Array.from(prev).concat(listId)));
        toast.success('Added to list');
      }
    }
  }

  function handleClick() {
    if (!user) {
      toast.error('Please sign in to save to lists');
      return;
    }
    setShowModal(true);
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`p-2 hover:bg-gray-100 transition-colors ${className}`}
          title="Add to list"
        >
          <List className="h-5 w-5" />
        </button>

        {showModal && (
          <AddToListModal
            lists={lists}
            addedToLists={addedToLists}
            loading={loading}
            onToggle={handleToggleList}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors ${className}`}
      >
        <Plus className="h-4 w-4" />
        <span>Add to List</span>
      </button>

      {showModal && (
        <AddToListModal
          lists={lists}
          addedToLists={addedToLists}
          loading={loading}
          onToggle={handleToggleList}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// Modal Component
function AddToListModal({
  lists,
  addedToLists,
  loading,
  onToggle,
  onClose
}: {
  lists: List[];
  addedToLists: Set<string>;
  loading: boolean;
  onToggle: (listId: string) => void;
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-normal">Add to List</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading lists...</div>
          ) : lists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have any lists yet</p>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/lists';
                }}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Create Your First List
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => {
                const isAdded = addedToLists.has(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => onToggle(list.id)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 hover:border-black transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="font-normal mb-1">{list.name}</div>
                      <div className="text-xs text-gray-500">
                        {list.item_count} {list.item_count === 1 ? 'place' : 'places'}
                      </div>
                    </div>
                    <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                      isAdded ? 'bg-black border-black' : 'border-gray-300'
                    }`}>
                      {isAdded && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 hover:border-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

