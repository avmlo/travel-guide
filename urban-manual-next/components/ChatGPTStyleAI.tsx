'use client';

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Minimize2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatGPTStyleAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getAIResponse(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("AI error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();

    // 🎯 PROACTIVE: Check for upcoming trips
    if (user && (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('help'))) {
      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(1);

      if (trips && trips.length > 0) {
        const trip = trips[0];
        const city = trip.destination || '';
        if (city) {
          const { data } = await supabase
            .from('destinations')
            .select('*')
            .ilike('city', `%${city}%`)
            .order('michelin_stars', { ascending: false })
            .limit(5);

          if (data && data.length > 0) {
            const list = data.map(d => {
              const stars = d.michelin_stars ? ' ' + '⭐'.repeat(d.michelin_stars) : '';
              return `• **${d.name}**${stars} - ${d.category}`;
            }).join('\n');
            return `I see you're visiting **${city}** soon! 🎉 Here are 5 must-visit places:\n\n${list}\n\nWould you like me to create an itinerary?`;
          }
        }
      }
    }

    // 🎯 TIME-BASED MICRO ITINERARIES (like "I'm in Shibuya for 3 hours")
    const timeMatch = lowerQuery.match(/(\d+)\s*(hour|hr|hours|hrs|h)/i);
    const areaMatch = lowerQuery.match(/(?:in|at)\s+([a-z\s-]+?)(?:\s+for|\s*$)/i);

    if (timeMatch && areaMatch) {
      const hours = parseInt(timeMatch[1]);
      const area = areaMatch[1].trim().replace(/\s+/g, '-');

      const { data } = await supabase
        .from('destinations')
        .select('*')
        .or(`city.ilike.%${area}%,name.ilike.%${area}%`)
        .limit(15);

      if (data && data.length > 0) {
        const cafes = data.filter(d => d.category?.toLowerCase().includes('cafe'));
        const restaurants = data.filter(d => d.category?.toLowerCase().includes('restaurant') || d.category?.toLowerCase().includes('dining'));
        const culture = data.filter(d => d.category?.toLowerCase().includes('culture'));
        const bars = data.filter(d => d.category?.toLowerCase().includes('bar'));

        let route = `Perfect! Here's a ${hours}-hour route for **${area}**:\n\n`;
        let timeUsed = 0;
        let step = 1;

        if (hours >= 1 && cafes.length > 0) {
          route += `${step}. **${cafes[0].name}** (15 min) ☕\n`;
          timeUsed += 0.25;
          step++;
        }

        if (hours >= 1.5 && culture.length > 0) {
          route += `${step}. Walk to **${culture[0].name}** (10 min)\n`;
          timeUsed += 0.17;
          step++;
        }

        if (hours >= 2 && restaurants.length > 0) {
          route += `${step}. Lunch at **${restaurants[0].name}** (45 min) 🍜\n`;
          timeUsed += 0.75;
          step++;
        }

        if (hours >= 2.5 && data.length > 3) {
          route += `${step}. Browse at **${data[3].name}** (30 min) 📚\n`;
          timeUsed += 0.5;
          step++;
        }

        if (hours >= 3 && restaurants.length > 1) {
          route += `${step}. Dessert or drink at **${restaurants[1].name || bars[0]?.name}** (20 min) 🍰\n`;
          timeUsed += 0.33;
          step++;
        }

        const timeLeft = hours - timeUsed;
        if (timeLeft > 0.5) {
          route += `\n💡 You'll have about ${Math.round(timeLeft * 60)} minutes of buffer time for photos and exploring!`;
        }

        return route;
      }
    }

    // 🎯 ITINERARY GENERATION (full day/multi-day)
    if (lowerQuery.includes('itinerary') || lowerQuery.includes('plan') || lowerQuery.includes('schedule')) {
      const cityMatch = lowerQuery.match(/(?:for|in|to)\s+([a-z\s-]+)/i);
      const city = cityMatch ? cityMatch[1].trim().replace(/\s+/g, '-') : null;

      if (city) {
        const { data } = await supabase
          .from('destinations')
          .select('*')
          .ilike('city', `%${city}%`)
          .limit(10);

        if (data && data.length > 0) {
          // Group by category for balanced itinerary
          const restaurants = data.filter(d => d.category?.toLowerCase().includes('restaurant') || d.category?.toLowerCase().includes('dining'));
          const cafes = data.filter(d => d.category?.toLowerCase().includes('cafe'));
          const culture = data.filter(d => d.category?.toLowerCase().includes('culture'));

          let itinerary = `Here's a suggested itinerary for **${city}**:\n\n`;
          itinerary += `**Morning:**\n• Start with breakfast at **${cafes[0]?.name || restaurants[0]?.name}**\n\n`;
          itinerary += `**Afternoon:**\n• Explore **${culture[0]?.name || data[0]?.name}**\n• Lunch at **${restaurants[0]?.name}**\n\n`;
          itinerary += `**Evening:**\n• Dinner at **${restaurants[1]?.name || restaurants[0]?.name}**${restaurants[1]?.michelin_stars ? ' ⭐'.repeat(restaurants[1].michelin_stars) : ''}\n\n`;
          itinerary += `Would you like me to save this to your trips?`;

          return itinerary;
        }
      }
      return `I can create a custom itinerary! Try:\n• "I'm in Shibuya for 3 hours"\n• "Plan a day in Paris"\n• "Create an itinerary for Tokyo"`;
    }

    // 🎯 CONTEXTUAL: Based on saved places
    if (user && (lowerQuery.includes('like') || lowerQuery.includes('similar') || lowerQuery.includes('more'))) {
      const { data: savedPlaces } = await supabase
        .from('saved_places')
        .select('destination_slug')
        .eq('user_id', user.id)
        .limit(1);

      if (savedPlaces && savedPlaces.length > 0) {
        const { data: savedDest } = await supabase
          .from('destinations')
          .select('*')
          .eq('slug', savedPlaces[0].destination_slug)
          .single();

        if (savedDest) {
          // Find similar destinations (same category or city)
          const { data: similar } = await supabase
            .from('destinations')
            .select('*')
            .or(`category.eq.${savedDest.category},city.eq.${savedDest.city}`)
            .neq('slug', savedDest.slug)
            .limit(5);

          if (similar && similar.length > 0) {
            const list = similar.map(d => `• **${d.name}** - ${d.city.replace(/-/g, ' ')}`).join('\n');
            return `Based on your interest in **${savedDest.name}**, you might like:\n\n${list}`;
          }
        }
      }
    }

    // Check for city queries
    const cityMatch = lowerQuery.match(/(?:in|at|near)\s+([a-z\s-]+)/i);
    if (cityMatch) {
      const city = cityMatch[1].trim().replace(/\s+/g, '-');
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .ilike('city', `%${city}%`)
        .limit(5);

      if (data && data.length > 0) {
        const list = data.map(d => `• **${d.name}** - ${d.category}`).join('\n');
        return `I found these places in ${city}:\n\n${list}\n\nWould you like to know more about any of these?`;
      }
    }

    // Check for category queries (cozy cafe, etc.)
    const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
    const foundCategory = categories.find(cat => lowerQuery.includes(cat));
    if (foundCategory) {
      // Check for city in query too
      const cityInQuery = lowerQuery.match(/(?:in|at)\s+([a-z\s-]+)/i);
      let query = supabase
        .from('destinations')
        .select('*')
        .ilike('category', `%${foundCategory}%`);

      if (cityInQuery) {
        const city = cityInQuery[1].trim().replace(/\s+/g, '-');
        query = query.ilike('city', `%${city}%`);
      }

      const { data } = await query.limit(5);

      if (data && data.length > 0) {
        const list = data.map(d => `• **${d.name}** in ${d.city.replace(/-/g, ' ')}`).join('\n');
        const location = cityInQuery ? ` in ${cityInQuery[1]}` : '';
        return `Here are some great ${foundCategory}s${location}:\n\n${list}`;
      }
    }

    // Check for Michelin queries
    if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .gt('michelin_stars', 0)
        .order('michelin_stars', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        const list = data.map(d => {
          const stars = '⭐'.repeat(d.michelin_stars);
          return `• **${d.name}** ${stars} - ${d.city.replace(/-/g, ' ')}`;
        }).join('\n');
        return `Here are our top Michelin-starred restaurants:\n\n${list}`;
      }
    }

    // Default greeting with personalization
    const greetings = ['hi', 'hello', 'hey'];
    if (greetings.some(g => lowerQuery.includes(g))) {
      const userName = user ? 'there' : 'there';
      return `Hello ${userName}! 👋 I can help you:\n\n• Find places in specific cities\n• Discover restaurants, cafes, or hotels\n• Create custom itineraries\n• Get personalized recommendations\n\nWhat would you like to explore?`;
    }

    // Fallback
    return `I can help you:\n\n• Find destinations in any city\n• Search by type (restaurant, cafe, hotel)\n• Create custom itineraries\n• Get recommendations based on your preferences\n\nTry asking: "Find me a cozy cafe in Paris" or "Plan an itinerary for Tokyo"`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium">Ask AI Travel Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center pointer-events-none">
      {/* Chat History - Floating Above */}
      {messages.length > 0 && (
        <div className="w-full max-w-3xl mb-4 px-4 pointer-events-auto">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-medium opacity-70">AI Assistant</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content.split('\n').map((line, i) => {
                        // Parse markdown-style bold
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={i}>
                            {parts.map((part, j) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                              }
                              return <span key={j}>{part}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Input Bar - Bottom Center */}
      <div className="w-full max-w-3xl px-4 pb-6 pointer-events-auto">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about destinations, cities, or restaurants..."
                rows={1}
                className="w-full resize-none bg-transparent border-none outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setMessages([]);
                }}
                className="p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg hover:scale-105 transition-transform"
              >
                {messages.length > 0 ? <Minimize2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </button>
            </div>
          </form>

          {messages.length === 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Best restaurants in Tokyo",
                  "Michelin-starred restaurants",
                  "Cafes in Paris"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
