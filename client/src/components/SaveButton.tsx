import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleSave}
      className={`${className} hover:bg-transparent`}
      disabled={saveMutation.isPending || unsaveMutation.isPending}
    >
      <Heart
        className={`h-5 w-5 transition-all ${
          isSaved
            ? "fill-red-500 text-red-500"
            : "text-gray-400 hover:text-red-500"
        }`}
      />
    </Button>
  );
}

