import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUserBookings, useBookingActions } from "../hooks/useBookings";
import { courts } from "../data/courts";
import { supabase } from "../lib/supabase";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
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
    answer:
      "Browse our courts on the homepage, click on one you like, pick a date, select an available time slot, and click 'Confirm Booking'. You'll need to be signed in to complete a booking.",
    keywords: ["book", "reserve", "how to", "make a booking", "schedule"],
    followUps: ["How much does it cost?", "Do I need an account?"],
  },
  {
    question: "How much does it cost?",
    answer:
      "Prices vary by court — from $25/hr for outdoor hard courts to $45/hr for grass courts. You can see the hourly rate on each court's card and detail page.",
    keywords: ["cost", "price", "how much", "rate", "fee", "pay", "expensive", "cheap"],
    followUps: ["Show me cheap courts", "What surfaces are available?"],
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes! Go to 'My Bookings' from the navigation bar, find the booking you want to cancel, and click the 'Cancel' button. The time slot will become available again immediately.",
    keywords: ["cancel", "refund", "remove", "delete", "undo"],
    followUps: ["How do I book a court?", "What's my next booking?"],
  },
  {
    question: "What court surfaces are available?",
    answer:
      "We offer three surface types: Hard courts (great for all levels), Clay courts (slower pace, easier on joints), and Grass courts (fast play, premium experience). Use the filter buttons on the homepage to browse by surface.",
    keywords: ["surface", "hard", "clay", "grass", "type", "kind"],
    followUps: ["Show me grass courts", "Are there indoor courts?"],
  },
  {
    question: "Do I need an account?",
    answer:
      "You can browse courts and check availability without an account. However, you'll need to sign up (free!) to make a booking. You can register with email/password or sign in with Google.",
    keywords: ["account", "sign up", "register", "login", "sign in", "need to"],
    followUps: ["How do I reset my password?", "How do I book a court?"],
  },
  {
    question: "What are the available hours?",
    answer:
      "Courts are available for booking from 7:00 AM to 8:00 PM, in 1-hour time slots. Slots that are already booked will appear greyed out.",
    keywords: ["hours", "time", "when", "available", "open", "schedule", "slot"],
    followUps: ["How do I book a court?", "Can I book multiple slots?"],
  },
  {
    question: "Are there indoor courts?",
    answer:
      "Yes! We have indoor courts available — Downtown Indoor Arena ($35/hr) and Hilltop Tennis Center ($30/hr). Look for the 'indoor' badge on court cards. Perfect for rainy days!",
    keywords: ["indoor", "inside", "covered", "rain", "weather"],
    followUps: ["How much does it cost?", "What's the weather like?"],
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click 'Sign In', then click 'Forgot password?' below the password field. Enter your email and we'll send you a reset link. You can also change your password anytime from your Profile page.",
    keywords: ["password", "reset", "forgot", "change password", "lost"],
    followUps: ["Do I need an account?"],
  },
  {
    question: "Can I book multiple slots?",
    answer:
      "You can book one slot at a time. To book multiple hours, simply repeat the booking process for each time slot you want. Each slot is a separate booking that you can manage individually.",
    keywords: ["multiple", "several", "more than one", "two", "many", "consecutive"],
    followUps: ["How do I book a court?", "Can I cancel a booking?"],
  },
  {
    question: "Where are the courts located?",
    answer:
      "Each court has its address listed on the court card and detail page. We have courts across various locations — use the search bar on the homepage to find courts near you.",
    keywords: ["where", "location", "address", "near", "find", "directions"],
    followUps: ["Are there indoor courts?", "What surfaces are available?"],
  },
  {
    question: "Can I leave a review?",
    answer:
      "Yes! After visiting a court, go to the court's detail page and scroll down to the Reviews section. You can rate the court 1-5 stars and leave a comment. You need to be signed in to review.",
    keywords: ["review", "rate", "rating", "stars", "feedback", "comment"],
    followUps: ["Do I need an account?", "How do I book a court?"],
  },
];

// Levenshtein distance for fuzzy matching
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
  // For short keywords, require exact inclusion
  if (keyword.length <= 3) return input.includes(keyword);
  // For longer keywords, allow some edit distance
  const words = input.split(/\s+/);
  return words.some((w) => levenshtein(w, keyword) <= 2);
}

const GREETING: Message = {
  id: 0,
  text: "Hi there! 👋 I'm the CourtBook assistant. Ask me anything about booking courts, or pick a question below!",
  isBot: true,
  followUps: [
    "How do I book a court?",
    "How much does it cost?",
    "Can I cancel a booking?",
    "What are the available hours?",
  ],
};

function parseBookingIntent(input: string): { surface?: string; date?: string; hour?: number } | null {
  const lower = input.toLowerCase();
  if (!lower.includes("book")) return null;

  const result: { surface?: string; date?: string; hour?: number } = {};

  // Parse surface
  if (lower.includes("hard")) result.surface = "hard";
  else if (lower.includes("clay")) result.surface = "clay";
  else if (lower.includes("grass")) result.surface = "grass";

  // Parse date
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

  // Parse time
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

export function ChatBot() {
  const { user } = useAuth();
  const { bookings } = useUserBookings();
  const { addBooking } = useBookingActions();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Handle booking through chat
  async function handleBookingIntent(input: string): Promise<{ text: string; followUps?: string[] } | null> {
    const intent = parseBookingIntent(input);
    if (!intent) return null;
    if (!user) return { text: "You need to sign in before I can book a court for you!", followUps: ["Do I need an account?"] };

    // Default to today if no date
    const date = intent.date ?? new Date().toISOString().split("T")[0];
    const hour = intent.hour ?? 10; // default 10 AM

    // Find matching court
    let candidates = [...courts];
    if (intent.surface) {
      candidates = candidates.filter((c) => c.surface === intent.surface);
    }

    // Try each candidate until we find one with the slot available
    for (const court of candidates) {
      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("court_id", court.id)
        .eq("date", date)
        .eq("start_hour", hour);

      if ((data ?? []).length === 0) {
        // Slot is available — book it!
        const { error } = await addBooking(court.id, date, hour);
        if (error) {
          return { text: `I found an available slot but couldn't book it: ${error}`, followUps: ["How do I book a court?"] };
        }
        const h = hour;
        const time = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
        const dateStr = new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
        return {
          text: `Done! I booked ${court.name} (${court.surface}) for you on ${dateStr} at ${time}. 🎉\n\nPrice: $${court.hourlyRate}/hr\n\nYou can manage it from My Bookings.`,
          followUps: ["What's my next booking?", "Can I cancel a booking?"],
        };
      }
    }

    const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
    return {
      text: `Sorry, no ${intent.surface ? intent.surface + " " : ""}courts are available at ${time} on that date. Try a different time or surface!`,
      followUps: ["Show me cheap courts", "What are the available hours?"],
    };
  }

  // Dynamic answers based on user context
  function getDynamicAnswer(input: string): { text: string; followUps?: string[] } | null {
    const lower = input.toLowerCase();

    // "What's my next booking?"
    if (lower.includes("my next") || lower.includes("my booking") || lower.includes("upcoming")) {
      if (!user) return { text: "You're not signed in yet. Sign in to see your bookings!", followUps: ["Do I need an account?"] };
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

    // "How many bookings do I have?"
    if (lower.includes("how many") && lower.includes("booking")) {
      if (!user) return { text: "Sign in to track your bookings!", followUps: ["Do I need an account?"] };
      return { text: `You have ${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}.`, followUps: ["What's my next booking?", "Can I cancel a booking?"] };
    }

    // "Show me cheap courts" / "cheapest"
    if (lower.includes("cheap") || lower.includes("affordable") || lower.includes("budget")) {
      const sorted = [...courts].sort((a, b) => a.hourlyRate - b.hourlyRate);
      const top3 = sorted.slice(0, 3);
      return {
        text: `Here are the most affordable courts:\n\n${top3.map((c) => `${c.emoji} ${c.name} — $${c.hourlyRate}/hr (${c.surface})`).join("\n")}`,
        followUps: ["How do I book a court?", "What surfaces are available?"],
      };
    }

    // "Show me grass/clay/hard courts"
    for (const surface of ["grass", "clay", "hard"] as const) {
      if (lower.includes(surface)) {
        const matching = courts.filter((c) => c.surface === surface);
        if (matching.length > 0) {
          return {
            text: `Here are our ${surface} courts:\n\n${matching.map((c) => `${c.emoji} ${c.name} — $${c.hourlyRate}/hr${c.indoor ? " (indoor)" : ""}`).join("\n")}`,
            followUps: ["How much does it cost?", "Are there indoor courts?"],
          };
        }
      }
    }

    // "Show me indoor courts"
    if (lower.includes("indoor")) {
      const indoor = courts.filter((c) => c.indoor);
      return {
        text: `We have ${indoor.length} indoor courts:\n\n${indoor.map((c) => `${c.emoji} ${c.name} — $${c.hourlyRate}/hr (${c.surface})`).join("\n")}`,
        followUps: ["How do I book a court?", "What's the weather like?"],
      };
    }

    // Weather question
    if (lower.includes("weather") || lower.includes("rain") || lower.includes("forecast")) {
      return {
        text: "Each court's detail page shows a 3-day weather forecast. If rain is expected at an outdoor court, we'll suggest indoor alternatives automatically!",
        followUps: ["Are there indoor courts?", "How do I book a court?"],
      };
    }

    // Greeting
    if (lower.match(/^(hi|hello|hey|sup|yo|howdy|greetings)/)) {
      const name = user?.email?.split("@")[0] ?? "";
      return {
        text: `Hey${name ? ` ${name}` : ""}! 👋 How can I help you today?`,
        followUps: ["How do I book a court?", "What's my next booking?", "Show me cheap courts"],
      };
    }

    // Thanks
    if (lower.match(/^(thanks|thank you|thx|ty)/)) {
      return { text: "You're welcome! Let me know if there's anything else I can help with. 😊" };
    }

    return null;
  }

  function findAnswer(input: string): { text: string; followUps?: string[] } {
    // Try dynamic answers first
    const dynamic = getDynamicAnswer(input);
    if (dynamic) return dynamic;

    const lower = input.toLowerCase();

    // Exact question match
    const exactMatch = faqs.find((f) => f.question.toLowerCase() === lower);
    if (exactMatch) return { text: exactMatch.answer, followUps: exactMatch.followUps };

    // Keyword + fuzzy match
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

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: nextId.current++,
      text: text.trim(),
      isBot: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Check if it's a booking intent (async)
    const bookingIntent = parseBookingIntent(text);
    if (bookingIntent) {
      handleBookingIntent(text).then((result) => {
        const botMsg: Message = {
          id: nextId.current++,
          text: result?.text ?? "Something went wrong with the booking.",
          isBot: true,
          followUps: result?.followUps,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      });
      return;
    }

    setTimeout(() => {
      const { text: answer, followUps } = findAnswer(text);
      const botMsg: Message = {
        id: nextId.current++,
        text: answer,
        isBot: true,
        followUps,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  // Get the latest follow-ups
  const latestFollowUps = messages[messages.length - 1]?.followUps;

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎾</span>
              <div>
                <p className="font-semibold text-sm">CourtBook Assistant</p>
                <p className="text-emerald-100 text-xs">
                  {user ? `Hi, ${user.email?.split("@")[0]}` : "Always here to help"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.isBot
                        ? "bg-gray-100 text-gray-800 rounded-bl-md"
                        : "bg-emerald-600 text-white rounded-br-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex items-center gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </div>
              </div>
            )}

            {/* Follow-up suggestions */}
            {!isTyping && latestFollowUps && latestFollowUps.length > 0 && (
              <div className="space-y-2 pt-1">
                {latestFollowUps.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="block w-full text-left px-4 py-2.5 rounded-xl border border-emerald-200 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-gray-200 flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 flex items-center justify-center text-2xl z-50"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </>
  );
}
