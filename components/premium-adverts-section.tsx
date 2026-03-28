"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { formatAdvertLocation, type Advert } from "@/lib/data";
import { ContactButtons } from "@/components/contact-buttons";
import { MetallicBadge } from "@/components/metallic-badge";

type PremiumAdvertsSectionProps = {
  adverts: Advert[];
};

export function PremiumAdvertsSection({ adverts }: PremiumAdvertsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (adverts.length === 0) return null;

  useEffect(() => {
    if (currentIndex >= adverts.length) setCurrentIndex(0);
  }, [adverts.length, currentIndex]);

  const current = adverts[currentIndex];
  const goNext = () => setCurrentIndex((i) => (i + 1) % adverts.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + adverts.length) % adverts.length);

  return (
    <div className="mb-8 -mx-4 sm:mx-0">
      <Link href={`/adverts/${current.id}`}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-muted aspect-[16/9] sm:aspect-[16/10] group">
          <Image
            src={current.images[0] || current.profileImage}
            alt={`${current.name} — premium spotlight`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority
          />

          <div className="absolute top-4 left-4 z-[2]">
            <MetallicBadge variant="premium">Premium</MetallicBadge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-16 sm:pt-20 p-4 sm:p-6">
            <h3 className="text-white text-lg sm:text-2xl font-bold text-balance mb-2 drop-shadow-sm">
              {current.name}
            </h3>
            <div className="flex items-center gap-2 text-white text-sm mb-3 drop-shadow-sm">
              <MapPin className="h-4 w-4" />
              <span>{formatAdvertLocation(current)}</span>
            </div>
            <p className="text-white/95 text-xs sm:text-sm line-clamp-2 mb-3 drop-shadow-sm">
              {current.shortDescription}
            </p>
          </div>

          {adverts.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goPrev();
                }}
                aria-label="Previous premium profile"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-[3] h-10 w-10 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goNext();
                }}
                aria-label="Next premium profile"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] h-10 w-10 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[3]">
                {adverts.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex(i);
                    }}
                    aria-label={`Go to premium profile ${i + 1}`}
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
