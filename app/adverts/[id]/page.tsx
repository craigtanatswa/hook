import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { getAdvertById } from "@/lib/data";
import { ImageGallery } from "@/components/image-gallery";
import { ContactButtons } from "@/components/contact-buttons";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdvertDetailPage({ params }: Props) {
  const { id } = await params;
  const advert = getAdvertById(id);

  if (!advert) {
    notFound();
  }

  const postedDate = new Date(advert.postedAt).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-sm font-semibold text-foreground truncate">{advert.name}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 sm:pb-6">
        {/* Image gallery — full width, primary focus */}
        <div className="mb-6 -mx-4 sm:mx-0 sm:rounded-3xl overflow-hidden">
          <ImageGallery images={advert.images} name={advert.name} />
        </div>

        {/* Provider info */}
        <section className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-foreground text-balance leading-tight">
                {advert.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-sm text-muted-foreground font-medium">Age {advert.age}</span>
                <span className="text-muted-foreground text-xs">•</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{advert.location}</span>
                </div>
              </div>
            </div>
            <span className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {advert.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Posted {postedDate}</span>
          </div>
        </section>

        {/* Full description */}
        <section aria-label="Service description" className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3">About this service</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {advert.fullDescription}
          </p>
        </section>

        {/* Contact section (desktop / inline) */}
        <section aria-label="Contact provider" className="hidden sm:block">
          <h2 className="text-lg font-bold text-foreground mb-4">Get in touch</h2>
          <ContactButtons
            phone={advert.phone}
            whatsapp={advert.whatsapp}
            email={advert.email}
            size="large"
          />
        </section>
      </main>

      {/* Sticky contact bar (mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-t border-border px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-muted-foreground font-semibold mb-2 truncate">
            Contact {advert.name}
          </p>
          <ContactButtons
            phone={advert.phone}
            whatsapp={advert.whatsapp}
            email={advert.email}
          />
        </div>
      </div>
    </div>
  );
}
