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
  onTextSearch?: (query: string) => void;
}

export function SmartSearch({ destinations, onSearchResults, onClear, onTextSearch }: SmartSearchProps) {
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
    if (onTextSearch) {
      onTextSearch("");
    }
    onClear();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search destinations or try AI: 'romantic restaurants in Paris'"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onTextSearch && !isAIMode) {
              onTextSearch(e.target.value);
            }
          }}
          onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
          className="pl-12 pr-32 h-12 text-base border-gray-300"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          {isAIMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleAISearch}
            disabled={!query.trim() || smartSearchMutation.isPending}
            size="sm"
            className="bg-black hover:bg-gray-800 h-8"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Search
          </Button>
        </div>
      </div>

      {aiExplanation && (
        <div className="bg-black/5 border border-black/10 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{aiExplanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

