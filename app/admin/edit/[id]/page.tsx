import { notFound } from "next/navigation";
import { getAdvertById } from "@/lib/data";
import { fetchAdvertByIdWithMedia } from "@/lib/adverts-db";
import { AdvertForm } from "@/components/advert-form";
import { updateAdvertAction } from "@/app/actions/adverts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default async function EditAdvertPage({ params }: Props) {
  const { id } = await params;

  let advert = null;
  if (isUuid(id)) {
    advert = await fetchAdvertByIdWithMedia(id);
  }
  if (!advert) {
    advert = getAdvertById(id);
  }
  if (!advert) notFound();

  const boundUpdate = updateAdvertAction.bind(null, advert.id);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/active"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to live profiles
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Edit listing</h1>
        <p className="text-sm text-muted-foreground mt-1">Tweaking {advert.name}&apos;s profile</p>
        {!isUuid(id) && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
            Legacy ID — saving will fail until this listing exists in Supabase. Create a new listing with DB URLs
            instead.
          </p>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <AdvertForm
          advertId={isUuid(advert.id) ? advert.id : undefined}
          action={isUuid(advert.id) ? boundUpdate : undefined}
          defaultValues={{
            name: advert.name,
            age: String(advert.age),
            location: advert.location,
            gender: advert.gender,
            bodyType: advert.bodyType,
            category: advert.category,
            phone: advert.phone,
            whatsapp: advert.whatsapp,
            email: advert.email,
            description: advert.fullDescription,
            mediaUrls: advert.images.join("\n"),
            featured: advert.featured ? "true" : undefined,
          }}
          submitLabel={isUuid(advert.id) ? "Save changes" : "Legacy — use DB listing"}
        />
      </div>
    </div>
  );
}
