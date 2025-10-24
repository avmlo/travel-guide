import { useState, useEffect, useRef, useMemo } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import {
  buildAssistantResponse,
  AssistantSuggestion,
  TravelRecord,
} from "@/utils/aiAssistant";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: AssistantSuggestion[];
  followUps?: string[];
}

export function ModernAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<TravelRecord[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    loadUser();

    async function loadDestinations() {
      const { data } = await supabase
        .from('destinations')
        .select('slug, name, city, category, michelin_stars, description, content, image, image_url, crown')
        .limit(500);

      if (data) {
        setDestinations(data as TravelRecord[]);
      }
    }
    loadDestinations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = user
        ? `Hi ${user.user_metadata?.name || user.email?.split('@')[0]}! I can surface perfect spots, itineraries, and tips. Ask about any city, vibe, or experience and I'll dig in.`
        : "Hello! I'm your travel copilot. Ask me about cities, cuisines, vibes, or itineraries and I'll surface the right places.";

      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [isOpen, user]);

  const formatCity = (city: string) =>
    city
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const defaultQuickPrompts = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(destinations.map(destination => destination.city).filter((city): city is string => Boolean(city)))
    );

    if (uniqueCities.length === 0) {
      return [
        'Find Michelin-starred dinners in Tokyo',
        'Plan a weekend itinerary for Paris',
        'Show me design hotels in Copenhagen',
        'Where should I grab coffee in Seoul?'
      ];
    }

    const templates = [
      (city: string) => `Find Michelin-starred dinners in ${formatCity(city)}`,
      (city: string) => `Plan a weekend itinerary for ${formatCity(city)}`,
      (city: string) => `Show me design hotels in ${formatCity(city)}`,
      (city: string) => `Where should I grab coffee in ${formatCity(city)}?`
    ];

    return templates.map((template, index) => template(uniqueCities[index % uniqueCities.length]!));
  }, [destinations]);

  const sendPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) {
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: trimmedPrompt }]);
    setIsLoading(true);

    try {
      const reply = buildAssistantResponse(trimmedPrompt, destinations);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply.content,
          suggestions: reply.suggestions,
          followUps: reply.followUps,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setInput('');
    await sendPrompt(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionSelect = (slug: string) => {
    setIsOpen(false);
    setTimeout(() => {
      setLocation(`/destination/${slug}`);
    }, 150);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput('');
    sendPrompt(prompt);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask AI Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base">AI Travel Assistant</h3>
            <p className="text-xs text-gray-300">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/10 rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 space-y-3 ${
                message.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

              {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                <div className="space-y-3">
                  {message.suggestions.map(suggestion => (
                    <button
                      key={suggestion.slug}
                      onClick={() => handleSuggestionSelect(suggestion.slug)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/70 text-left transition hover:border-gray-300 hover:bg-gray-100"
                    >
                      <div className="flex gap-3 p-3">
                        {suggestion.image && (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={suggestion.image}
                              alt={suggestion.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{suggestion.name}</p>
                            {suggestion.michelinStars > 0 && (
                              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500">
                                {suggestion.michelinStars}★
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                            {suggestion.city} • {suggestion.category}
                          </p>
                          <p className="mt-2 text-xs text-gray-600 line-clamp-2">{suggestion.reason}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {message.role === 'assistant' && message.followUps && message.followUps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {message.followUps.map(followUp => (
                    <button
                      key={followUp}
                      onClick={() => handleQuickPrompt(followUp)}
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
                    >
                      {followUp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="mb-3 flex flex-wrap gap-2">
          {defaultQuickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-900 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about destinations..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

