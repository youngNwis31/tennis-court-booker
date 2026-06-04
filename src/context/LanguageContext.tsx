import { createContext, useContext, useState } from "react";

type Lang = "en" | "fil";

const translations: Record<string, Record<Lang, string>> = {
  "find_court": { en: "Find Your Perfect Court", fil: "Hanapin ang Perpektong Court" },
  "courts_across": { en: "tennis courts across Metro Manila — book in seconds", fil: "tennis courts sa Metro Manila — mag-book sa isang segundo" },
  "cities": { en: "cities", fil: "lungsod" },
  "indoor_courts": { en: "indoor courts", fil: "indoor courts" },
  "from": { en: "From", fil: "Mula sa" },
  "search_placeholder": { en: "Search by name, location, or city...", fil: "Maghanap ayon sa pangalan, lokasyon, o lungsod..." },
  "all": { en: "All", fil: "Lahat" },
  "all_cities": { en: "All Cities", fil: "Lahat ng Lungsod" },
  "sort_default": { en: "Sort: Default", fil: "Ayusin: Default" },
  "sort_price_low": { en: "Price: Low to High", fil: "Presyo: Mababa to Mataas" },
  "sort_price_high": { en: "Price: High to Low", fil: "Presyo: Mataas to Mababa" },
  "sort_nearest": { en: "Nearest First", fil: "Pinakamalapit Muna" },
  "courts_found": { en: "courts found", fil: "courts ang nahanap" },
  "court_found": { en: "court found", fil: "court ang nahanap" },
  "no_courts": { en: "No courts match your search", fil: "Walang court na tumugma sa iyong paghahanap" },
  "book_session": { en: "Book a Session", fil: "Mag-book ng Session" },
  "select_date": { en: "Select Date", fil: "Pumili ng Petsa" },
  "available_slots": { en: "Available Time Slots", fil: "Mga Magagamit na Oras" },
  "confirm_booking": { en: "Confirm Booking", fil: "Kumpirmahin ang Booking" },
  "booking_confirmed": { en: "Booking confirmed!", fil: "Na-confirm ang booking!" },
  "my_bookings": { en: "My Bookings", fil: "Mga Booking Ko" },
  "upcoming": { en: "Upcoming", fil: "Paparating" },
  "past": { en: "Past", fil: "Nakaraan" },
  "no_bookings": { en: "No bookings yet", fil: "Wala pang booking" },
  "browse_courts": { en: "Browse courts", fil: "Mag-browse ng courts" },
  "cancel": { en: "Cancel", fil: "Kanselahin" },
  "sign_in": { en: "Sign In", fil: "Mag-sign In" },
  "sign_out": { en: "Sign Out", fil: "Mag-sign Out" },
  "sign_up": { en: "Sign Up", fil: "Mag-sign Up" },
  "welcome_back": { en: "Welcome back", fil: "Maligayang pagbabalik" },
  "profile": { en: "Profile", fil: "Profile" },
  "reviews": { en: "Reviews", fil: "Mga Review" },
  "leave_review": { en: "Leave a review", fil: "Mag-iwan ng review" },
  "post_review": { en: "Post Review", fil: "I-post ang Review" },
  "sign_in_to_book": { en: "Sign in to book this slot", fil: "Mag-sign in para mag-book" },
  "sign_in_to_review": { en: "Sign in to leave a review.", fil: "Mag-sign in para mag-review." },
  "no_reviews": { en: "No reviews yet — be the first!", fil: "Wala pang review — ikaw ang maunang mag-review!" },
  "back_to_courts": { en: "← Back to courts", fil: "← Bumalik sa mga court" },
  "per_hour": { en: "/hr", fil: "/oras" },
  "away": { en: "away", fil: "layo" },
  "courts": { en: "Courts", fil: "Courts" },
  "map": { en: "Map", fil: "Mapa" },
  "quiz": { en: "Quiz", fil: "Quiz" },
  "compare": { en: "Compare", fil: "Ihambing" },
  "favorites": { en: "Favorites", fil: "Mga Paborito" },
  "bookings": { en: "Bookings", fil: "Mga Booking" },
  "calendar": { en: "Calendar", fil: "Kalendaryo" },
  "stats": { en: "Stats", fil: "Mga Stats" },
  "partners": { en: "Partners", fil: "Mga Kasama" },
  "equipment": { en: "Equipment Rental", fil: "Paupa ng Kagamitan" },
  "racket": { en: "Tennis Racket", fil: "Tennis Racket" },
  "balls": { en: "Tennis Balls (can)", fil: "Tennis Balls (lata)" },
  "towel": { en: "Sports Towel", fil: "Sports Towel" },
  "water": { en: "Water Bottle", fil: "Bote ng Tubig" },
  "add_equipment": { en: "Add Equipment", fil: "Magdagdag ng Kagamitan" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "fil" ? "fil" : "en") as Lang;
  });

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
