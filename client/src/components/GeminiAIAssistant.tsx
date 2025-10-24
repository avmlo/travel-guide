import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { User } from "@/types/user";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function GeminiAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const chatMutation = trpc.ai.chat.useMutation();

  useEffect(() => {
    // Load user
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    loadUser();

    // Load destinations
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
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initial greeting when opened
    if (isOpen && messages.length === 0) {
      const greeting = user
        ? `Hi ${user.user_metadata?.name || user.email?.split('@')[0]}! 👋 I'm your AI travel assistant. I can help you discover amazing destinations, create personalized itineraries, and answer any travel questions. What would you like to explore today?`
        : "Hello! 👋 I'm your AI travel assistant powered by Google Gemini. I can help you discover destinations, create itineraries, and answer travel questions. What are you looking for?";
      
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
      const result = await chatMutation.mutateAsync({
        messages: [...messages, { role: "user", content: userMessage }],
        destinations: destinations
      });

      setMessages(prev => [...prev, { role: "assistant", content: result.message }]);
    } catch (error) {
      console.error("Error chatting with AI:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
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

  const handleDestinationClick = (slug: string) => {
    setLocation(`/destination/${slug}`);
    setIsOpen(false);
  };

  // Parse message content for destination links
  const renderMessage = (content: string) => {
    // Match destination slugs in format [destination-slug]
    const parts = content.split(/(\[[\w-]+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[([\w-]+)\]/);
      if (match) {
        const slug = match[1];
        const dest = destinations.find(d => d.slug === slug);
        if (dest) {
          return (
            <button
              key={index}
              onClick={() => handleDestinationClick(slug)}
              className="text-blue-600 hover:underline font-medium"
            >
              {dest.name}
            </button>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask AI Travel Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">AI Travel Assistant</h3>
            <p className="text-xs opacity-90">Powered by Google Gemini</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{renderMessage(message.content)}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about destinations, itineraries..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

