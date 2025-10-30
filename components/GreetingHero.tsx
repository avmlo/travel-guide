import { Search } from 'lucide-react';

interface GreetingHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export default function GreetingHero({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
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
    <div className="w-full bg-[#f5f5f5] pt-12 pb-8" data-name="Greeting and Filters">
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
        <div className="mt-8 mb-4">
          <div className="relative">
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
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-[44px] w-full bg-white border border-[#e0e0e0] rounded-[4px] font-['Inter:Regular',sans-serif] text-[14px] text-[#333333] px-3"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


