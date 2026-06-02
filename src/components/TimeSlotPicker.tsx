const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

interface Props {
  selectedHour: number | null;
  onSelect: (hour: number) => void;
  isSlotBooked: (hour: number) => boolean;
}

export function TimeSlotPicker({ selectedHour, onSelect, isSlotBooked }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {HOURS.map((hour) => {
        const booked = isSlotBooked(hour);
        const selected = selectedHour === hour;
        return (
          <button
            key={hour}
            disabled={booked}
            onClick={() => onSelect(hour)}
            className={`py-3 px-4 rounded-lg text-sm font-medium border transition-colors ${
              booked
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : selected
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"
            }`}
          >
            {formatHour(hour)}
            {booked && <span className="block text-xs mt-0.5">Booked</span>}
          </button>
        );
      })}
    </div>
  );
}
