import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    question: "How do I book a court?",
    answer:
      "Browse our courts on the homepage, click on one you like, pick a date, select an available time slot, and click 'Confirm Booking'. You'll need to be signed in to complete a booking.",
    keywords: ["book", "reserve", "how to", "make a booking", "schedule"],
  },
  {
    question: "How much does it cost?",
    answer:
      "Prices vary by court — from $25/hr for outdoor hard courts to $45/hr for grass courts. You can see the hourly rate on each court's card and detail page.",
    keywords: ["cost", "price", "how much", "rate", "fee", "pay", "expensive", "cheap"],
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes! Go to 'My Bookings' from the navigation bar, find the booking you want to cancel, and click the 'Cancel' button. The time slot will become available again immediately.",
    keywords: ["cancel", "refund", "remove", "delete", "undo"],
  },
  {
    question: "What court surfaces are available?",
    answer:
      "We offer three surface types: Hard courts (great for all levels), Clay courts (slower pace, easier on joints), and Grass courts (fast play, premium experience). Use the filter buttons on the homepage to browse by surface.",
    keywords: ["surface", "hard", "clay", "grass", "type", "kind"],
  },
  {
    question: "Do I need an account?",
    answer:
      "You can browse courts and check availability without an account. However, you'll need to sign up (free!) to make a booking. You can register with email/password or sign in with Google.",
    keywords: ["account", "sign up", "register", "login", "sign in", "need to"],
  },
  {
    question: "What are the available hours?",
    answer:
      "Courts are available for booking from 7:00 AM to 8:00 PM, in 1-hour time slots. Slots that are already booked will appear greyed out.",
    keywords: ["hours", "time", "when", "available", "open", "schedule", "slot"],
  },
  {
    question: "Are there indoor courts?",
    answer:
      "Yes! We have indoor courts available — look for the 'indoor' badge on court cards. Downtown Indoor Arena and Hilltop Tennis Center are both indoor facilities, perfect for rainy days.",
    keywords: ["indoor", "inside", "covered", "rain", "weather"],
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click 'Sign In', then click 'Forgot password?' below the password field. Enter your email and we'll send you a reset link. You can also change your password anytime from your Profile page.",
    keywords: ["password", "reset", "forgot", "change password", "lost"],
  },
  {
    question: "Can I book multiple slots?",
    answer:
      "You can book one slot at a time. To book multiple hours, simply repeat the booking process for each time slot you want. Each slot is a separate booking that you can manage individually.",
    keywords: ["multiple", "several", "more than one", "two", "many", "consecutive"],
  },
  {
    question: "Where are the courts located?",
    answer:
      "Each court has its address listed on the court card and detail page. We have courts across various locations — use the search bar on the homepage to find courts near you by searching for a location.",
    keywords: ["where", "location", "address", "near", "find", "directions"],
  },
];

const GREETING: Message = {
  id: 0,
  text: "Hi there! 👋 I'm the CourtBook assistant. Ask me anything about booking courts, or pick a question below!",
  isBot: true,
};

const suggestedQuestions = [
  "How do I book a court?",
  "How much does it cost?",
  "Can I cancel a booking?",
  "What are the available hours?",
];

function findAnswer(input: string): string {
  const lower = input.toLowerCase();

  // Direct question match
  const exactMatch = faqs.find(
    (f) => f.question.toLowerCase() === lower
  );
  if (exactMatch) return exactMatch.answer;

  // Keyword match - score each FAQ
  let bestMatch: FAQ | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length; // longer keyword matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) return bestMatch.answer;

  return "I'm not sure about that one! Here are some things I can help with:\n\n• How to book a court\n• Pricing information\n• Cancellation policy\n• Court surfaces & facilities\n• Account & password help\n\nTry asking about any of these topics!";
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

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

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(text);
      const botMsg: Message = {
        id: nextId.current++,
        text: answer,
        isBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎾</span>
              <div>
                <p className="font-semibold text-sm">CourtBook Assistant</p>
                <p className="text-emerald-100 text-xs">Always here to help</p>
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
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
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

            {/* Suggested questions (show after greeting only) */}
            {messages.length === 1 && !isTyping && (
              <div className="space-y-2 pt-2">
                {suggestedQuestions.map((q) => (
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
