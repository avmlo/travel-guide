import { useState, useRef, useEffect } from "react";
import { Send, Minimize2, X, Sparkles, MapPin, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

interface Destination {
  slug: string;
  name: string;
  city: string;
  category: string;
  michelin_stars: number | null;
  image_url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  destinations?: Destination[];
}

export function ChatGPTStyleAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    const query = userMessage.toLowerCase();
    
    try {
      let response = "";
      let destinations: Destination[] = [];
      
      // City query
      if (query.includes("in ") || query.includes("places in") || query.includes("destinations in")) {
        const cityMatch = query.match(/in ([a-z\-]+)/);
        if (cityMatch) {
          const city = cityMatch[1];
          const { data } = await supabase
            .from("destinations")
            .select("slug, name, city, category, michelin_stars, image_url")
            .eq("city", city)
            .limit(6);
          
          if (data && data.length > 0) {
            response = `Here are some great places in ${city}:`;
            destinations = data;
          } else {
            response = `I couldn't find destinations in ${city}. Try searching for Paris, Tokyo, New York, or other cities!`;
          }
        }
      }
      // Category query
      else if (query.includes("eat") || query.includes("drink") || query.includes("restaurant") || query.includes("food")) {
        const { data } = await supabase
          .from("destinations")
          .select("slug, name, city, category, michelin_stars, image_url")
          .eq("category", "Eat & Drink")
          .limit(6);
        
        if (data && data.length > 0) {
          response = "Here are some amazing places to eat & drink:";
          destinations = data;
        }
      }
      else if (query.includes("stay") || query.includes("hotel") || query.includes("accommodation")) {
        const { data } = await supabase
          .from("destinations")
          .select("slug, name, city, category, michelin_stars, image_url")
          .eq("category", "Stay")
          .limit(6);
        
        if (data && data.length > 0) {
          response = "Here are some great places to stay:";
          destinations = data;
        }
      }
      else if (query.includes("space")) {
        const { data } = await supabase
          .from("destinations")
          .select("slug, name, city, category, michelin_stars, image_url")
          .eq("category", "Space")
          .limit(6);
        
        if (data && data.length > 0) {
          response = "Here are some interesting spaces:";
          destinations = data;
        }
      }
      // Michelin query
      else if (query.includes("michelin")) {
        const { data } = await supabase
          .from("destinations")
          .select("slug, name, city, category, michelin_stars, image_url")
          .not("michelin_stars", "is", null)
          .order("michelin_stars", { ascending: false })
          .limit(6);
        
        if (data && data.length > 0) {
          response = "Here are some Michelin-starred restaurants:";
          destinations = data;
        }
      }
      // Default
      else {
        response = "I can help you discover amazing destinations! Try asking:\n\n• Places in Paris\n• Eat & drink recommendations\n• Michelin-starred restaurants\n• Hotels to stay";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response, destinations }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again!" }]);
    } finally {
      setIsTyping(false);
    }
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
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-3">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-white/90 text-gray-800 border border-gray-200"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
              
              {/* Destination Cards */}
              {msg.destinations && msg.destinations.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {msg.destinations.map((dest) => (
                    <button
                      key={dest.slug}
                      onClick={() => handleDestinationClick(dest.slug)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group text-left"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={dest.image_url}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {dest.michelin_stars && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {dest.michelin_stars}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {dest.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{dest.city}</span>
                        </div>
                      </div>
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
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        }}
      >
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <Minimize2 className="w-5 h-5 text-gray-600" />
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about destinations..."
          className="flex-1 bg-transparent border-none outline-none px-2 text-gray-800 placeholder-gray-400"
        />

        {messages.length === 0 && (
          <div className="hidden md:flex gap-2 flex-shrink-0">
            {["Paris restaurants", "Tokyo hotels", "Michelin stars"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
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

