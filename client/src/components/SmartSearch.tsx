import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Destination } from "@/types/destination";

interface SmartSearchProps {
  destinations: Destination[];
  onSearchResults: (slugs: string[], explanation: string) => void;
  onClear: () => void;
}

export function SmartSearch({ destinations, onSearchResults, onClear }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");

  const smartSearchMutation = trpc.ai.smartSearch.useMutation();

  const handleAISearch = async () => {
    if (!query.trim() || smartSearchMutation.isPending) return;

    try {
      const result = await smartSearchMutation.mutateAsync({
        query,
        destinations,
      });

      setAiExplanation(result.explanation);
      onSearchResults(result.matchedDestinations, result.explanation);
      setIsAIMode(true);
    } catch (error) {
      console.error("Smart search error:", error);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsAIMode(false);
    setAiExplanation("");
    onClear();
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-600" />
        <Input
          placeholder="Try: 'romantic restaurants in Paris' or 'budget cafes in Tokyo'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
          className="pl-16 pr-48 h-16 text-lg font-medium border-2 border-black rounded-none focus:border-black focus:ring-0 placeholder:text-gray-600 bg-white"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-3">
          {isAIMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-12 px-6 border-2 border-black rounded-none hover:bg-black hover:text-white font-medium uppercase tracking-wide"
            >
              <X className="h-5 w-5 mr-2" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleAISearch}
            disabled={!query.trim() || smartSearchMutation.isPending}
            size="sm"
            className="bg-black hover:bg-gray-800 h-12 px-6 rounded-none font-medium uppercase tracking-wide"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            AI Search
          </Button>
        </div>
      </div>

      {aiExplanation && (
        <div className="bg-gray-50 border-2 border-black p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 mt-1 flex-shrink-0 text-black" />
            <p className="text-base text-gray-700 font-medium leading-relaxed">{aiExplanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

