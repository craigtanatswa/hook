import { AdvertForm } from "@/components/advert-form";
import { createAdvertAction } from "@/app/actions/adverts";

export default function CreateAdvertPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">New cuddler listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below and upload at least one photo to publish.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <AdvertForm action={createAdvertAction} submitLabel="Publish listing" />
      </div>
    </div>
  );
}
