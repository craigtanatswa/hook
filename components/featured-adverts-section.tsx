"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { Advert } from "@/lib/data";
import { ContactButtons } from "@/components/contact-buttons";

type FeaturedAdvertsSectionProps = {
  adverts: Advert[];
};

export function FeaturedAdvertsSection({ adverts }: FeaturedAdvertsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (adverts.length === 0) return null;

  const current = adverts[currentIndex];
  const goNext = () => setCurrentIndex((i) => (i + 1) % adverts.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + adverts.length) % adverts.length);

  return (
    <div className="mb-8 -mx-4 sm:mx-0">
      <Link href={`/adverts/${current.id}`}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-muted aspect-[16/9] sm:aspect-[16/10] group">
          {/* Main featured image */}
          <Image
            src={current.images[0] || current.profileImage}
            alt={`${current.name} — tonight’s pick`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority
          />

          {/* Featured badge overlay */}
          <div className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-lg">
            Featured
          </div>

          {/* Info overlay at bottom — darker gradient so white text stays readable on bright photos */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-16 sm:pt-20 p-4 sm:p-6">
            <h3 className="text-white text-lg sm:text-2xl font-bold text-balance mb-2 drop-shadow-sm">
              {current.name}
            </h3>
            <div className="flex items-center gap-2 text-white text-sm mb-3 drop-shadow-sm">
              <MapPin className="h-4 w-4" />
              <span>{current.location}</span>
              <span className="text-white/70">•</span>
              <span>{current.category}</span>
            </div>
            <p className="text-white/95 text-xs sm:text-sm line-clamp-2 mb-3 drop-shadow-sm">
              {current.shortDescription}
            </p>
          </div>

          {/* Navigation buttons - only show if multiple featured */}
          {adverts.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goPrev();
                }}
                aria-label="Previous featured"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goNext();
                }}
                aria-label="Next featured"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {adverts.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex(i);
                    }}
                    aria-label={`Go to featured ${i + 1}`}
                    className={`rounded-full transition-all ${
                      i === currentIndex
                        ? "h-2.5 w-7 bg-primary"
                        : "h-2.5 w-2.5 bg-background/60 hover:bg-background/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Quick contact buttons for featured */}
      <div className="px-4 sm:px-0 mt-4">
        <ContactButtons
          phone={current.phone}
          whatsapp={current.whatsapp}
          email={current.email}
          size="large"
        />
      </div>
    </div>
  );
}
