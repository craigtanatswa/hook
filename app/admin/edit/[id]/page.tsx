import { notFound } from "next/navigation";
import { getAdvertById } from "@/lib/data";
import { AdvertForm } from "@/components/advert-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAdvertPage({ params }: Props) {
  const { id } = await params;
  const advert = getAdvertById(id);

  if (!advert) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/active"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Active Adverts
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Edit Advert</h1>
        <p className="text-sm text-muted-foreground mt-1">Editing advert for {advert.name}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <AdvertForm
          defaultValues={{
            name: advert.name,
            age: String(advert.age),
            location: advert.location,
            phone: advert.phone,
            whatsapp: advert.whatsapp,
            email: advert.email,
            description: advert.fullDescription,
          }}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
