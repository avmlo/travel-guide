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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          placeholder="Try: 'romantic restaurants in Paris' or 'budget cafes in Tokyo'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
          className="pl-12 pr-40 h-14 text-base border-2 border-black rounded-none focus:border-black focus:ring-0 placeholder:text-gray-500"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          {isAIMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-10 px-4 border-2 border-black rounded-none hover:bg-black hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleAISearch}
            disabled={!query.trim() || smartSearchMutation.isPending}
            size="sm"
            className="bg-black hover:bg-gray-800 h-10 px-4 rounded-none"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Search
          </Button>
        </div>
      </div>

      {aiExplanation && (
        <div className="bg-gray-50 border-2 border-black p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0 text-black" />
            <p className="text-sm text-gray-700 font-medium">{aiExplanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

