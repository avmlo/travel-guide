import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { 
  getAnalyticsSummary, 
  getPopularSearches, 
  getZeroResultSearches,
  getMostViewedDestinations 
} from "@/lib/analytics";
import { TrendingUp, Search, Eye, Activity, AlertCircle } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);
  const [summary, setSummary] = useState({ pageViews: 0, searches: 0, destinationViews: 0, actions: 0 });
  const [popularSearches, setPopularSearches] = useState<Array<{ query: string; count: number }>>([]);
  const [zeroResultSearches, setZeroResultSearches] = useState<Array<{ query: string; timestamp: string }>>([]);
  const [topDestinations, setTopDestinations] = useState<Array<{ slug: string; name: string; views: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryData, searches, zeroResults, destinations] = await Promise.all([
        getAnalyticsSummary(timeRange),
        getPopularSearches(10, timeRange),
        getZeroResultSearches(20, timeRange),
        getMostViewedDestinations(10, timeRange)
      ]);

      setSummary(summaryData);
      setPopularSearches(searches);
      setZeroResultSearches(zeroResults);
      setTopDestinations(destinations);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Understand your users and improve your content
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-8 flex gap-2">
            {([7, 30, 90] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  timeRange === days
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Last {days} days
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</span>
                  </div>
                  <div className="text-3xl font-bold text-black dark:text-white">{summary.pageViews.toLocaleString()}</div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Searches</span>
                  </div>
                  <div className="text-3xl font-bold text-black dark:text-white">{summary.searches.toLocaleString()}</div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Destination Views</span>
                  </div>
                  <div className="text-3xl font-bold text-black dark:text-white">{summary.destinationViews.toLocaleString()}</div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">User Actions</span>
                  </div>
                  <div className="text-3xl font-bold text-black dark:text-white">{summary.actions.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Searches */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-black dark:text-white">Popular Searches</h2>
                    <button
                      onClick={() => exportToCSV(popularSearches, 'popular-searches')}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Export CSV
                    </button>
                  </div>
                  {popularSearches.length > 0 ? (
                    <div className="space-y-3">
                      {popularSearches.map((search, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                            <span className="text-base text-black dark:text-white">{search.query}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{search.count} searches</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No search data yet</p>
                  )}
                </div>

                {/* Top Destinations */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-black dark:text-white">Most Viewed Destinations</h2>
                    <button
                      onClick={() => exportToCSV(topDestinations, 'top-destinations')}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Export CSV
                    </button>
                  </div>
                  {topDestinations.length > 0 ? (
                    <div className="space-y-3">
                      {topDestinations.map((dest, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                            <span className="text-base text-black dark:text-white truncate">{dest.name}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{dest.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No destination views yet</p>
                  )}
                </div>

                {/* Zero Result Searches */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h2 className="text-xl font-bold text-black dark:text-white">Zero Result Searches</h2>
                    </div>
                    <button
                      onClick={() => exportToCSV(zeroResultSearches, 'zero-result-searches')}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Export CSV
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    These searches returned no results. Consider adding content for these topics.
                  </p>
                  {zeroResultSearches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {zeroResultSearches.map((search, index) => (
                        <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-base text-black dark:text-white mb-1">{search.query}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(search.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">All searches returned results! 🎉</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}

