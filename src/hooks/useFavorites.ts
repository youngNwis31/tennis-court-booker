import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "../config/constants";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  const toggleFavorite = useCallback((courtId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(courtId)
        ? prev.filter((id) => id !== courtId)
        : [...prev, courtId];
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (courtId: string) => favorites.includes(courtId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
