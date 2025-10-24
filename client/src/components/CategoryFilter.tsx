interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { key: "", label: "All", icon: "🌍" },
  { key: "restaurant", label: "Restaurant", icon: "🍽️" },
  { key: "cafe", label: "Cafe", icon: "☕" },
  { key: "hotel", label: "Hotel", icon: "🏨" },
  { key: "bar", label: "Bar", icon: "🍸" },
  { key: "shop", label: "Shop", icon: "🛍️" },
  { key: "bakery", label: "Bakery", icon: "🥐" },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => onCategoryChange(category.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.key
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}