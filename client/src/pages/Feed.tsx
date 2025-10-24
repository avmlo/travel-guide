import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { ActivityFeed } from "@/components/ActivityFeed";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { User } from "@/types/user";

export default function Feed() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLocation('/account');
        return;
      }
      setUser(session.user);
    }
    checkAuth();
  }, [setLocation]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Activity Feed</h1>
          <p className="text-gray-600">
            See what's happening in the travel community
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'all'
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Activity
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'following'
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>

        {/* Activity Feed */}
        <ActivityFeed
          followingOnly={activeTab === 'following'}
          limit={50}
        />
      </div>

      <SimpleFooter />
    </div>
  );
}

