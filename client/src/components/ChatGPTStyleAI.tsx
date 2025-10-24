import { useState, useRef, useEffect } from "react";
import { Send, Minimize2, X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatGPTStyleAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      if (query.includes("in ") || query.includes("places in") || query.includes("destinations in")) {
        const cityMatch = query.match(/in ([a-z\-]+)/);
        if (cityMatch) {
          const city = cityMatch[1];
          const { data } = await supabase
            .from("destinations")
            .select("*")
            .eq("city", city)
            .limit(5);
          
          if (data && data.length > 0) {
            response = `Here are some great places in ${city}:\\n\\n`;
            data.forEach((dest: any) => {
              response += `**${dest.name}** - ${dest.category}${dest.michelin_stars ? ` (${dest.michelin_stars}⭐)` : ""}\\n`;
            });
          } else {
            response = `I couldn't find destinations in ${city}. Try searching for Paris, Tokyo, New York, or other cities!`;
          }
        }
      } else if (query.includes("restaurant") || query.includes("cafe") || query.includes("hotel") || query.includes("bar")) {
        let category = "";
        if (query.includes("restaurant")) category = "restaurant";
        else if (query.includes("cafe")) category = "cafe";
        else if (query.includes("hotel")) category = "hotel";
        else if (query.includes("bar")) category = "bar";
        
        const { data } = await supabase
          .from("destinations")
          .select("*")
          .eq("category", category)
          .limit(5);
        
        if (data && data.length > 0) {
          response = `Here are some amazing ${category}s:\\n\\n`;
          data.forEach((dest: any) => {
            response += `**${dest.name}** in ${dest.city}${dest.michelin_stars ? ` (${dest.michelin_stars}⭐)` : ""}\\n`;
          });
        }
      } else if (query.includes("michelin")) {
        const { data } = await supabase
          .from("destinations")
          .select("*")
          .not("michelin_stars", "is", null)
          .order("michelin_stars", { ascending: false })
          .limit(5);
        
        if (data && data.length > 0) {
          response = "Here are some Michelin-starred restaurants:\\n\\n";
          data.forEach((dest: any) => {
            response += `**${dest.name}** in ${dest.city} - ${dest.michelin_stars}⭐\\n`;
          });
        }
      } else {
        response = "I can help you discover amazing destinations! Try asking:\\n\\n- Places in Paris\\n- Best restaurants\\n- Michelin-starred restaurants\\n- Hotels in Tokyo";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
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
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      {messages.length > 0 && (
        <div 
          className="mb-4 max-h-96 overflow-y-auto rounded-2xl p-4 space-y-4"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/90 text-gray-800 border border-gray-200"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {msg.content.split("**").map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
              </div>
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
          className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
