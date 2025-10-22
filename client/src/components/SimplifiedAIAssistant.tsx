import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SimplifiedAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', session.user.id)
          .single();
        
        const name = profile?.display_name || session.user.email?.split('@')[0] || "";
        setUserName(name);
        
        const greeting = name 
          ? `Hi ${name}! I'm your AI travel assistant.`
          : "Hi! I'm your AI travel assistant.";
        
        setMessages([{
          role: "assistant",
          content: `${greeting} I can help you:\n\n✈️ Find perfect destinations from our curated collection\n🗺️ Get recommendations based on your preferences\n🍽️ Discover restaurants, hotels, and attractions\n💡 Answer travel questions\n\nJust ask me anything! For example:\n• "Recommend romantic restaurants in Paris"\n• "What are the best cafes in Tokyo?"\n• "Show me Michelin-starred restaurants in New York"`
        }]);
      } else {
        setMessages([{
          role: "assistant",
          content: "Hi! I'm your AI travel assistant. I can help you:\n\n✈️ Find perfect destinations from our curated collection\n🗺️ Get recommendations based on your preferences\n🍽️ Discover restaurants, hotels, and attractions\n💡 Answer travel questions\n\nSign in to get personalized recommendations based on your saved places!"
        }]);
      }
    }
    loadUser();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get destinations from database
      const { data: destinations } = await supabase
        .from('destinations')
        .select('name, slug, city, category, michelin_stars, content');

      // Simple keyword-based matching for demo
      const query = input.toLowerCase();
      let response = "";

      // Check for city queries
      const cityMatch = destinations?.filter(d => 
        query.includes(d.city.toLowerCase())
      );

      // Check for category queries
      const categoryMatch = destinations?.filter(d => 
        query.includes(d.category.toLowerCase())
      );

      // Check for Michelin queries
      const michelinMatch = destinations?.filter(d => 
        d.michelin_stars > 0 && (query.includes('michelin') || query.includes('star'))
      );

      if (michelinMatch && michelinMatch.length > 0 && query.includes('michelin')) {
        response = `I found ${michelinMatch.length} Michelin-starred restaurants:\n\n`;
        michelinMatch.slice(0, 5).forEach(d => {
          response += `⭐ **${d.name}** (${d.michelin_stars} ${d.michelin_stars === 1 ? 'star' : 'stars'})\n`;
          response += `   ${d.city} • ${d.category}\n\n`;
        });
        response += `\nVisit any of these destinations to see more details!`;
      } else if (cityMatch && cityMatch.length > 0) {
        const city = cityMatch[0].city;
        response = `I found ${cityMatch.length} destinations in ${city}:\n\n`;
        cityMatch.slice(0, 5).forEach(d => {
          response += `📍 **${d.name}**\n`;
          response += `   ${d.category}${d.michelin_stars > 0 ? ` • ${d.michelin_stars} Michelin star${d.michelin_stars > 1 ? 's' : ''}` : ''}\n\n`;
        });
        if (cityMatch.length > 5) {
          response += `\n...and ${cityMatch.length - 5} more! Search for "${city}" to see all destinations.`;
        }
      } else if (categoryMatch && categoryMatch.length > 0) {
        const category = categoryMatch[0].category;
        response = `I found ${categoryMatch.length} ${category.toLowerCase()} destinations:\n\n`;
        categoryMatch.slice(0, 5).forEach(d => {
          response += `📍 **${d.name}**\n`;
          response += `   ${d.city}${d.michelin_stars > 0 ? ` • ${d.michelin_stars} Michelin star${d.michelin_stars > 1 ? 's' : ''}` : ''}\n\n`;
        });
        if (categoryMatch.length > 5) {
          response += `\n...and ${categoryMatch.length - 5} more! Use the category filter to see all.`;
        }
      } else {
        // Generic response
        response = `I'd be happy to help! Here are some ways I can assist:\n\n`;
        response += `🔍 **Search by City**: Try "Show me places in Paris" or "Tokyo restaurants"\n`;
        response += `🏷️ **Search by Category**: Try "Find cafes" or "Show me hotels"\n`;
        response += `⭐ **Michelin Stars**: Try "Michelin-starred restaurants" or "3-star restaurants"\n\n`;
        response += `You can also browse our collection using the search bar and filters at the top!`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again or use the search and filter features on the main page.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50 flex items-center gap-3 group hover:scale-105"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
          <span className="font-medium text-sm hidden sm:inline">AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold">AI Travel Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white text-gray-900 shadow-sm border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

