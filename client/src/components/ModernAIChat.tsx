import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ModernAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
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
        .select('*')
        .limit(500);
      
      if (data) {
        setDestinations(data);
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
        ? `Hi ${user.user_metadata?.name || user.email?.split('@')[0]}! I'm here to help you discover amazing destinations. What are you looking for?`
        : "Hello! I can help you discover amazing destinations around the world. What interests you?";
      
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [isOpen, user]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Simple keyword-based responses
      const lowerQuery = userMessage.toLowerCase();
      let response = "";
      let matchedDestinations: any[] = [];

      // Check for city queries
      const cities = ['tokyo', 'paris', 'london', 'new york', 'singapore', 'hong kong', 'seoul', 'bangkok'];
      const matchedCity = cities.find(city => lowerQuery.includes(city));

      if (matchedCity) {
        matchedDestinations = destinations.filter(d => 
          d.city.toLowerCase().includes(matchedCity)
        ).slice(0, 5);
        
        if (matchedDestinations.length > 0) {
          response = `I found ${matchedDestinations.length} amazing places in ${matchedCity.charAt(0).toUpperCase() + matchedCity.slice(1)}:\n\n`;
          matchedDestinations.forEach(d => {
            response += `• ${d.name}${d.michelin_stars ? ` (${d.michelin_stars}★)` : ''}\n`;
          });
        }
      }
      // Check for category queries
      else if (lowerQuery.includes('restaurant') || lowerQuery.includes('eat') || lowerQuery.includes('food')) {
        matchedDestinations = destinations.filter(d => 
          d.category?.toLowerCase().includes('eat') || d.category?.toLowerCase().includes('restaurant')
        ).slice(0, 5);
        
        response = `Here are some top restaurants:\n\n`;
        matchedDestinations.forEach(d => {
          response += `• ${d.name} in ${d.city}${d.michelin_stars ? ` (${d.michelin_stars}★)` : ''}\n`;
        });
      }
      // Check for Michelin queries
      else if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
        matchedDestinations = destinations.filter(d => 
          d.michelin_stars && d.michelin_stars > 0
        ).slice(0, 5);
        
        response = `Here are some Michelin-starred restaurants:\n\n`;
        matchedDestinations.forEach(d => {
          response += `• ${d.name} - ${d.michelin_stars}★ (${d.city})\n`;
        });
      }
      // Default response
      else {
        response = "I can help you find restaurants, hotels, attractions, and more. Try asking about:\n\n• Specific cities (e.g., 'places in Tokyo')\n• Categories (e.g., 'find restaurants')\n• Michelin-starred restaurants\n\nWhat would you like to explore?";
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="fixed bottom-8 right-8 z-50 w-[400px] h-[600px] bg-white dark:bg-gray-950 rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="bg-black dark:bg-white text-white dark:text-black p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 dark:bg-black/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase">AI Travel Assistant</h3>
            <p className="text-xs text-white/60 dark:text-black/60">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:opacity-60 rounded-full p-2 transition-opacity"
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
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
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

