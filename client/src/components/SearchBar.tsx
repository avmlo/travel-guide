import { Search } from "lucide-react";

interface SearchBarProps {
  onSearchClick: () => void;
  destinationCount: number;
}

export function SearchBar({ onSearchClick, destinationCount }: SearchBarProps) {
  return (
    <div className="mb-8">
      <button
        onClick={onSearchClick}
        className="relative max-w-[500px] w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-[#efefef] dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Search className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">
            Search {destinationCount} items...
          </span>
        </div>
      </button>
    </div>
  );
}