import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Destination } from "@/types/destination";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  destinations: Destination[];
}

export function AIAssistant({ destinations }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation();

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
        const name = session.user.user_metadata?.name || "";
        setUserName(name);
        
        // Set initial greeting message
        const greeting = name 
          ? `Hi ${name}! I'm your AI travel assistant.`
          : "Hi! I'm your AI travel assistant.";
        
        setMessages([{
          role: "assistant",
          content: `${greeting} I can help you:\n\n✈️ Find perfect destinations from our curated collection\n🗺️ Create custom itineraries for your trips\n🍽️ Recommend restaurants, hotels, and attractions\n💡 Answer any travel questions\n\nJust ask me anything! For example:\n• "Recommend romantic restaurants in Paris"\n• "Create a 3-day itinerary for Tokyo"\n• "Best Michelin-starred restaurants in New York"`
        }]);
      } else {
        setMessages([{
          role: "assistant",
          content: "Hi! I'm your AI travel assistant. I can help you:\n\n✈️ Find perfect destinations from our curated collection\n🗺️ Create custom itineraries for your trips\n🍽️ Recommend restaurants, hotels, and attractions\n💡 Answer any travel questions\n\nJust ask me anything! For example:\n• \"Recommend romantic restaurants in Paris\"\n• \"Create a 3-day itinerary for Tokyo\"\n• \"Best Michelin-starred restaurants in New York\""
        }]);
      }
    }
    loadUser();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Only send destinations on first message to reduce payload size and avoid memory leak
      const response = await chatMutation.mutateAsync({
        messages: [...messages, userMessage],
        destinations: messages.length === 1 ? destinations : undefined,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Travel Assistant"
          aria-expanded={isOpen}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all z-50 flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          <span className="font-medium text-xs sm:text-sm hidden xs:inline">AI Travel Assistant</span>
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse" aria-hidden="true">!</div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed inset-4 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-96 sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200"
          role="dialog"
          aria-label="AI Travel Assistant Chat"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <h3 className="font-semibold" id="chat-title">AI Travel Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
              aria-label="Close AI Travel Assistant"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={chatMutation.isPending}
                aria-label="Chat message input"
                aria-describedby="chat-help-text"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="bg-black hover:bg-gray-800"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <span id="chat-help-text" className="sr-only">
              Type your travel question and press Enter to send
            </span>
          </div>
        </div>
      )}
    </>
  );
}

