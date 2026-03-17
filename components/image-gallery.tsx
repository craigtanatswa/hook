"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

type ImageGalleryProps = {
  images: string[];
  name: string;
  focalPoints?: string[];
};

function isVideo(url: string) {
  return /\.(mp4|mov|webm)(\?|$)/i.test(url);
}

export function ImageGallery({ images, name, focalPoints }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dist = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(dist) > 50) {
      dist > 0 ? next() : prev();
    }
  };

  if (images.length === 0) return null;

  const currentSrc = images[current];
  const currentIsVideo = isVideo(currentSrc);
  const currentFocalPoint = focalPoints?.[current] ?? "50% 50%";

  return (
    <div className="w-full" ref={containerRef}>
      {/* Main viewer */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl lg:rounded-3xl bg-muted touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentIsVideo ? (
          /*
           * key=currentSrc remounts the element when the source changes,
           * which resets + re-triggers autoPlay on every slide navigation.
           */
          <video
            key={currentSrc}
            src={currentSrc}
            autoPlay
            muted
            playsInline
            loop
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            key={currentSrc}
            src={currentSrc}
            alt={`${name} — photo ${current + 1}`}
            fill
            className="object-cover"
            style={{ objectPosition: currentFocalPoint }}
            priority={current === 0}
          />
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-background/70 hover:bg-background backdrop-blur-sm flex items-center justify-center shadow-lg transition-colors"
            >
              <ChevronLeft className="h-5 sm:h-6 w-5 sm:w-6 text-foreground" />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-background/70 hover:bg-background backdrop-blur-sm flex items-center justify-center shadow-lg transition-colors"
            >
              <ChevronRight className="h-5 sm:h-6 w-5 sm:w-6 text-foreground" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to ${isVideo(src) ? "video" : "photo"} ${i + 1}`}
                  className={`rounded-full transition-all ${
                    i === current
                      ? "h-2.5 w-7 bg-primary"
                      : "h-2.5 w-2.5 bg-background/60 hover:bg-background/80"
                  }`}
                />
              ))}
            </div>

            {/* Counter — show video icon when current is video */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs sm:text-sm font-medium text-foreground shadow">
              {currentIsVideo && <Film className="h-3.5 w-3.5 shrink-0" />}
              {current + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 px-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`View ${isVideo(src) ? "video" : "photo"} ${i + 1}`}
              className={`relative h-16 sm:h-20 w-16 sm:w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-primary shadow-md" : "border-border opacity-60 hover:opacity-80"
              }`}
            >
              {isVideo(src) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Film className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <Image src={src} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
