import { useState, useRef, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useUserBookings, useBookingActions } from "../hooks/useBookings";
import { courts } from "../data/courts";
import { findAnswer, parseBookingIntent } from "../services/chatbot";
import * as bookingService from "../services/booking";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  followUps?: string[];
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

  async function handleBookingIntent(text: string): Promise<{ text: string; followUps?: string[] }> {
    const intent = parseBookingIntent(text);
    if (!intent) return { text: "Something went wrong." };
    if (!user) return { text: "You need to sign in before I can book a court for you!", followUps: ["Do I need an account?"] };

    const date = intent.date ?? new Date().toISOString().split("T")[0];
    const hour = intent.hour ?? 10;

    let candidates = [...courts];
    if (intent.surface) {
      candidates = candidates.filter((c) => c.surface === intent.surface);
    }

    for (const court of candidates) {
      const available = await bookingService.isSlotAvailable(court.id, date, hour);
      if (available) {
        const { error } = await addBooking(court.id, date, hour);
        if (error) {
          return { text: `I found an available slot but couldn't book it: ${error}`, followUps: ["How do I book a court?"] };
        }
        const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
        const dateStr = new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
        return {
          text: `Done! I booked ${court.name} (${court.surface}) for you on ${dateStr} at ${time}. 🎉\n\nPrice: ₱${court.hourlyRate}/hr\n\nYou can manage it from My Bookings.`,
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

    const intent = parseBookingIntent(text);
    if (intent) {
      handleBookingIntent(text).then((result) => {
        const botMsg: Message = {
          id: nextId.current++,
          text: result.text,
          isBot: true,
          followUps: result.followUps,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      });
      return;
    }

    setTimeout(() => {
      const { text: answer, followUps } = findAnswer(text, user?.email ?? null, bookings, courts);
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

  const latestFollowUps = messages[messages.length - 1]?.followUps;

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
          style={{ height: "520px" }}
        >
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

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.isBot
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md"
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
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex items-center gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </div>
              </div>
            )}

            {!isTyping && latestFollowUps && latestFollowUps.length > 0 && (
              <div className="space-y-2 pt-1">
                {latestFollowUps.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="block w-full text-left px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 text-sm text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 flex items-center justify-center text-2xl z-50"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </>
  );
}
