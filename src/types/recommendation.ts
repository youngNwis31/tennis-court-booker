export interface Recommendation {
  type: "book-again" | "try-new" | "pattern" | "surface";
  emoji: string;
  title: string;
  description: string;
  courtId?: string;
  link?: string;
}
