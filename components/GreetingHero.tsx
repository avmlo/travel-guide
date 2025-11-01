import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface GreetingHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  userName?: string;
  isAIEnabled?: boolean;
}

export default function GreetingHero({
  searchQuery,
  onSearchChange,
  onOpenFilters,
  userName,
  isAIEnabled = false,
}: GreetingHeroProps) {
  // Get current time for greeting
  const now = new Date();
  const currentHour = now.getHours();
  let greeting = 'GOOD EVENING';
  if (currentHour < 12) {
    greeting = 'GOOD MORNING';
  } else if (currentHour < 18) {
    greeting = 'GOOD AFTERNOON';
  }

  // Format date and time
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const dateStr = now.toLocaleDateString('en-US', options);
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="w-full pt-10 pb-6 relative" data-name="Greeting and Filters">
      <div className="max-w-[680px] mx-auto px-[24px] relative">
        {/* Greeting */}
        <div className="text-center mb-3">
          <h1 className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] uppercase tracking-[2px] mb-1 font-medium">
            {greeting}{userName ? `, ${userName}` : ''}
          </h1>
          <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280]">
            Today is {dateStr}, {timeStr}
          </span>
        </div>

        {/* Search Bar */}
        <div className="mt-8 mb-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]">
                <Search className="w-full h-full" strokeWidth={1.5} />
              </div>
              {isAIEnabled && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2" title="AI Enhanced Search">
                  <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} aria-label="AI Enhanced Search" />
                </div>
              )}
              <input
                placeholder={isAIEnabled ? "Ask me anything: 'romantic restaurant in Tokyo' or 'cozy cafe Paris'..." : "Search places..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`h-12 w-full ${isAIEnabled ? 'pr-[44px]' : ''} pl-[44px] bg-gray-100 border border-transparent rounded-2xl font-['Inter:Regular',sans-serif] text-[15px] text-black placeholder:text-[#9ca3af] text-center outline-none focus:ring-2 focus:ring-black`}
              />
            </div>
            <button
              onClick={onOpenFilters}
              className="flex items-center justify-center w-12 h-12 bg-black text-white hover:opacity-90 rounded-2xl"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


