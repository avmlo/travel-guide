import { Destination } from "@/types/destination";

export interface TravelRecord {
  slug: string;
  name: string;
  city?: string | null;
  category?: string | null;
  crown?: boolean | null;
  michelin_stars?: number | null;
  michelinStars?: number | null;
  description?: string | null;
  content?: string | null;
  summary?: string | null;
  mainImage?: string | null;
  image?: string | null;
  image_url?: string | null;
}

export interface AssistantSuggestion {
  slug: string;
  name: string;
  city: string;
  category: string;
  michelinStars: number;
  image?: string;
  reason: string;
}

export interface AssistantReply {
  content: string;
  suggestions: AssistantSuggestion[];
  followUps: string[];
}

const categoryKeywords: Array<{ key: string; match: string; keywords: string[] }> = [
  { key: "Eat & Drink", match: "eat", keywords: ["restaurant", "eat", "dinner", "lunch", "food", "drink", "bar", "cocktail"] },
  { key: "Stay", match: "stay", keywords: ["stay", "hotel", "sleep", "accommodation", "resort"] },
  { key: "See & Do", match: "see", keywords: ["museum", "art", "gallery", "culture", "exhibit", "see", "do", "experience"] },
  { key: "Cafe", match: "cafe", keywords: ["coffee", "cafe", "breakfast", "brunch"] },
  { key: "Nightlife", match: "night", keywords: ["night", "club", "late", "speakeasy"] },
  { key: "Shop", match: "shop", keywords: ["shop", "shopping", "boutique", "store"] },
];

const itineraryKeywords = ["itinerary", "day", "plan", "schedule", "route"];

const toTitleCase = (value: string) =>
  value
    .split(/[-\s]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const cleanText = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? "";

const extractReason = (record: TravelRecord) => {
  const michelin = getMichelin(record);
  const baseDescription = cleanText(record.summary || record.description || record.content);

  if (michelin > 0) {
    return `${michelin}★ Michelin standout known for ${baseDescription ? baseDescription.split(".")[0] : "its exceptional tasting menu"}.`;
  }

  if (baseDescription) {
    const firstSentence = baseDescription.split(".")[0];
    return firstSentence.length > 140 ? `${firstSentence.slice(0, 137)}…` : firstSentence;
  }

  if (record.category) {
    return `Highlighted for its ${record.category.toLowerCase()} experience.`;
  }

  return "A trusted pick from the Urban Manual community.";
};

const getMichelin = (record: TravelRecord) => {
  if (typeof record.michelinStars === "number") return record.michelinStars;
  if (typeof record.michelin_stars === "number") return record.michelin_stars;
  return 0;
};

const getImage = (record: TravelRecord) => record.image || record.image_url || record.mainImage || undefined;

const normalize = (value: string) => value.toLowerCase();

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const mapToSuggestion = (record: TravelRecord): AssistantSuggestion => ({
  slug: record.slug,
  name: record.name,
  city: toTitleCase(record.city || ""),
  category: record.category ? toTitleCase(record.category) : "Destination",
  michelinStars: getMichelin(record),
  image: getImage(record),
  reason: extractReason(record),
});

const scoreRecord = (record: TravelRecord, query: string, city?: string, categoryMatch?: string) => {
  let score = 0;
  const michelin = getMichelin(record);
  if (michelin > 0) score += michelin * 4;

  if (record.category && categoryMatch && record.category.toLowerCase().includes(categoryMatch)) {
    score += 6;
  }

  if (city && record.city?.toLowerCase() === city) {
    score += 8;
  }

  if (record.summary || record.description || record.content) {
    const text = cleanText(record.summary || record.description || record.content).toLowerCase();
    if (text.includes("award")) score += 2;
    if (text.includes("design")) score += 1;
    if (text.includes("signature")) score += 1;
  }

  if (record.crown) score += 5;

  if (normalize(query).includes("hidden")) {
    score -= michelin > 0 ? 3 : 0;
  }

  return score;
};

const detectCity = (query: string, records: TravelRecord[]) => {
  const normalizedQuery = normalize(query);
  const cityPool = unique(
    records
      .map(record => record.city?.toLowerCase())
      .filter((city): city is string => Boolean(city))
  ).sort((a, b) => a.localeCompare(b));

  return cityPool.find(city => normalizedQuery.includes(city));
};

const detectCategory = (query: string) => {
  const normalizedQuery = normalize(query);
  return categoryKeywords.find(entry => entry.keywords.some(keyword => normalizedQuery.includes(keyword)));
};

const shouldBuildItinerary = (query: string) => {
  const normalizedQuery = normalize(query);
  return itineraryKeywords.some(keyword => normalizedQuery.includes(keyword));
};

export function buildAssistantResponse(
  query: string,
  records: TravelRecord[],
  options?: { limit?: number; userName?: string }
): AssistantReply {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      content: "Ask me about any city, cuisine, or vibe and I'll surface the right spots.",
      suggestions: [],
      followUps: [],
    };
  }

  const city = detectCity(trimmedQuery, records);
  const categoryMatch = detectCategory(trimmedQuery);
  const wantsMichelin = normalize(trimmedQuery).includes("michelin");
  const wantsBudget = normalize(trimmedQuery).includes("budget") || normalize(trimmedQuery).includes("affordable");
  const limit = options?.limit ?? 4;

  let pool = records;
  if (city) {
    pool = pool.filter(record => record.city?.toLowerCase() === city);
  }

  if (categoryMatch) {
    pool = pool.filter(record => record.category?.toLowerCase().includes(categoryMatch.match));
  }

  if (wantsMichelin) {
    pool = pool.filter(record => getMichelin(record) > 0);
  }

  if (wantsBudget) {
    pool = pool.filter(record => {
      const description = cleanText(record.description || record.content).toLowerCase();
      return description.includes("casual") || description.includes("relaxed") || description.includes("approachable");
    });
  }

  if (!city && !categoryMatch && !wantsMichelin) {
    pool = pool.slice(0, 120);
  }

  const scored = pool
    .map(record => ({ record, score: scoreRecord(record, trimmedQuery, city, categoryMatch?.match) }))
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name))
    .map(item => item.record)
    .slice(0, limit);

  const suggestions = scored.map(mapToSuggestion);

  let content = "I pulled together a few places that match what you're after.";

  if (city && categoryMatch) {
    content = `Here are ${categoryMatch.key.toLowerCase()} picks worth exploring in ${toTitleCase(city)}.`;
  } else if (city && wantsMichelin) {
    content = `These Michelin-recognized spots in ${toTitleCase(city)} consistently impress.`;
  } else if (city) {
    content = `Here are standout places across ${toTitleCase(city)}.`;
  } else if (categoryMatch) {
    content = `These ${categoryMatch.key.toLowerCase()} highlights are trending with our travelers.`;
  } else if (wantsMichelin) {
    content = "Here are Michelin-starred destinations across the guide.";
  }

  if (suggestions.length === 0) {
    return {
      content:
        "I couldn't find an exact match. Try asking for a specific city or vibe—like 'design hotels in Copenhagen' or 'hidden cocktail bars in Hong Kong'.",
      suggestions: [],
      followUps: [
        "Find Michelin-starred dinners in Tokyo",
        "Plan a weekend itinerary for Paris",
        "Show me boutique hotels in Barcelona",
      ],
    };
  }

  const followUps: string[] = [];
  if (city) {
    followUps.push(`Plan a weekend itinerary for ${toTitleCase(city)}`);
    followUps.push(`Show me hidden gems in ${toTitleCase(city)}`);
  }
  if (categoryMatch) {
    followUps.push(`More ${categoryMatch.key.toLowerCase()} picks`);
  }
  if (!wantsMichelin) {
    followUps.push("Show Michelin-starred options");
  }

  if (shouldBuildItinerary(trimmedQuery)) {
    const itineraryLines = suggestions.map((suggestion, index) => {
      const day = index + 1;
      return `Day ${day}: ${suggestion.name} – ${suggestion.reason}`;
    });

    content = `Here's a quick flow you can follow:\n\n${itineraryLines.join("\n")}`;
  }

  return {
    content,
    suggestions,
    followUps: unique(followUps).slice(0, 4),
  };
}

export function transformDestinationToRecord(destination: Destination): TravelRecord {
  return {
    slug: destination.slug,
    name: destination.name,
    city: destination.city,
    category: destination.category,
    michelinStars: destination.michelinStars,
    description: destination.content,
    mainImage: destination.mainImage,
  };
}
