import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, BadgeCheck } from "lucide-react";
import { AdvertShareButton } from "@/components/advert-share-button";
import { fetchAdvertByIdWithMedia, fetchActiveAdvertsWithMedia } from "@/lib/adverts-db";
import { ImageGallery } from "@/components/image-gallery";
import { ContactButtons } from "@/components/contact-buttons";
import { AdvertCard } from "@/components/advert-card";
import { RatingWidget } from "@/components/rating-widget";
import { formatAdvertLocation, type Advert } from "@/lib/data";

type Props = {
  params: Promise<{ id: string }>;
};

function suggestedFromList(all: Advert[], excludeId: string, limit: number) {
  return all.filter((a) => a.id !== excludeId && a.status === "active").slice(0, limit);
}

export default async function AdvertDetailPage({ params }: Props) {
  const { id } = await params;

  const advert = await fetchAdvertByIdWithMedia(id);
  if (!advert) notFound();

  const allActive = await fetchActiveAdvertsWithMedia();
  const suggested = suggestedFromList(allActive, advert.id, 6);

  const postedDate = new Date(advert.postedAt).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-muted-foreground/40 shrink-0">|</span>
          <span className="text-sm font-semibold text-foreground truncate min-w-0 flex-1">
            {advert.name}
          </span>
          <AdvertShareButton advertId={advert.id} advertName={advert.name} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 sm:pb-6">
        <div className="mb-6 -mx-4 sm:mx-0 sm:rounded-3xl overflow-hidden">
          <ImageGallery images={advert.images} name={advert.name} focalPoints={advert.imageFocalPoints} />
        </div>

        <section className="mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-foreground text-balance leading-tight">{advert.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">Age {advert.age}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-sm text-muted-foreground">{advert.gender}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-sm font-semibold text-foreground">{advert.bodyType}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{formatAdvertLocation(advert)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Posted {postedDate}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified escort
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
              Recently active
            </span>
          </div>
        </section>

        <section aria-label="Ratings" className="mb-6">
          <RatingWidget
            advertId={advert.id}
            initialAvg={advert.ratingAvg}
            initialCount={advert.ratingCount}
          />
        </section>

        <section aria-label="Services and boundaries" className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3">What they offer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {advert.fullDescription}
          </p>
        </section>

        {suggested.length > 0 && (
          <section aria-label="Other escorts you might like" className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-1">More freaks you&apos;ll want tonight</h2>
            <p className="text-sm text-muted-foreground mb-4">
              More listings worth your attention—same heat, different bodies.
            </p>
            <div className="flex flex-col gap-5">
              {suggested.map((a) => (
                <AdvertCard key={a.id} advert={a} />
              ))}
            </div>
          </section>
        )}

        <section aria-label="Book or message escort" className="hidden sm:block">
          <h2 className="text-lg font-bold text-foreground mb-4">Book the night</h2>
          <ContactButtons
            phone={advert.phone}
            whatsapp={advert.whatsapp}
            email={advert.email}
            size="large"
            advertId={advert.id}
          />
        </section>
      </main>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-t border-border px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-muted-foreground font-semibold mb-2 truncate">Message {advert.name}</p>
          <ContactButtons
            phone={advert.phone}
            whatsapp={advert.whatsapp}
            email={advert.email}
            advertId={advert.id}
          />
        </div>
      </div>
    </div>
  );
}
