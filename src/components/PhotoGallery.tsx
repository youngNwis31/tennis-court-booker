import { useState } from "react";

interface Props {
  photos: string[];
  alt: string;
}

export function PhotoGallery({ photos, alt }: Props) {
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-t-xl">
      <img
        src={photos[current]}
        alt={`${alt} - photo ${current + 1}`}
        className="w-full h-48 object-cover transition-opacity duration-300"
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrent((c) => (c - 1 + photos.length) % photos.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrent((c) => (c + 1) % photos.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 transition-colors"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
