import { useState } from "react";
import { Link } from "react-router-dom";
import { courts } from "../data/courts";
import type { Court } from "../types";

interface Question {
  id: string;
  text: string;
  options: { label: string; emoji: string; value: string }[];
}

const questions: Question[] = [
  {
    id: "budget",
    text: "What's your budget per hour?",
    options: [
      { label: "Under ₱150", emoji: "💰", value: "low" },
      { label: "₱150 - ₱400", emoji: "💵", value: "mid" },
      { label: "₱400+", emoji: "💎", value: "high" },
      { label: "No limit", emoji: "🤑", value: "any" },
    ],
  },
  {
    id: "environment",
    text: "Indoor or outdoor?",
    options: [
      { label: "Indoor", emoji: "🏢", value: "indoor" },
      { label: "Outdoor", emoji: "☀️", value: "outdoor" },
      { label: "Either", emoji: "🤷", value: "any" },
    ],
  },
  {
    id: "surface",
    text: "What surface do you prefer?",
    options: [
      { label: "Hard Court", emoji: "🏟️", value: "hard" },
      { label: "Clay", emoji: "🧱", value: "clay" },
      { label: "Grass", emoji: "🌱", value: "grass" },
      { label: "Any", emoji: "🎾", value: "any" },
    ],
  },
  {
    id: "location",
    text: "Which area is most convenient?",
    options: [
      { label: "Manila / Pasay", emoji: "🏛️", value: "manila" },
      { label: "Makati / BGC", emoji: "🏙️", value: "makati" },
      { label: "QC / Marikina", emoji: "🌳", value: "qc" },
      { label: "South (Muntinlupa)", emoji: "🌴", value: "south" },
    ],
  },
  {
    id: "vibe",
    text: "What kind of experience do you want?",
    options: [
      { label: "Budget-friendly", emoji: "🎯", value: "budget" },
      { label: "Premium", emoji: "✨", value: "premium" },
      { label: "Casual & fun", emoji: "😎", value: "casual" },
      { label: "Competitive", emoji: "🏆", value: "competitive" },
    ],
  },
];

function scoreCourt(court: Court, answers: Record<string, string>): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Budget
  if (answers.budget === "low" && court.hourlyRate <= 150) { score += 25; reasons.push("Within budget"); }
  else if (answers.budget === "mid" && court.hourlyRate > 150 && court.hourlyRate <= 400) { score += 25; reasons.push("Within budget"); }
  else if (answers.budget === "high" && court.hourlyRate > 400) { score += 25; reasons.push("Premium court"); }
  else if (answers.budget === "any") { score += 15; }
  else { score -= 10; }

  // Environment
  if (answers.environment === "indoor" && court.indoor) { score += 20; reasons.push("Indoor court"); }
  else if (answers.environment === "outdoor" && !court.indoor) { score += 20; reasons.push("Outdoor court"); }
  else if (answers.environment === "any") { score += 10; }

  // Surface
  if (answers.surface === court.surface) { score += 20; reasons.push(`${court.surface} surface`); }
  else if (answers.surface === "any") { score += 10; }

  // Location
  const cityMap: Record<string, string[]> = {
    manila: ["Manila", "Pasay"],
    makati: ["Makati", "Taguig"],
    qc: ["Quezon City", "Marikina", "San Juan", "Mandaluyong", "Pasig"],
    south: ["Muntinlupa", "Las Piñas", "Parañaque"],
  };
  if (answers.location && cityMap[answers.location]?.includes(court.city)) {
    score += 20;
    reasons.push(`Located in ${court.city}`);
  }

  // Vibe
  if (answers.vibe === "budget" && court.hourlyRate <= 150) { score += 15; reasons.push("Great value"); }
  if (answers.vibe === "premium" && court.hourlyRate >= 400) { score += 15; reasons.push("Premium experience"); }
  if (answers.vibe === "casual") { score += 10; }
  if (answers.vibe === "competitive" && !court.indoor) { score += 10; }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{ court: Court; score: number; reasons: string[] }[] | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate results
      const scored = courts
        .map((court) => {
          const { score, reasons } = scoreCourt(court, newAnswers);
          return { court, score, reasons };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setResults(scored);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  if (results) {
    return (
      <div>
        <div className="text-center mb-8">
          <span className="text-5xl">🎾</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Your Perfect Courts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Based on your preferences, here are our AI recommendations</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {results.map(({ court, score, reasons }, i) => (
            <div
              key={court.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-5 flex items-center gap-4 ${
                i === 0 ? "border-emerald-400 shadow-lg" : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {i === 0 && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  Best Match
                </div>
              )}
              <div className="relative">
                <img
                  src={court.photos[0]}
                  alt={court.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                {i === 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                    1
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{court.name}</h3>
                  <span className="text-sm font-bold text-emerald-600">{score}% match</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{court.city} • ₱{court.hourlyRate}/hr • {court.surface}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {reasons.map((r, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/court/${court.id}`}
                className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Book
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button onClick={reset} className="text-emerald-600 hover:underline text-sm font-medium">
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <span className="text-5xl">🤖</span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Court Recommender</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Answer {questions.length} quick questions to find your perfect court</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-xs text-emerald-600 font-semibold mb-2">
          Question {step + 1} of {questions.length}
        </p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{q.text}</h2>

        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(q.id, opt.value)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium text-gray-900 dark:text-white">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
