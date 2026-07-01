import { useState, useEffect } from "react";

interface GeoState {
  lat: number | null;
  lng: number | null;
  locating: boolean;
}

export function useGeolocation(): GeoState {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 5000 }
    );
  }, []);

  return { lat, lng, locating };
}
