import { Crown, MapPin, BookmarkCheck, Footprints } from "lucide-react";
import { Destination } from "@/types/destination";

function capitalizeCity(city: string): string {
  return city
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  isSaved?: boolean;
  isVisited?: boolean;
}

export function DestinationCard({ destination, onClick, isSaved, isVisited }: DestinationCardProps) {
  const cityName = destination.city ? capitalizeCity(destination.city) : "";
  const hasBadges = isSaved || isVisited;

  return (
    <div
      className="group flex cursor-pointer flex-col gap-4 rounded-[32px] border border-black/5 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        {destination.mainImage ? (
          <img
            src={destination.mainImage}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 text-neutral-400">
            <MapPin className="h-12 w-12" />
          </div>
        )}

        {destination.crown && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-amber-600 shadow-sm backdrop-blur">
            <Crown className="h-3 w-3" />
            Signature
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900">
          {destination.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          {cityName && <span>{cityName}</span>}
          {destination.michelinStars ? (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {destination.michelinStars}★ Michelin
            </span>
          ) : null}
        </div>
        {hasBadges && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-600">
            {isSaved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
                <BookmarkCheck className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {isVisited && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
                <Footprints className="h-3.5 w-3.5" /> Visited
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
