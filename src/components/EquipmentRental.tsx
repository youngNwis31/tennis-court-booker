import { useState } from "react";

interface Equipment {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

const equipment: Equipment[] = [
  { id: "racket", name: "Tennis Racket", emoji: "🏸", price: 150 },
  { id: "balls", name: "Tennis Balls (can)", emoji: "🎾", price: 100 },
  { id: "towel", name: "Sports Towel", emoji: "🧺", price: 50 },
  { id: "water", name: "Water Bottle", emoji: "💧", price: 30 },
];

interface Props {
  onTotalChange?: (total: number) => void;
}

export function EquipmentRental({ onTotalChange }: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggleItem = (id: string) => {
    const newSelected = { ...selected };
    if (newSelected[id]) {
      delete newSelected[id];
    } else {
      newSelected[id] = 1;
    }
    setSelected(newSelected);
    const total = Object.entries(newSelected).reduce((sum, [itemId, qty]) => {
      const item = equipment.find((e) => e.id === itemId);
      return sum + (item?.price ?? 0) * qty;
    }, 0);
    onTotalChange?.(total);
  };

  const total = Object.entries(selected).reduce((sum, [itemId, qty]) => {
    const item = equipment.find((e) => e.id === itemId);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <span>🏸</span> Add Equipment Rental
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {equipment.map((item) => {
          const isSelected = !!selected[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-emerald-300"
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-emerald-600">+₱{item.price}</p>
              </div>
              {isSelected && (
                <span className="text-emerald-500 text-sm">✓</span>
              )}
            </button>
          );
        })}
      </div>
      {total > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Equipment total:</span>
          <span className="text-sm font-bold text-emerald-600">+₱{total}</span>
        </div>
      )}
    </div>
  );
}
