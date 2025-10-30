import { Search, SlidersHorizontal } from 'lucide-react';

interface GreetingHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
}

export default function GreetingHero({
  searchQuery,
  onSearchChange,
  onOpenFilters,
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
    <div className="w-full pt-8 pb-4" data-name="Greeting and Filters">
      <div className="max-w-[680px] mx-auto px-[24px]">
        {/* Greeting */}
        <div className="text-center mb-2">
          <h1 className="font-['Inter:Regular',sans-serif] text-[11px] text-[#999999] uppercase tracking-[2px] mb-1">
            {greeting}
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[11px] text-[#999999]">
            Today is {dateStr}, {timeStr}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 mb-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]">
                <Search className="w-full h-full" strokeWidth={1.5} />
              </div>
              <input
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-[44px] w-full pl-[44px] bg-white border border-[#e0e0e0] rounded-[4px] font-['Inter:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] text-center outline-none"
              />
            </div>
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-2 px-4 h-[44px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[8px] text-sm font-medium"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


