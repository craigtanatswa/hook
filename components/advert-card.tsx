"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, Star, BadgeCheck } from "lucide-react";
import type { Advert } from "@/lib/data";
import { ContactButtons } from "@/components/contact-buttons";

type AdvertCardProps = {
  advert: Advert;
};

export function AdvertCard({ advert }: AdvertCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mainImage = advert.images[currentImageIndex] || advert.profileImage;
  const hasMultipleImages = advert.images.length > 1;

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + advert.images.length) % advert.images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((next) => (next + 1) % advert.images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image — full width, 16:9 ratio */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted group">
        <Link href={`/adverts/${advert.id}`} className="block absolute inset-0">
          <Image
            src={mainImage}
            alt={`${advert.name} — photo ${currentImageIndex + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={currentImageIndex === 0}
          />
        </Link>

        {/* Featured badge */}
        {advert.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md pointer-events-none">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </div>
        )}

        {/* Carousel controls */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-md"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-md"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {advert.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  aria-label={`Go to image ${index + 1}`}
                  className={`rounded-full transition-all ${
                    index === currentImageIndex
                      ? "h-2 w-6 bg-primary"
                      : "h-2 w-2 bg-background/60 hover:bg-background/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content below image */}
      <div className="p-4 sm:p-5">
        {/* Header row: name + category badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link href={`/adverts/${advert.id}`} className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground text-lg sm:text-xl leading-tight hover:text-primary transition-colors">
              {advert.name}
            </h2>
          </Link>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold border border-border">
            {advert.category}
          </span>
        </div>

        {/* Meta: age, gender, body type + location */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-sm text-muted-foreground">
          <span>Age {advert.age}</span>
          <span aria-hidden>·</span>
          <span>{advert.gender}</span>
          <span aria-hidden>·</span>
          <span className="text-foreground/90 font-medium">{advert.bodyType}</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1 min-w-0 basis-full sm:basis-auto">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{advert.location}</span>
          </span>
        </div>

        {/* Trust indicators — context: verified, rating placeholder, recently active */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <Star className="h-3 w-3" />
            Fresh on Hook
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {advert.shortDescription}
        </p>

        {/* Divider */}
        <div className="border-t border-border mb-4" />

        {/* Contact buttons */}
        <ContactButtons phone={advert.phone} whatsapp={advert.whatsapp} email={advert.email} />
      </div>
    </div>
  );
}
