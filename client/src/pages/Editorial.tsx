import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { Calendar, Clock } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Tokyo's Michelin-Starred Restaurants: A Complete Guide for 2025",
    excerpt: "Discover the best Michelin-starred dining experiences in Tokyo, from traditional kaiseki to innovative fusion cuisine. Our comprehensive guide covers everything you need to know.",
    author: "Sarah Chen",
    date: "2025-01-15",
    readTime: "12 min read",
    category: "Dining",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800&q=80",
    slug: "tokyo-michelin-restaurants-2025"
  },
  {
    id: "2",
    title: "Paris for First-Time Visitors: The Ultimate 2025 Travel Guide",
    excerpt: "Planning your first trip to Paris? This comprehensive guide covers the best neighborhoods, must-visit attractions, hidden gems, and insider tips for an unforgettable experience.",
    author: "Jean-Pierre Laurent",
    date: "2025-01-10",
    readTime: "15 min read",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    slug: "paris-first-time-visitors-guide-2025"
  },
  {
    id: "3",
    title: "Sustainable Travel: How to Explore the World Responsibly in 2025",
    excerpt: "Learn how to minimize your environmental impact while traveling. From eco-friendly accommodations to carbon-neutral transportation, discover practical tips for sustainable tourism.",
    author: "Emma Green",
    date: "2025-01-05",
    readTime: "10 min read",
    category: "Sustainability",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    slug: "sustainable-travel-guide-2025"
  },
  {
    id: "4",
    title: "Hidden Gems of Taipei: Beyond the Tourist Trail",
    excerpt: "Explore Taipei's best-kept secrets, from local night markets to artisan coffee shops. Discover the authentic side of Taiwan's vibrant capital city.",
    author: "David Wu",
    date: "2024-12-28",
    readTime: "8 min read",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80",
    slug: "taipei-hidden-gems"
  },
  {
    id: "5",
    title: "The Rise of Boutique Hotels: Design Meets Hospitality",
    excerpt: "How independent boutique hotels are redefining luxury travel with unique design, personalized service, and authentic local experiences.",
    author: "Isabella Martinez",
    date: "2024-12-20",
    readTime: "11 min read",
    category: "Hotels",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    slug: "boutique-hotels-design-hospitality"
  },
  {
    id: "6",
    title: "Coffee Culture Around the World: From Tokyo to Melbourne",
    excerpt: "A journey through the world's best coffee cities, exploring unique brewing methods, café culture, and the artisans behind your perfect cup.",
    author: "Marcus Thompson",
    date: "2024-12-15",
    readTime: "9 min read",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    slug: "coffee-culture-worldwide"
  }
];

export default function Editorial() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Travel", "Dining", "Hotels", "Culture", "Sustainability"];

  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12 dark:text-white">
        <div className="max-w-[1920px] mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-[clamp(24px,5vw,48px)] font-bold uppercase leading-none tracking-tight mb-2 text-black dark:text-white">Editorial</h1>
            <p className="text-xs font-bold uppercase text-black/60 dark:text-white/60">
              Stories, guides, and insights from around the world
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-opacity ${
                    selectedCategory === category
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:opacity-60"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                onClick={() => setLocation(`/editorial/${article.slug}`)}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Category Badge */}
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    {article.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 group-hover:opacity-60 transition-opacity text-black dark:text-white">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-medium">{article.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">
                No articles found in this category.
              </p>
            </div>
          )}
        </div>
      </main>

      <SimpleFooter />
    </div>
  );
}

