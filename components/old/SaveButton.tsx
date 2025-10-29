import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SaveButtonProps {
  destinationSlug: string;
  className?: string;
}

export function SaveButton({ destinationSlug, className = "" }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();
  const { data: savedPlaces } = trpc.user.getSavedPlaces.useQuery(undefined, {
    enabled: !!user,
  });

  const saveMutation = trpc.user.savePlace.useMutation();
  const unsaveMutation = trpc.user.unsavePlace.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (savedPlaces) {
      setIsSaved(savedPlaces.some((p) => p.destinationSlug === destinationSlug));
    }
  }, [savedPlaces, destinationSlug]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      window.location.href = "/api/auth/login";
      return;
    }

    try {
      if (isSaved) {
        await unsaveMutation.mutateAsync({ destinationSlug });
        setIsSaved(false);
      } else {
        await saveMutation.mutateAsync({ destinationSlug });
        setIsSaved(true);
      }
      // Refresh saved places
      utils.user.getSavedPlaces.invalidate();
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all ${
        isSaved
          ? "bg-red-500/90 hover:bg-red-600"
          : "bg-white/90 hover:bg-white"
      } ${className}`}
      disabled={saveMutation.isPending || unsaveMutation.isPending}
    >
      <Heart
        className={`h-4 w-4 transition-all ${
          isSaved
            ? "fill-white text-white"
            : "text-gray-600 hover:text-red-500"
        }`}
      />
    </button>
  );
}

