import { useState } from "react";
import { courts } from "../data/courts";
import { useToast } from "./Toast";

interface Props {
  courtId: string;
  date: string;
  hour: number;
}

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

export function ShareBooking({ courtId, date, hour }: Props) {
  const [showCard, setShowCard] = useState(false);
  const { showToast } = useToast();
  const court = courts.find((c) => c.id === courtId);
  if (!court) return null;

  const dateLabel = new Date(date + "T00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = formatHour(hour);

  const shareText = `Join me for tennis! 🎾\n\n📍 ${court.name}\n📅 ${dateLabel}\n⏰ ${time}\n💰 ₱${court.hourlyRate}/hr\n\nBook here: ${window.location.origin}/court/${court.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("Copied to clipboard!", "success");
    } catch {
      showToast("Could not copy to clipboard", "error");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tennis at ${court.name}`,
          text: shareText,
          url: `${window.location.origin}/court/${court.id}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowCard(!showCard)}
        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
      >
        📤 Share & Invite
      </button>

      {showCard && (
        <div className="mt-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">{court.emoji}</div>
            <div>
              <p className="font-bold text-lg">{court.name}</p>
              <p className="text-emerald-100 text-sm">{court.location}</p>
            </div>
          </div>

          <div className="bg-white/15 rounded-xl p-4 mb-4 space-y-1">
            <p className="text-sm">📅 {dateLabel}</p>
            <p className="text-sm">⏰ {time}</p>
            <p className="text-sm">💰 ₱{court.hourlyRate}/hr • {court.surface} court</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-2.5 rounded-xl bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              📤 Share
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
