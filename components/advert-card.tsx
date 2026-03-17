"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, Star, BadgeCheck, Film } from "lucide-react";
import type { Advert } from "@/lib/data";
import { ContactButtons } from "@/components/contact-buttons";

type AdvertCardProps = {
  advert: Advert;
};

function isVideo(url: string) {
  return /\.(mp4|mov|webm)(\?|$)/i.test(url);
}

export function AdvertCard({ advert }: AdvertCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSrc = advert.images[currentImageIndex] || advert.profileImage;
  const hasMultipleImages = advert.images.length > 1;
  const currentIsVideo = isVideo(currentSrc);
  const currentFocalPoint = advert.imageFocalPoints?.[currentImageIndex] ?? "50% 50%";

  // Auto-play when the current slide is a video (handles swipe-to on mobile)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (currentIsVideo) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [currentImageIndex, currentIsVideo]);

  // Play/pause when hovering changes (desktop)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentIsVideo) return;
    if (hovering) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovering, currentIsVideo]);

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
      {/* Media — portrait on mobile, landscape on desktop so full card fits on 15.6" screens */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/3] overflow-hidden bg-muted group"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Clicking the media area navigates to the detail page */}
        <Link href={`/adverts/${advert.id}`} className="block absolute inset-0 z-[1]" tabIndex={-1} aria-hidden />

        {currentIsVideo ? (
          <video
            ref={videoRef}
            key={currentSrc}
            src={currentSrc}
            muted
            playsInline
            loop
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={currentSrc}
            alt={`${advert.name} — photo ${currentImageIndex + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ objectPosition: currentFocalPoint }}
            priority={currentImageIndex === 0}
          />
        )}

        {/* Video play hint — shown when video is current but not yet hovered */}
        {currentIsVideo && !hovering && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
            <div className="h-11 w-11 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Film className="h-5 w-5 text-foreground" />
            </div>
          </div>
        )}

        {/* Featured badge */}
        {advert.featured && (
          <div className="absolute top-3 left-3 z-[3] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md pointer-events-none">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 z-[3] h-8 w-8 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-md"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-[3] h-8 w-8 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition-colors shadow-md"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[3] flex gap-1">
              {advert.images.map((src, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  aria-label={`Go to ${isVideo(src) ? "video" : "image"} ${index + 1}`}
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

      {/* Content below media */}
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

        {/* Meta */}
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

        {/* Trust indicators */}
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

        <div className="border-t border-border mb-4" />

        <ContactButtons phone={advert.phone} whatsapp={advert.whatsapp} email={advert.email} />
      </div>
    </div>
  );
}
