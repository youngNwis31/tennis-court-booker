import type { Review } from "../types";

// Positive and negative keyword categories for analysis
const categories: Record<string, { keywords: string[]; positive: boolean }> = {
  "great surface": { keywords: ["surface", "court quality", "well maintained", "clean", "smooth", "great court"], positive: true },
  "good location": { keywords: ["location", "convenient", "easy to find", "accessible", "parking"], positive: true },
  "friendly staff": { keywords: ["staff", "friendly", "helpful", "welcoming", "service"], positive: true },
  "good value": { keywords: ["value", "worth", "affordable", "cheap", "reasonable", "price"], positive: true },
  "well lit": { keywords: ["lights", "lighting", "lit", "night", "evening"], positive: true },
  "nice facilities": { keywords: ["facilities", "amenities", "restroom", "shower", "locker", "bench"], positive: true },
  "can get crowded": { keywords: ["crowded", "busy", "packed", "wait", "full"], positive: false },
  "needs maintenance": { keywords: ["crack", "worn", "old", "damaged", "broken", "repair"], positive: false },
  "limited parking": { keywords: ["parking", "no parking", "hard to park"], positive: false },
  "expensive": { keywords: ["expensive", "overpriced", "pricey", "costly"], positive: false },
};

function generateSummary(reviews: Review[]): string {
  if (reviews.length === 0) return "";
  if (reviews.length < 2) return "";

  const allText = reviews.map((r) => r.comment.toLowerCase()).join(" ");
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const found: { label: string; positive: boolean }[] = [];

  for (const [label, { keywords, positive }] of Object.entries(categories)) {
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        found.push({ label, positive });
        break;
      }
    }
  }

  const parts: string[] = [];

  // Rating sentence
  if (avgRating >= 4.5) parts.push("Highly rated by players.");
  else if (avgRating >= 3.5) parts.push("Well regarded by most players.");
  else if (avgRating >= 2.5) parts.push("Mixed reviews from players.");
  else parts.push("Below average ratings.");

  // Positive highlights
  const positives = found.filter((f) => f.positive).map((f) => f.label);
  if (positives.length > 0) {
    parts.push(`Known for ${positives.slice(0, 2).join(" and ")}.`);
  }

  // Negatives
  const negatives = found.filter((f) => !f.positive).map((f) => f.label);
  if (negatives.length > 0) {
    parts.push(`Some mention ${negatives[0]}.`);
  }

  // Popular times hint
  if (allText.includes("weekend") || allText.includes("saturday") || allText.includes("sunday")) {
    parts.push("Popular on weekends.");
  }
  if (allText.includes("morning")) {
    parts.push("Morning slots fill up fast.");
  }

  return parts.join(" ");
}

export function ReviewSummary({ reviews }: { reviews: Review[] }) {
  const summary = generateSummary(reviews);

  if (!summary) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
      <p className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1">
        <span>🤖</span> AI Summary
      </p>
      <p className="text-sm text-indigo-900">{summary}</p>
    </div>
  );
}
