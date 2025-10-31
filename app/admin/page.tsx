'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [enrichLimit, setEnrichLimit] = useState(100);
  const [enrichOffset, setEnrichOffset] = useState(0);
  const [enrichSlug, setEnrichSlug] = useState('');
  const [enrichRunning, setEnrichRunning] = useState(false);
  const [enrichResult, setEnrichResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/account');
        return;
      }

      setUser(session.user);
      setAuthChecked(true);

      // Check admin status
      try {
        const res = await fetch('/api/is-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email })
        });
        const j = await res.json();
        setIsAdmin(!!j.isAdmin);
        if (!j.isAdmin) {
          router.push('/account');
        }
      } catch {}
    }

    checkAuth();
  }, [router]);

  const handleSearchDestinations = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('slug, name, city')
        .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
        .limit(10);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (e: any) {
      setSearchResults([]);
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Show loading state
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <main className="px-6 md:px-10 py-12">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">Admin</Badge>
              </div>
            </div>
            <Button onClick={() => router.push('/account')} variant="outline">
              Back to Account
            </Button>
          </div>

          {/* Google Enrichment Tools */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Google Enrichment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enrich destinations with Google Places API data. 
                <br />
                <strong>Tip:</strong> If batch returns 0 results, all destinations may already be enriched. Try a specific slug to test or re-enrich a destination.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={enrichSlug}
                  onChange={(e) => setEnrichSlug(e.target.value)}
                  placeholder="Destination slug (optional, recommended)"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 outline-none"
                />
                <input
                  type="number"
                  value={enrichLimit}
                  onChange={(e) => setEnrichLimit(Number(e.target.value))}
                  placeholder="Limit (default: 100)"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 outline-none"
                />
                <input
                  type="number"
                  value={enrichOffset}
                  onChange={(e) => setEnrichOffset(Number(e.target.value))}
                  placeholder="Offset (default: 0)"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 outline-none"
                />
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                <strong>Batch mode:</strong> Finds destinations missing any enrichment data (google_place_id, formatted_address, phone, or website). 
                If you get 0 results, try enriching a specific destination by slug.
              </div>

              {/* Search for slugs */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                <p className="text-sm font-medium mb-2">Find Destination Slug</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchDestinations();
                      }
                    }}
                    placeholder="Search by name or city (e.g., 'tokyo', 'central park')"
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 outline-none"
                  />
                  <Button
                    onClick={handleSearchDestinations}
                    disabled={isSearching || !searchQuery.trim()}
                    variant="outline"
                    size="sm"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map((d: any) => (
                      <button
                        key={d.slug}
                        onClick={() => {
                          setEnrichSlug(d.slug);
                          setSearchResults([]);
                          setSearchQuery('');
                        }}
                        className="block w-full text-left px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                      >
                        <div className="font-medium">{d.name}</div>
                        <div className="text-gray-500">Slug: <code className="text-xs">{d.slug}</code> | City: {d.city}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={async () => {
                  if (!user?.email) return;
                  setEnrichRunning(true);
                  setEnrichResult(null);
                  try {
                    const res = await fetch('/api/enrich-google', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email },
                      body: JSON.stringify({ slug: enrichSlug || undefined, limit: enrichLimit, offset: enrichOffset })
                    });
                    const j = await res.json();
                    setEnrichResult(j);
                  } catch (e: any) {
                    setEnrichResult({ error: e?.message || 'Failed to run enrichment' });
                  } finally {
                    setEnrichRunning(false);
                  }
                }}
                disabled={enrichRunning || !user?.email}
                className="w-full sm:w-auto"
              >
                {enrichRunning ? 'Running...' : 'Run Enrichment'}
              </Button>

              {enrichResult && (
                <div className="mt-4">
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[40vh] border border-gray-200 dark:border-gray-800">
                    {JSON.stringify(enrichResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

