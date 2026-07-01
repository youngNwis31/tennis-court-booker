import type { Booking, Court } from "../types";

export interface ChatResponse {
  text: string;
  followUps?: string[];
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
  followUps?: string[];
}

const faqs: FAQ[] = [
  {
    question: "How do I book a court?",
    answer: "Browse our courts on the homepage, click on one you like, pick a date, select an available time slot, and click 'Confirm Booking'. You'll need to be signed in to complete a booking.",
    keywords: ["book", "reserve", "how to", "make a booking", "schedule"],
    followUps: ["How much does it cost?", "Do I need an account?"],
  },
  {
    question: "How much does it cost?",
    answer: "Prices vary by court — from ₱100/hr for public courts to ₱1,500/hr for premium indoor courts. You can see the hourly rate on each court's card and detail page.",
    keywords: ["cost", "price", "how much", "rate", "fee", "pay", "expensive", "cheap"],
    followUps: ["Show me cheap courts", "What surfaces are available?"],
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes! Go to 'My Bookings' from the navigation bar, find the booking you want to cancel, and click the 'Cancel' button. The time slot will become available again immediately.",
    keywords: ["cancel", "refund", "remove", "delete", "undo"],
    followUps: ["How do I book a court?", "What's my next booking?"],
  },
  {
    question: "What court surfaces are available?",
    answer: "We offer three surface types: Hard courts (great for all levels), Clay courts (slower pace, easier on joints), and Grass courts (fast play, premium experience). Use the filter buttons on the homepage to browse by surface.",
    keywords: ["surface", "hard", "clay", "grass", "type", "kind"],
    followUps: ["Show me grass courts", "Are there indoor courts?"],
  },
  {
    question: "Do I need an account?",
    answer: "You can browse courts and check availability without an account. However, you'll need to sign up (free!) to make a booking. You can register with email/password or sign in with Google.",
    keywords: ["account", "sign up", "register", "login", "sign in", "need to"],
    followUps: ["How do I reset my password?", "How do I book a court?"],
  },
  {
    question: "What are the available hours?",
    answer: "Courts are available for booking from 7:00 AM to 8:00 PM, in 1-hour time slots. Slots that are already booked will appear greyed out.",
    keywords: ["hours", "time", "when", "available", "open", "schedule", "slot"],
    followUps: ["How do I book a court?", "Can I book multiple slots?"],
  },
  {
    question: "Are there indoor courts?",
    answer: "Yes! We have indoor courts — Makati Indoor Tennis Court (₱800/hr) and Kerry Sports Manila in BGC (₱1,500/hr). Look for the 'indoor' badge on court cards. Perfect for rainy season!",
    keywords: ["indoor", "inside", "covered", "rain", "weather"],
    followUps: ["How much does it cost?", "What's the weather like?"],
  },
  {
    question: "How do I reset my password?",
    answer: "Click 'Sign In', then click 'Forgot password?' below the password field. Enter your email and we'll send you a reset link. You can also change your password anytime from your Profile page.",
    keywords: ["password", "reset", "forgot", "change password", "lost"],
    followUps: ["Do I need an account?"],
  },
  {
    question: "Can I book multiple slots?",
    answer: "You can book one slot at a time. To book multiple hours, simply repeat the booking process for each time slot you want. Each slot is a separate booking that you can manage individually.",
    keywords: ["multiple", "several", "more than one", "two", "many", "consecutive"],
    followUps: ["How do I book a court?", "Can I cancel a booking?"],
  },
  {
    question: "Where are the courts located?",
    answer: "Each court has its address listed on the court card and detail page. We have courts across various locations — use the search bar on the homepage to find courts near you.",
    keywords: ["where", "location", "address", "near", "find", "directions"],
    followUps: ["Are there indoor courts?", "What surfaces are available?"],
  },
  {
    question: "Can I leave a review?",
    answer: "Yes! After visiting a court, go to the court's detail page and scroll down to the Reviews section. You can rate the court 1-5 stars and leave a comment. You need to be signed in to review.",
    keywords: ["review", "rate", "rating", "stars", "feedback", "comment"],
    followUps: ["Do I need an account?", "How do I book a court?"],
  },
];

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(input: string, keyword: string): boolean {
  if (input.includes(keyword)) return true;
  if (keyword.length <= 3) return input.includes(keyword);
  const words = input.split(/\s+/);
  return words.some((w) => levenshtein(w, keyword) <= 2);
}

export function parseBookingIntent(input: string): { surface?: string; date?: string; hour?: number } | null {
  const lower = input.toLowerCase();
  if (!lower.includes("book")) return null;

  const result: { surface?: string; date?: string; hour?: number } = {};

  if (lower.includes("hard")) result.surface = "hard";
  else if (lower.includes("clay")) result.surface = "clay";
  else if (lower.includes("grass")) result.surface = "grass";

  const today = new Date();
  if (lower.includes("today")) {
    result.date = today.toISOString().split("T")[0];
  } else if (lower.includes("tomorrow")) {
    const tmr = new Date(today);
    tmr.setDate(tmr.getDate() + 1);
    result.date = tmr.toISOString().split("T")[0];
  } else {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i])) {
        const target = new Date(today);
        const diff = (i - today.getDay() + 7) % 7 || 7;
        target.setDate(target.getDate() + diff);
        result.date = target.toISOString().split("T")[0];
        break;
      }
    }
  }

  const timeMatch = lower.match(/(\d{1,2})\s*(am|pm|:\d{2})/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    if (timeMatch[2].toLowerCase() === "pm" && hour < 12) hour += 12;
    if (timeMatch[2].toLowerCase() === "am" && hour === 12) hour = 0;
    if (hour >= 7 && hour <= 20) result.hour = hour;
  } else if (lower.includes("morning")) {
    result.hour = 9;
  } else if (lower.includes("afternoon")) {
    result.hour = 14;
  } else if (lower.includes("evening")) {
    result.hour = 18;
  }

  if (!result.surface && !result.date && !result.hour) return null;
  return result;
}

export function getDynamicAnswer(input: string, userEmail: string | null, bookings: Booking[], courts: Court[]): ChatResponse | null {
  const lower = input.toLowerCase();

  if (lower.includes("my next") || lower.includes("my booking") || lower.includes("upcoming")) {
    if (!userEmail) return { text: "You're not signed in yet. Sign in to see your bookings!", followUps: ["Do I need an account?"] };
    const today = new Date().toISOString().split("T")[0];
    const upcoming = bookings
      .filter((b) => b.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start_hour - b.start_hour);
    if (upcoming.length === 0) return { text: "You don't have any upcoming bookings. Browse courts on the homepage to book one!", followUps: ["How do I book a court?"] };
    const next = upcoming[0];
    const court = courts.find((c) => c.id === next.court_id);
    const h = next.start_hour;
    const time = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
    const dateStr = new Date(next.date + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    return {
      text: `Your next booking is at ${court?.name ?? "Unknown Court"} on ${dateStr} at ${time}. You have ${upcoming.length} upcoming booking${upcoming.length > 1 ? "s" : ""} total.`,
      followUps: ["Can I cancel a booking?"],
    };
  }

  if (lower.includes("how many") && lower.includes("booking")) {
    if (!userEmail) return { text: "Sign in to track your bookings!", followUps: ["Do I need an account?"] };
    return { text: `You have ${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}.`, followUps: ["What's my next booking?", "Can I cancel a booking?"] };
  }

  if (lower.includes("cheap") || lower.includes("affordable") || lower.includes("budget")) {
    const sorted = [...courts].sort((a, b) => a.hourlyRate - b.hourlyRate);
    const top3 = sorted.slice(0, 3);
    return {
      text: `Here are the most affordable courts:\n\n${top3.map((c) => `${c.emoji} ${c.name} — ₱${c.hourlyRate}/hr (${c.surface})`).join("\n")}`,
      followUps: ["How do I book a court?", "What surfaces are available?"],
    };
  }

  for (const surface of ["grass", "clay", "hard"] as const) {
    if (lower.includes(surface)) {
      const matching = courts.filter((c) => c.surface === surface);
      if (matching.length > 0) {
        return {
          text: `Here are our ${surface} courts:\n\n${matching.map((c) => `${c.emoji} ${c.name} — ₱${c.hourlyRate}/hr${c.indoor ? " (indoor)" : ""}`).join("\n")}`,
          followUps: ["How much does it cost?", "Are there indoor courts?"],
        };
      }
    }
  }

  if (lower.includes("indoor")) {
    const indoor = courts.filter((c) => c.indoor);
    return {
      text: `We have ${indoor.length} indoor courts:\n\n${indoor.map((c) => `${c.emoji} ${c.name} — ₱${c.hourlyRate}/hr (${c.surface})`).join("\n")}`,
      followUps: ["How do I book a court?", "What's the weather like?"],
    };
  }

  if (lower.includes("weather") || lower.includes("rain") || lower.includes("forecast")) {
    return {
      text: "Each court's detail page shows a 3-day weather forecast. If rain is expected at an outdoor court, we'll suggest indoor alternatives automatically!",
      followUps: ["Are there indoor courts?", "How do I book a court?"],
    };
  }

  if (lower.match(/^(hi|hello|hey|sup|yo|howdy|greetings)/)) {
    const name = userEmail?.split("@")[0] ?? "";
    return {
      text: `Hey${name ? ` ${name}` : ""}! 👋 How can I help you today?`,
      followUps: ["How do I book a court?", "What's my next booking?", "Show me cheap courts"],
    };
  }

  if (lower.match(/^(thanks|thank you|thx|ty)/)) {
    return { text: "You're welcome! Let me know if there's anything else I can help with. 😊" };
  }

  return null;
}

export function findAnswer(input: string, userEmail: string | null, bookings: Booking[], courts: Court[]): ChatResponse {
  const dynamic = getDynamicAnswer(input, userEmail, bookings, courts);
  if (dynamic) return dynamic;

  const lower = input.toLowerCase();

  const exactMatch = faqs.find((f) => f.question.toLowerCase() === lower);
  if (exactMatch) return { text: exactMatch.answer, followUps: exactMatch.followUps };

  let bestMatch: FAQ | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (fuzzyMatch(lower, keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { text: bestMatch.answer, followUps: bestMatch.followUps };
  }

  return {
    text: "I'm not sure about that one! Here are some things I can help with:\n\n• How to book a court\n• Pricing & court info\n• Your bookings & cancellations\n• Weather forecasts\n• Court surfaces & facilities\n\nTry asking about any of these topics!",
    followUps: ["How do I book a court?", "Show me cheap courts", "What's my next booking?"],
  };
}
