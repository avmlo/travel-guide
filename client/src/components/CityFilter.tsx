import { capitalizeCity } from "@/lib/stringUtils";

interface CityFilterProps {
  cities: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  showAllCities: boolean;
  onToggleShowAll: () => void;
}

export function CityFilter({
  cities,
  selectedCity,
  onCityChange,
  showAllCities,
  onToggleShowAll,
}: CityFilterProps) {
  const displayedCities = showAllCities ? cities : cities.slice(0, 20);

  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-xs font-bold uppercase">Places</h2>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <button
          onClick={() => onCityChange("")}
          className={`transition-colors ${
            !selectedCity
              ? "font-medium text-black dark:text-white"
              : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
          }`}
        >
          All
        </button>
        {displayedCities.map((city) => (
          <button
            key={city}
            onClick={() => onCityChange(city === selectedCity ? "" : city)}
            className={`transition-colors ${
              selectedCity === city
                ? "font-medium text-black dark:text-white"
                : "font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300"
            }`}
          >
            {capitalizeCity(city)}
          </button>
        ))}
        {cities.length > 20 && (
          <button
            onClick={onToggleShowAll}
            className="font-medium text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300 transition-colors"
          >
            {showAllCities ? "- Show Less" : "+ Show More"}
          </button>
        )}
      </div>
    </div>
  );
}