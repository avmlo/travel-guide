import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Minimize2, X, Sparkles, MapPin, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import {
  AssistantSuggestion,
  TravelRecord,
  buildAssistantResponse,
} from "@/utils/aiAssistant";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: AssistantSuggestion[];
  followUps?: string[];
}

export function ChatGPTStyleAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [destinations, setDestinations] = useState<TravelRecord[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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

  const formatCity = (city: string) =>
    city
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const quickPrompts = useMemo(() => {
    const cityPool = Array.from(
      new Set(destinations.map(destination => destination.city).filter((city): city is string => Boolean(city)))
    );

    if (cityPool.length === 0) {
      return [
        'Plan a weekend itinerary for Paris',
        'Find Michelin-starred dinners in Tokyo',
        'Show me boutique hotels in Barcelona',
        'Where should I grab cocktails in New York?'
      ];
    }

    const templates = [
      (city: string) => `Plan a weekend itinerary for ${formatCity(city)}`,
      (city: string) => `Find Michelin-starred dinners in ${formatCity(city)}`,
      (city: string) => `Show me boutique hotels in ${formatCity(city)}`,
      (city: string) => `Where should I grab cocktails in ${formatCity(city)}?`
    ];

    return templates.map((template, index) => template(cityPool[index % cityPool.length]!));
  }, [destinations]);

  const sendPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: trimmedPrompt }]);
    setIsTyping(true);

    try {
      const reply = buildAssistantResponse(trimmedPrompt, destinations, { limit: 5 });
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: reply.content,
          suggestions: reply.suggestions,
          followUps: reply.followUps,
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setInput("");
    await sendPrompt(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDestinationClick = (slug: string) => {
    setLocation(`/destination/${slug}`);
    setIsOpen(false);
    setMessages([]);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput("");
    sendPrompt(prompt);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
      >
        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        <span className="font-medium">Ask AI Travel Assistant</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Travel Assistant</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="ml-2 hover:bg-white/20 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      {/* Chat History */}
      {messages.length > 0 && (
        <div
          className="mb-4 max-h-[32rem] overflow-y-auto rounded-2xl p-4 space-y-4"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.15)',
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-3">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-white/90 text-gray-800 border border-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {msg.suggestions.map((suggestion) => (
                    <button
                      key={suggestion.slug}
                      onClick={() => handleDestinationClick(suggestion.slug)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group text-left"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        {suggestion.image && (
                          <img
                            src={suggestion.image}
                            alt={suggestion.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )}
                        {suggestion.michelinStars > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {suggestion.michelinStars}
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {suggestion.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 uppercase tracking-[0.2em]">
                            <MapPin className="w-3 h-3" /> {suggestion.city}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3">{suggestion.reason}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {msg.role === "assistant" && msg.followUps && msg.followUps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.followUps.map((followUp) => (
                    <button
                      key={followUp}
                      onClick={() => handleQuickPrompt(followUp)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 transition hover:border-gray-900 hover:text-gray-900"
                    >
                      {followUp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/90 text-gray-800 border border-gray-200 px-4 py-2 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Bar */}
      <div
        className="rounded-full p-2 flex items-center gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.15)',
        }}
      >
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <Minimize2 className="w-5 h-5 text-gray-600" />
        </button>

        <div className="hidden md:flex flex-wrap gap-2 max-w-[50%]">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-600 transition hover:bg-gray-900 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me for Michelin spots, itineraries, or hidden gems…"
          className="flex-1 bg-transparent border-none outline-none px-2 text-gray-800 placeholder-gray-400"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 bg-black hover:bg-gray-800 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setIsOpen(false);
            setMessages([]);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
